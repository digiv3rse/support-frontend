package config

import com.typesafe.config.ConfigFactory
import ConfigImplicits._

class Configuration {
  val config = ConfigFactory.load()

  lazy val stage = Stage.fromString(config.getString("stage")).get

  lazy val sentryDsn = config.getOptionalString("sentry.dsn")
}