package controllers

import actions.CustomActionBuilders
import admin.settings.AllSettings
import cats.data.EitherT
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import io.circe.syntax._
import com.gu.monitoring.SafeLogger
import com.gu.monitoring.SafeLogger._
import play.api.mvc._
import play.api.libs.circe.Circe
import services.{GetUserTypeResponse, IdentityService}
import cats.implicits._
import config.Configuration.GuardianDomain
import models.identity.responses.SetGuestPasswordResponseCookies
import codecs.CirceDecoders._
import com.gu.identity.play.{IdMinimalUser, IdUser}
import services.paypal.PayPalBillingDetails

import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try

class IdentityController(
    identityService: IdentityService,
    components: ControllerComponents,
    actionRefiners: CustomActionBuilders,
    guardianDomain: GuardianDomain,
    warn: () => Try[Unit]
)(implicit ec: ExecutionContext)
  extends AbstractController(components) with Circe {

  import actionRefiners._

  def warnAndReturn(): Status =
    warn().fold({ t =>
      SafeLogger.error(scrub"failed to send metrics", t)
      InternalServerError
    }, _ => NotFound)

  def submitMarketing(): Action[SendMarketingRequest] = PrivateAction.async(circe.json[SendMarketingRequest]) { implicit request =>
    val result = identityService.sendConsentPreferencesEmail(request.body.email)
    result.map { res =>
      if (res) {
        SafeLogger.info(s"Successfully sent consents preferences email for ${request.body.email}")
        Ok
      } else {
        warnAndReturn()
      }
    }
  }

  def setPasswordGuest(): Action[SetPasswordRequest] = PrivateAction.async(circe.json[SetPasswordRequest]) { implicit request =>
    identityService
      .setPasswordGuest(request.body.password, request.body.guestAccountRegistrationToken)
      .fold(
        err => {
          SafeLogger.error(scrub"Failed to set password using guest account registration token ${request.body.guestAccountRegistrationToken}: ${err.toString}")
          warnAndReturn()
        },
        cookiesFromResponse => {
          SafeLogger.info(s"Successfully set password using guest account registration token ${request.body.guestAccountRegistrationToken}")
          Ok.withCookies(SetGuestPasswordResponseCookies.getCookies(cookiesFromResponse, guardianDomain): _*)
        }
      )
  }

  def getUserType(maybeEmail: Option[String]): Action[AnyContent] = PrivateAction.async { implicit request =>
    maybeEmail.fold {
      SafeLogger.error(scrub"No email provided")
      Future.successful(BadRequest("No email provided"))
    } { email =>
      identityService
        .getUserType(email)
        .fold(
          err => {
            SafeLogger.error(scrub"Failed to retrieve user type for $email: ${err.toString}")
            InternalServerError
          },
          response => {
            SafeLogger.info(s"Successfully retrieved user type for $email")
            SafeLogger.info(s"USERTYPE: $response")
            Ok(response.asJson)
          }
        )
    }
  }

  def getUser(): Action[AnyContent] = maybeAuthenticatedAction().async { implicit request => {
    type Attempt[A] = EitherT[Future, String, A]
    request.user.traverse[Attempt, IdUser](identityService.getUser(_)).fold(
      _ => Ok("no"),
      user => Ok(user.toString)
    )
  }
  }

}


object SendMarketingRequest {
  implicit val decoder: Decoder[SendMarketingRequest] = deriveDecoder
}
case class SendMarketingRequest(email: String)

object SetPasswordRequest {
  implicit val decoder: Decoder[SetPasswordRequest] = deriveDecoder
}
case class SetPasswordRequest(password: String, guestAccountRegistrationToken: String)
