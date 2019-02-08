package controllers

import actions.CustomActionBuilders
import actions.CustomActionBuilders.AuthRequest
import admin.settings.{AllSettings, AllSettingsProvider, SettingsSurrogateKeySyntax}
import assets.AssetsResolver
import cats.data.EitherT
import cats.implicits._
import com.gu.identity.play.IdUser
import com.gu.support.catalog.DigitalPack
import com.gu.support.config.{PayPalConfigProvider, StripeConfigProvider}
import com.gu.support.pricing.PriceSummaryServiceProvider
import com.gu.support.workers.{BillingPeriod, User}
import com.gu.tip.Tip
import config.Configuration.GuardianDomain
import config.StringsConfig
import io.circe.syntax._
import lib.PlayImplicits._
import monitoring.SafeLogger
import monitoring.SafeLogger._
import play.api.libs.circe.Circe
import play.api.mvc.{request, _}
import play.twirl.api.Html
import services.stepfunctions.{CreateSupportWorkersRequest, StatusResponse, SupportWorkersClient}
import services.{IdentityService, TestUserService}
import views.html.digitalSubscription
import views.html.helper.CSRF
import utils.SimpleValidator._

import scala.concurrent.{ExecutionContext, Future}

class DigitalSubscription(
    priceSummaryServiceProvider: PriceSummaryServiceProvider,
    client: SupportWorkersClient,
    val assets: AssetsResolver,
    val actionRefiners: CustomActionBuilders,
    identityService: IdentityService,
    testUsers: TestUserService,
    stripeConfigProvider: StripeConfigProvider,
    payPalConfigProvider: PayPalConfigProvider,
    components: ControllerComponents,
    stringsConfig: StringsConfig,
    settingsProvider: AllSettingsProvider,
    val supportUrl: String,
    tipMonitoring: Tip,
    guardianDomain: GuardianDomain
)(implicit val ec: ExecutionContext) extends AbstractController(components) with GeoRedirect with CanonicalLinks with Circe with SettingsSurrogateKeySyntax {

  import actionRefiners._

  implicit val a: AssetsResolver = assets

  def digital(countryCode: String): Action[AnyContent] = CachedAction() { implicit request =>
    implicit val settings: AllSettings = settingsProvider.getAllSettings()
    val title = "Support the Guardian | Digital Pack Subscription"
    val id = "digital-subscription-landing-page-" + countryCode
    val js = "digitalSubscriptionLandingPage.js"
    val css = "digitalSubscriptionLandingPage.css"
    val description = stringsConfig.digitalPackLandingDescription
    val canonicalLink = Some(buildCanonicalDigitalSubscriptionLink("uk"))
    val hrefLangLinks = Map(
      "en-us" -> buildCanonicalDigitalSubscriptionLink("us"),
      "en-gb" -> buildCanonicalDigitalSubscriptionLink("uk"),
      "en-au" -> buildCanonicalDigitalSubscriptionLink("au"),
      "en" -> buildCanonicalDigitalSubscriptionLink("int")
    )

    Ok(views.html.main(title, id, js, css, description, canonicalLink, hrefLangLinks)).withSettingsSurrogateKey
  }

  def digitalGeoRedirect: Action[AnyContent] = geoRedirect("subscribe/digital")

  def displayForm(): Action[AnyContent] =
    authenticatedAction(subscriptionsClientId).async { implicit request =>
      implicit val settings: AllSettings = settingsProvider.getAllSettings()
      identityService.getUser(request.user).fold(
        error => {
          SafeLogger.error(scrub"Failed to display digital subscriptions form for ${request.user.id} due to error from identityService: $error")
          InternalServerError
        },
        user => Ok(digitalSubscriptionFormHtml(user))
      ).map(_.withSettingsSurrogateKey)
    }

  private def digitalSubscriptionFormHtml(idUser: IdUser)(implicit request: RequestHeader, settings: AllSettings): Html = {
    val title = "Support the Guardian | Digital Subscription"
    val id = "digital-subscription-checkout-page"
    val js = "digitalSubscriptionCheckoutPage.js"
    val css = "digitalSubscriptionCheckoutPage.css"
    val csrf = CSRF.getToken.value
    val uatMode = testUsers.isTestUser(idUser.publicFields.displayName)
    val promoCode = request.queryString.get("promoCode").flatMap(_.headOption)

    digitalSubscription(
      title,
      id,
      js,
      css,
      Some(csrf),
      idUser,
      uatMode,
      priceSummaryServiceProvider.forUser(uatMode).getPrices(DigitalPack, promoCode),
      stripeConfigProvider.get(false),
      stripeConfigProvider.get(true),
      payPalConfigProvider.get(uatMode)
    )
  }

  sealed abstract class CreateDigitalSubscriptionError(message: String)
  case class ServerError(message: String) extends CreateDigitalSubscriptionError(message)
  case class RequestValidationError(message: String) extends CreateDigitalSubscriptionError(message)

  def create: Action[CreateSupportWorkersRequest] =
    authenticatedAction(recurringIdentityClientId).async(circe.json[CreateSupportWorkersRequest]) {
      implicit request: AuthRequest[CreateSupportWorkersRequest] =>
        val billingPeriod = request.body.product.billingPeriod
        SafeLogger.info(s"[${request.uuid}] User ${request.user.id} is attempting to create a new $billingPeriod digital subscription")

        type ApiResponseOrError[RES] = EitherT[Future, CreateDigitalSubscriptionError, RES]

        if (validationPasses(request.body)) {
          val userOrError: ApiResponseOrError[IdUser] = identityService.getUser(request.user).leftMap(ServerError(_))
          def subscriptionStatusOrError(idUser: IdUser): ApiResponseOrError[StatusResponse] = {
            client.createSubscription(request, createUser(idUser, request.body), request.uuid).leftMap(error => ServerError(error.toString))
          }

          val result: ApiResponseOrError[StatusResponse] = for {
            user <- userOrError
            statusResponse <- subscriptionStatusOrError(user)
          } yield statusResponse

          respondToClient(result, request.body.product.billingPeriod)
        } else {
          respondToClient(EitherT.leftT(RequestValidationError("validation of the request body failed")), request.body.product.billingPeriod)
        }

    }

  private def createUser(user: IdUser, request: CreateSupportWorkersRequest) = {
    User(
      id = user.id,
      primaryEmailAddress = user.primaryEmailAddress,
      firstName = request.firstName,
      lastName = request.lastName,
      country = request.country,
      state = request.state,
      telephoneNumber = request.telephoneNumber,
      allowMembershipMail = false,
      allowThirdPartyMail = user.statusFields.flatMap(_.receive3rdPartyMarketing).getOrElse(false),
      allowGURelatedMail = user.statusFields.flatMap(_.receiveGnmMarketing).getOrElse(false),
      isTestUser = testUsers.isTestUser(user.publicFields.displayName)
    )
  }

  protected def respondToClient(
    result: EitherT[Future, CreateDigitalSubscriptionError, StatusResponse],
    billingPeriod: BillingPeriod
  )(implicit request: AuthRequest[CreateSupportWorkersRequest]): Future[Result] =
    result.fold(
      { error =>
        SafeLogger.error(scrub"[${request.uuid}] Failed to create new $billingPeriod Digital Subscription, due to $error")
        error match {
          case _: RequestValidationError => BadRequest
          case _: ServerError => InternalServerError
        }
      },
      { statusResponse =>
        SafeLogger.info(s"[${request.uuid}] Successfully created a support workers execution for a new $billingPeriod Digital Subscription")
        Accepted(statusResponse.asJson)
      }
    )

}
