package wiring

import assets.RefPath
import com.gu.aws.AwsCloudWatchMetricPut
import com.gu.aws.AwsCloudWatchMetricPut.{client, setupWarningRequest}
import controllers.{CSSElementForStage, _}
import lib.ErrorController
import play.api.BuiltInComponentsFromContext
import services.RecaptchaService

trait Controllers {

  // scalastyle:off
  self: AssetsComponents with Services with BuiltInComponentsFromContext with ApplicationConfiguration with ActionBuilders with Assets with GoogleAuth with Monitoring =>
  // scalastyle:on

  lazy val assetController = new controllers.Assets(httpErrorHandler, assetsMetadata)
  lazy val faviconController = new controllers.Favicon(actionRefiners, appConfig.stage)(fileMimeTypes)
  def errorController: ErrorController
  lazy val elementForStage = CSSElementForStage(assetsResolver.getFileContentsAsHtml, appConfig.stage)_
  lazy val fontLoader = elementForStage(RefPath("fontLoader.js"))

  lazy val applicationController = new Application(
    actionRefiners,
    assetsResolver,
    identityService,
    controllerComponents,
    appConfig.oneOffStripeConfigProvider,
    appConfig.regularStripeConfigProvider,
    appConfig.regularPayPalConfigProvider,
    appConfig.amazonPayConfigProvider,
    appConfig.recaptchaConfigProvider,
    paymentAPIService,
    membersDataService,
    stringsConfig,
    allSettingsProvider,
    appConfig.guardianDomain,
    appConfig.stage,
    appConfig.supportUrl,
    fontLoader
  )

  lazy val subscriptionsController = new Subscriptions(
    actionRefiners,
    identityService,
    priceSummaryServiceProvider,
    assetsResolver,
    controllerComponents,
    stringsConfig,
    allSettingsProvider,
    appConfig.supportUrl,
    fontLoader
  )

  lazy val digitalPackController = new DigitalSubscriptionController(
    priceSummaryServiceProvider,
    assetsResolver,
    actionRefiners,
    identityService,
    testUsers,
    membersDataService,
    appConfig.regularStripeConfigProvider,
    appConfig.regularPayPalConfigProvider,
    controllerComponents,
    stringsConfig,
    allSettingsProvider,
    appConfig.supportUrl,
    fontLoader,
    appConfig.recaptchaConfigProvider
  )

  lazy val redemptionController = new RedemptionController(
    actionRefiners,
    assetsResolver,
    allSettingsProvider,
    identityService,
    membersDataService,
    testUsers,
    controllerComponents,
    fontLoader,
    authAction,
    dynamoTableAsync
  )

  lazy val paperController = new PaperSubscription(
    priceSummaryServiceProvider,
    assetsResolver,
    actionRefiners,
    identityService,
    testUsers,
    appConfig.regularStripeConfigProvider,
    appConfig.regularPayPalConfigProvider,
    controllerComponents,
    stringsConfig,
    allSettingsProvider,
    appConfig.supportUrl,
    fontLoader,
    appConfig.recaptchaConfigProvider
  )

  lazy val weeklyController = new WeeklySubscription(
    authAction,
    priceSummaryServiceProvider,
    promotionServiceProvider,
    assetsResolver,
    actionRefiners,
    identityService,
    testUsers,
    appConfig.regularStripeConfigProvider,
    appConfig.regularPayPalConfigProvider,
    controllerComponents,
    stringsConfig,
    allSettingsProvider,
    appConfig.supportUrl,
    fontLoader,
    appConfig.stage,
    appConfig.recaptchaConfigProvider
  )

  lazy val createSubscriptionController = new CreateSubscription(
    supportWorkersClient,
    actionRefiners,
    identityService,
    testUsers,
    controllerComponents,
    allSettingsProvider,
    appConfig.supportUrl
  )

  lazy val supportWorkersStatusController = new SupportWorkersStatus(
    supportWorkersClient,
    controllerComponents,
    actionRefiners
  )

  lazy val stripeController = new StripeController(
    components = controllerComponents,
    actionRefiners = actionRefiners,
    recaptchaService = recaptchaService,
    stripeService = stripeService,
    identityService = identityService,
    v2RecaptchaKey = appConfig.recaptchaConfigProvider.v2SecretKey,
    testStripeConfig = appConfig.regularStripeConfigProvider.get(true),
    allSettingsProvider,
    appConfig.stage
  )

  lazy val regularContributionsController = new RegularContributions(
    supportWorkersClient,
    assetsResolver,
    actionRefiners,
    membersDataService,
    identityService,
    testUsers,
    appConfig.regularStripeConfigProvider,
    appConfig.regularPayPalConfigProvider,
    controllerComponents,
    appConfig.guardianDomain,
    allSettingsProvider,
    tipMonitoring
  )

  lazy val payPalRegularController = new PayPalRegular(
    actionRefiners,
    assetsResolver,
    payPalNvpServiceProvider,
    testUsers,
    controllerComponents,
    allSettingsProvider,
    fontLoader
  )

  lazy val payPalOneOffController = new PayPalOneOff(
    actionRefiners,
    assetsResolver,
    testUsers,
    controllerComponents,
    paymentAPIService,
    identityService,
    allSettingsProvider,
    tipMonitoring,
    fontLoader
  )

  lazy val testUsersController = new TestUsersManagement(
    authAction,
    controllerComponents,
    testUsers,
    appConfig.supportUrl,
    appConfig.guardianDomain
  )

  lazy val siteMapController = new SiteMap(
    actionRefiners,
    controllerComponents
  )

  lazy val identityController = new IdentityController(
    identityService,
    controllerComponents,
    actionRefiners,
    appConfig.guardianDomain,
    appConfig.identity.webappUrl,
    () => AwsCloudWatchMetricPut(client)(setupWarningRequest(appConfig.stage))
  )

  lazy val directDebitController = new DirectDebit(
    actionRefiners,
    controllerComponents,
    goCardlessServiceProvider,
    testUsers
  )

  lazy val getAddressController = new GetAddress(
    controllerComponents,
    getAddressIOService,
    actionRefiners
  )

  lazy val promotionsController = new Promotions(
    promotionServiceProvider,
    priceSummaryServiceProvider,
    assetsResolver,
    actionRefiners,
    testUsers,
    controllerComponents,
    fontLoader,
    allSettingsProvider,
    appConfig.stage
  )

}
