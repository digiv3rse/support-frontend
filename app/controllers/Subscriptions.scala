package controllers

import actions.CustomActionBuilders
import assets.AssetsResolver
import com.gu.i18n.CountryGroup._
import com.typesafe.scalalogging.LazyLogging
import config.StringsConfig
import play.api.mvc._
import admin.{Settings, SettingsProvider, SettingsSurrogateKeySyntax, SwitchState}
import utils.RequestCountry._

import scala.concurrent.ExecutionContext

class Subscriptions(
    actionRefiners: CustomActionBuilders,
    val assets: AssetsResolver,
    components: ControllerComponents,
    stringsConfig: StringsConfig,
    settingsProvider: SettingsProvider,
    supportUrl: String
)(implicit val ec: ExecutionContext) extends AbstractController(components) with LazyLogging with SettingsSurrogateKeySyntax {

  import actionRefiners._

  implicit val a: AssetsResolver = assets

  def geoRedirect: Action[AnyContent] = geoRedirect("subscribe")

  def geoRedirect(path: String): Action[AnyContent] = GeoTargetedCachedAction() { implicit request =>
    // If we implement endpoints for EU, CA & NZ we could replace this match with
    // request.fastlyCountry.map(_.id).getOrDefault("int")
    val redirectUrl = request.fastlyCountry match {
      case Some(UK) => s"/uk/$path"
      case Some(US) => s"/us/$path"
      case Some(Australia) => s"/au/$path"
      case _ => s"/int/$path"
    }
    Redirect(redirectUrl, request.queryString, status = FOUND)
  }

  def legacyRedirect(countryCode: String): Action[AnyContent] = CachedAction() { implicit request =>
    // Country code is required here because it's a parameter in the route.
    // But we don't actually use it.
    Redirect("https://subscribe.theguardian.com", request.queryString, status = FOUND)
  }

  def landing(countryCode: String): Action[AnyContent] = CachedAction() { implicit request =>
    if (settingsProvider.settings().switches.internationalSubscribePages == SwitchState.Off && countryCode.toLowerCase != "uk") {
      Redirect(controllers.routes.Subscriptions.geoRedirect())
    } else {
      implicit val settings: Settings = settingsProvider.settings()
      val title = "Support the Guardian | Get a Subscription"
      val id = "subscriptions-landing-page"
      val js = "subscriptionsLandingPage.js"
      Ok(views.html.main(
        title,
        id,
        js,
        "subscriptionsLandingPageStyles.css",
        description = stringsConfig.subscriptionsLandingDescription
      )).withSettingsSurrogateKey
    }
  }

  def digital(countryCode: String): Action[AnyContent] = CachedAction() { implicit request =>
    implicit val settings: Settings = settingsProvider.settings()
    val title = "Support the Guardian | Digital Pack Subscription"
    val id = "digital-subscription-landing-page-" + countryCode
    val js = "digitalSubscriptionLandingPage.js"
    val css = "digitalSubscriptionLandingPageStyles.css"
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

  def premiumTier(countryCode: String): Action[AnyContent] = CachedAction() { implicit request =>
    implicit val settings: Settings = settingsProvider.settings()
    val title = "Support the Guardian | Premium Tier"
    val id = "premium-tier-landing-page-" + countryCode
    val js = "premiumTierLandingPage.js"
    val css = "premiumTierLandingPageStyles.css"
    Ok(views.html.main(title, id, js, css)).withSettingsSurrogateKey
  }

  def premiumTierGeoRedirect: Action[AnyContent] = geoRedirect("subscribe/premium-tier")

  def displayForm(countryCode: String): Action[AnyContent] =
    authenticatedAction(recurringIdentityClientId) { implicit request =>
      implicit val settings: Settings = settingsProvider.settings()
      val title = "Support the Guardian | Digital Subscription"
      val id = "digital-subscription-checkout-page-" + countryCode
      val js = "digitalSubscriptionCheckoutPage.js"
      val css = "digitalSubscriptionCheckoutPageStyles.css"
      Ok(views.html.main(title, id, js, css)).withSettingsSurrogateKey
    }

  def buildCanonicalDigitalSubscriptionLink(countryCode: String): String =
    s"${supportUrl}/${countryCode}/subscribe/digital"

}
