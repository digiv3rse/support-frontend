package config

import admin.settings.SettingsSources
import cats.syntax.either._
import com.gu.support.config._
import config.ConfigImplicits._
import config.Configuration.{GuardianDomain, MetricUrl}
import services.stepfunctions.StateMachineArn
import com.typesafe.config.{Config => TypesafeConfig}

class Configuration(config: TypesafeConfig) {

  lazy val stage = Stage.fromString(config.getString("stage")).get

  lazy val sentryDsn = config.getOptionalString("sentry.dsn")

  lazy val identity = new Identity(config.getConfig("identity"))

  lazy val googleAuth = new GoogleAuth(config.getConfig("googleAuth"))

  lazy val getAddressIOConfig = GetAddressIOConfig.fromConfig(config)

  lazy val guardianDomain = GuardianDomain(config.getString("guardianDomain"))

  lazy val supportUrl = config.getString("support.url")

  lazy val paymentApiUrl = config.getString("paymentApi.url")

  lazy val membersDataServiceApiUrl = config.getString("membersDataService.api.url")

  lazy val metricUrl = MetricUrl(config.getString("metric.url"))

  lazy val goCardlessConfigProvider = new GoCardlessConfigProvider(config, stage)

  lazy val regularPayPalConfigProvider = new PayPalConfigProvider(config, stage)

  lazy val regularStripeConfigProvider = new StripeConfigProvider(config, stage)

  lazy val oneOffStripeConfigProvider = new StripeConfigProvider(config, stage, "oneOffStripe")

  lazy val amazonPayConfigProvider = new AmazonPayConfigProvider(config, stage)

  lazy val stepFunctionArn = StateMachineArn.fromString(config.getString("supportWorkers.arn")).get

  lazy val settingsSources: SettingsSources = SettingsSources.fromConfig(config, stage).valueOr(throw _)

  lazy val fastlyConfig: Option[FastlyConfig] = FastlyConfig.fromConfig(config).valueOr(throw _)

  lazy val priceSummaryConfigProvider = new PriceSummaryConfigProvider(config, stage)

  lazy val promotionsConfigProvider = new PromotionsConfigProvider(config, stage)

  lazy val recaptchaConfigProvider = RecaptchaConfigProvider(config, stage)


}

object Configuration {
  case class GuardianDomain(value: String)
  case class IdentityUrl(value: String)
  case class MetricUrl(value: String) extends AnyVal
}
