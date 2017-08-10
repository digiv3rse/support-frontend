package controllers

import actions.{CacheControl, CustomActionBuilders}
import assets.AssetsResolver
import play.api.mvc._
import play.api.libs.circe.Circe

import scala.concurrent.ExecutionContext
import services.{IdentityService, TestUserService}
import com.typesafe.scalalogging.LazyLogging
import views.html.oneOffContributions
import com.gu.support.config.StripeConfigProvider
import cats.implicits._
import com.gu.googleauth.AuthAction
import com.gu.identity.play.IdUser
import models.Autofill
import io.circe.syntax._

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
)(implicit val exec: ExecutionContext) extends AbstractController(components) with Circe with LazyLogging {

  import actionRefiners._

  implicit val ar = assets

  def displayForm(paypal: Option[Boolean]): Action[AnyContent] = CachedAction() {
    form(uatMode = false, paypal)
  }

  def displayFormTestUser(paypal: Option[Boolean]): Action[AnyContent] = authAction {
    form(uatMode = true, paypal).withHeaders(CacheControl.noCache)
  }

  def autofill: Action[AnyContent] = AuthenticatedAction.async { implicit request =>
    identityService.getUser(request.user).fold(
      _ => Ok(Autofill.empty.asJson),
      user => Ok(Autofill(fullNameFor(user), Some(user.primaryEmailAddress)).asJson)
    )
  }

  private def form(uatMode: Boolean, paypal: Option[Boolean]): Result = Ok(
    oneOffContributions(
      title = "Support the Guardian | One-off Contribution",
      id = "oneoff-contributions-page",
      js = "oneoffContributionsPage.js",
      uatMode = uatMode,
      payPalButton = paypal.getOrElse(false),
      stripeConfig = stripeConfigProvider.get(uatMode),
      contributionsStripeEndpoint = contributionsStripeEndpoint,
      contributionsPayPalEndpoint = contributionsPayPalEndpoint
    )
  )

  private def fullNameFor(user: IdUser): Option[String] = {
    for {
      privateFields <- user.privateFields
      firstName <- privateFields.firstName
      secondName <- privateFields.secondName
    } yield s"$firstName $secondName"
  }
}
