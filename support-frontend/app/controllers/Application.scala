package controllers

import actions.CustomActionBuilders
import admin.ServersideAbTest.generateParticipations
import admin.settings.{AllSettings, AllSettingsProvider, SettingsSurrogateKeySyntax}
import assets.{AssetsResolver, RefPath, StyleContent}
import cats.data.EitherT
import cats.implicits._
import com.gu.i18n.CountryGroup
import com.gu.i18n.CountryGroup._
import com.gu.identity.model.{User => IdUser}
import com.gu.monitoring.SafeLogger
import com.gu.monitoring.SafeLogger._
import com.gu.support.config._
import com.typesafe.scalalogging.StrictLogging
import config.Configuration.GuardianDomain
import config.{RecaptchaConfigProvider, StringsConfig}
import lib.RedirectWithEncodedQueryString
import models.GeoData
import play.api.mvc._
import services.{IdentityService, MembersDataService, PaymentAPIService}
import utils.BrowserCheck
import utils.FastlyGEOIP._

import scala.concurrent.{ExecutionContext, Future}

case class ContributionsPaymentMethodConfigs(
  oneOffDefaultStripeConfig: StripeConfig,
  oneOffUatStripeConfig: StripeConfig,
  regularDefaultStripeConfig: StripeConfig,
  regularUatStripeConfig: StripeConfig,
  regularDefaultPayPalConfig: PayPalConfig,
  regularUatPayPalConfig: PayPalConfig,
  defaultAmazonPayConfig: AmazonPayConfig,
  uatAmazonPayConfig: AmazonPayConfig
)

class Application(
  actionRefiners: CustomActionBuilders,
  val assets: AssetsResolver,
  identityService: IdentityService,
  components: ControllerComponents,
  oneOffStripeConfigProvider: StripeConfigProvider,
  regularStripeConfigProvider: StripeConfigProvider,
  payPalConfigProvider: PayPalConfigProvider,
  amazonPayConfigProvider: AmazonPayConfigProvider,
  recaptchaConfigProvider: RecaptchaConfigProvider,
  paymentAPIService: PaymentAPIService,
  membersDataService: MembersDataService,
  stringsConfig: StringsConfig,
  settingsProvider: AllSettingsProvider,
  guardianDomain: GuardianDomain,
  stage: Stage,
  val supportUrl: String,
  fontLoaderBundle: Either[RefPath, StyleContent]
)(implicit val ec: ExecutionContext) extends AbstractController(components)
  with SettingsSurrogateKeySyntax with CanonicalLinks with StrictLogging {

  import actionRefiners._

  implicit val a: AssetsResolver = assets

  def contributionsRedirect(): Action[AnyContent] = CachedAction() {
    Ok(views.html.contributionsRedirect())
  }

  def geoRedirect: Action[AnyContent] = GeoTargetedCachedAction() { implicit request =>
    val redirectUrl = request.geoData.countryGroup match {
      case Some(UK) => buildCanonicalShowcaseLink("uk")
      case Some(US) => buildCanonicalShowcaseLink("us")
      case Some(Australia) => buildCanonicalShowcaseLink("au")
      case Some(Europe) => "/eu/contribute"
      case Some(Canada) => "/ca/contribute"
      case Some(NewZealand) => "/nz/contribute"
      case Some(RestOfTheWorld) => "/int/contribute"
      case _ => "/uk/contribute"
    }

    RedirectWithEncodedQueryString(redirectUrl, request.queryString, status = FOUND)
  }

  def supportGeoRedirect: Action[AnyContent] = GeoTargetedCachedAction() { implicit request =>
    val supportPageVariant = request.geoData.countryGroup match {
      case Some(US) => "us"
      case Some(Australia) => "au"
      case _ => "uk"
    }

    RedirectWithEncodedQueryString(buildCanonicalShowcaseLink(supportPageVariant), request.queryString, status = FOUND)
  }

  def contributeGeoRedirect(campaignCode: String): Action[AnyContent] = GeoTargetedCachedAction() { implicit request =>
    val url = List(getContributeRedirectUrl(request.geoData.countryGroup), campaignCode)
      .filter(_.nonEmpty)
      .mkString("/")

    RedirectWithEncodedQueryString(url, request.queryString, status = FOUND)
  }


  def redirect(location: String): Action[AnyContent] = CachedAction() { implicit request =>
    RedirectWithEncodedQueryString(location, request.queryString, status = FOUND)
  }

  def permanentRedirect(location: String): Action[AnyContent] = CachedAction() { implicit request =>
    RedirectWithEncodedQueryString(location, request.queryString, status = MOVED_PERMANENTLY)
  }

  // Country code is required here because it's a parameter in the route.
  def permanentRedirectWithCountry(country: String, location: String): Action[AnyContent] = CachedAction() { implicit request =>
    RedirectWithEncodedQueryString(location, request.queryString, status = MOVED_PERMANENTLY)
  }

  def redirectPath(location: String, path: String): Action[AnyContent] = CachedAction() { implicit request =>
    RedirectWithEncodedQueryString(location + path, request.queryString)
  }

  def unsupportedBrowser: Action[AnyContent] = NoCacheAction() { implicit request =>
    BrowserCheck.logUserAgent(request)
    SafeLogger.info("Redirecting to unsupported-browser page")
    Ok(views.html.unsupportedBrowserPage())
  }

  def contributionsLanding(
    countryCode: String,
    campaignCode: String
  ): Action[AnyContent] = maybeAuthenticatedAction().async { implicit request =>
    type Attempt[A] = EitherT[Future, String, A]

    val geoData = request.geoData

    val campaignCodeOption = if (campaignCode != "") Some(campaignCode) else None

    // This will be present if the token has been flashed into the session by the PayPal redirect endpoint
    val guestAccountCreationToken = request.flash.get("guestAccountCreationToken")

    implicit val settings: AllSettings = settingsProvider.getAllSettings()
    request.user.traverse[Attempt, IdUser](user => identityService.getUser(user.minimalUser)).fold(
        _ => Ok(contributionsHtml(countryCode, geoData, None, campaignCodeOption, guestAccountCreationToken)),
        user => Ok(contributionsHtml(countryCode, geoData, user, campaignCodeOption, guestAccountCreationToken))
      ).map(_.withSettingsSurrogateKey)
  }

  private def shareImageUrl(settings: AllSettings): String = {
    val contributionsMomentEnabled =
      settings
        .switches
        .enableContributionsCampaign
        .isOn

      if (contributionsMomentEnabled)
        "https://i.guim.co.uk/img/media/e4ca4068ad12c9fe05d8f3f3fab4142d1eceae0d/0_0_1000_525/1000.png?quality=85&s=541be4a526478168dd24d7402b51a343"
      else
        "https://i.guim.co.uk/img/media/74b15a65c479bfe53151fceeb7d948f125a66af2/0_0_2400_1260/1000.png?quality=85&s=4b52891c0a86da6c08f2dc6e8308d211"
  }

  private def contributionsHtml(countryCode: String, geoData: GeoData, idUser: Option[IdUser],
                                campaignCode: Option[String], guestAccountCreationToken: Option[String])
                               (implicit request: RequestHeader, settings: AllSettings) = {

    val elementForStage = CSSElementForStage(assets.getFileContentsAsHtml, stage) _
    val css = elementForStage(RefPath("contributionsLandingPage.css"))

    val js = elementForStage(RefPath("contributionsLandingPage.js"))

    val classes = "gu-content--contribution-form--placeholder" +
      campaignCode.map(code => s" gu-content--campaign-landing gu-content--$code").getOrElse("")

    val mainElement = assets.getSsrCacheContentsAsHtml(
      divId = s"contributions-landing-page-$countryCode",
      file = "contributions-landing.html",
      classes = Some(classes)
    )

    val serversideTests = generateParticipations(Nil)

    views.html.contributions(
      title = "Support the Guardian | Make a Contribution",
      id = s"contributions-landing-page-$countryCode",
      mainElement = mainElement,
      js = js,
      css = css,
      description = stringsConfig.contributionsLandingDescription,
      paymentMethodConfigs = ContributionsPaymentMethodConfigs(
        oneOffDefaultStripeConfig = oneOffStripeConfigProvider.get(false),
        oneOffUatStripeConfig = oneOffStripeConfigProvider.get(true),
        regularDefaultStripeConfig = regularStripeConfigProvider.get(false),
        regularUatStripeConfig = regularStripeConfigProvider.get(true),
        regularDefaultPayPalConfig = payPalConfigProvider.get(false),
        regularUatPayPalConfig = payPalConfigProvider.get(true),
        defaultAmazonPayConfig = amazonPayConfigProvider.get(false),
        uatAmazonPayConfig = amazonPayConfigProvider.get(true)
      ),
      paymentApiUrl = paymentAPIService.paymentAPIUrl,
      paymentApiPayPalEndpoint = paymentAPIService.payPalCreatePaymentEndpoint,
      existingPaymentOptionsEndpoint = membersDataService.existingPaymentOptionsEndpoint,
      idUser = idUser,
      guestAccountCreationToken = guestAccountCreationToken,
      fontLoaderBundle = fontLoaderBundle,
      geoData = geoData,
      shareImageUrl = shareImageUrl(settings),
      shareUrl = "https://support.theguardian.com/contribute",
      v2recaptchaConfigPublicKeyDefault = recaptchaConfigProvider.get().v2PublicKey,
      v2recaptchaConfigPublicKeyUat = recaptchaConfigProvider.get(true).v2PublicKey,
      serversideTests = serversideTests
    )
  }

  def showcase(country: String): Action[AnyContent] = CachedAction() { implicit request =>
    implicit val settings: AllSettings = settingsProvider.getAllSettings()
    Ok(views.html.main(
      title = "Support the Guardian",
      mainElement = assets.getSsrCacheContentsAsHtml("showcase-landing-page", "showcase.html"),
      mainJsBundle = Left(RefPath("showcasePage.js")),
      mainStyleBundle = Left(RefPath("showcasePage.css")),
      fontLoaderBundle = fontLoaderBundle,
      description = stringsConfig.showcaseLandingDescription,
      canonicalLink = Some(buildCanonicalShowcaseLink("uk"))
    )()).withSettingsSurrogateKey
  }

  val ausMomentMapSocialImageUrl =
    "https://i.guim.co.uk/img/media/84bf6a5c9535827ff4c307941cf3147fb2fb63c8/0_0_2000_1050/1000.png?width=1000&quality=85&s=2f7dc4ee733fee7117358fbbb1fa057f"

  def ausMomentMap(): Action[AnyContent] = CachedAction() { implicit request =>
    implicit val settings: AllSettings = settingsProvider.getAllSettings()
    Ok(views.html.main(
      title = "Guardian Supporters Map",
      mainElement = assets.getSsrCacheContentsAsHtml("aus-moment-map", "aus-moment-map.html"),
      mainJsBundle = Left(RefPath("ausMomentMap.js")),
      mainStyleBundle = Left(RefPath("ausMomentMap.css")),
      fontLoaderBundle = fontLoaderBundle,
      description = stringsConfig.contributionsLandingDescription,
      canonicalLink = Some("https://support.theguardian.com/aus-2020-map"),
      shareImageUrl = Some(
        ausMomentMapSocialImageUrl
      )
    )()).withSettingsSurrogateKey
  }


  def healthcheck: Action[AnyContent] = PrivateAction {
    Ok("healthy")
  }

  // Remove trailing slashes so that /uk/ redirects to /uk
  def removeTrailingSlash(path: String): Action[AnyContent] = CachedAction() {
    request =>
      RedirectWithEncodedQueryString("/" + path, request.queryString, MOVED_PERMANENTLY)
  }


  private def getContributeRedirectUrl(fastlyCountry: Option[CountryGroup]): String = {
    fastlyCountry match {
      case Some(UK) => "/uk/contribute"
      case Some(US) => "/us/contribute"
      case Some(Australia) => "/au/contribute"
      case Some(Europe) => "/eu/contribute"
      case Some(Canada) => "/ca/contribute"
      case Some(NewZealand) => "/nz/contribute"
      case Some(RestOfTheWorld) => "/int/contribute"
      case _ => "/uk/contribute"
    }
  }
}

object CSSElementForStage {

  def apply(getFileContentsAsHtml: RefPath => Option[StyleContent], stage: Stage)(cssPath: RefPath): Either[RefPath, StyleContent] = {
    if (stage == Stages.DEV) {
      Left(cssPath)
    } else {
      getFileContentsAsHtml(cssPath).fold[Either[RefPath, StyleContent]] {
        SafeLogger.error(scrub"Inline CSS failed to load for $cssPath") // in future add email perf alert instead (cloudwatch alarm perhaps)
        Left(cssPath)
      } { inlineCss =>
        Right(inlineCss)
      }
    }
  }

}
