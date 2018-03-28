package controllers

import actions.CustomActionBuilders
import assets.AssetsResolver
import play.api.mvc._
import play.api.libs.circe.Circe

import scala.concurrent.{ExecutionContext, Future}
import services.{IdentityService, TestUserService}
import views.html.oneOffContributions
import com.gu.support.config.StripeConfigProvider
import cats.implicits._
import com.gu.googleauth.AuthAction
import com.gu.identity.play.{AuthenticatedIdUser, IdUser}
import models.Autofill
import io.circe.syntax._
import play.twirl.api.Html
import views.html.thankYou

class OneOffContributions(
    val assets: AssetsResolver,
    actionRefiners: CustomActionBuilders,
    identityService: IdentityService,
    testUsers: TestUserService,
    stripeConfigProvider: StripeConfigProvider,
    contributionsStripeEndpoint: String,
    contributionsPayPalEndpoint: String,
    authAction: AuthAction[AnyContent],
    components: ControllerComponents
)(implicit val exec: ExecutionContext) extends AbstractController(components) with Circe {

  import actionRefiners._

  implicit val ar = assets

  def autofill: Action[AnyContent] = AuthenticatedAction.async { implicit request =>
    identityService.getUser(request.user).fold(
      _ => Ok(Autofill.empty.asJson),
      user => Ok(Autofill(id = Some(user.id), name = fullNameFor(user), email = Some(user.primaryEmailAddress)).asJson)
    )
  }

  def formHtml(idUser: Option[IdUser], paypal: Option[Boolean])(implicit request: RequestHeader): Html = {
    oneOffContributions(
      title = "Support the Guardian | One-off Contribution",
      id = "oneoff-contributions-page",
      js = "oneoffContributionsPage.js",
      payPalButton = paypal.getOrElse(true),
      defaultStripeConfig = stripeConfigProvider.get(false),
      uatStripeConfig = stripeConfigProvider.get(true),
      contributionsStripeEndpoint = contributionsStripeEndpoint,
      contributionsPayPalEndpoint = contributionsPayPalEndpoint,
      idUser = idUser
    )
  }

  def displayForm(paypal: Option[Boolean]): Action[AnyContent] = MaybeAuthenticatedAction.async { implicit request =>
    request.user.fold {
      Future.successful(Ok(formHtml(None, paypal)))
    } { minimalUser =>
      {
        identityService.getUser(minimalUser).fold(
          _ => Ok(formHtml(None, paypal)),
          user => Ok(formHtml(Some(user), paypal))
        )
      }
    }
  }

  def thankYouPage(): Action[AnyContent] = PrivateAction { implicit request =>
    Ok(
      thankYou(
        title = "Support the Guardian | Thank You",
        id = "contributions-thank-you-page",
        js = "contributionsThankYouPage.js",
        email = request.flash.get("email")
      )
    )
  }

  private def fullNameFor(user: IdUser): Option[String] = {
    for {
      privateFields <- user.privateFields
      firstName <- privateFields.firstName
      secondName <- privateFields.secondName
    } yield s"$firstName $secondName"
  }
}
