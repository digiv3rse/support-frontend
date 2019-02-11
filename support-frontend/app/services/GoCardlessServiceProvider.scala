package services

import com.gu.support.touchpoint.TouchpointServiceProvider

import scala.concurrent.ExecutionContext

class GoCardlessServiceProvider(configProvider: GoCardlessConfigProvider)(implicit executionContext: ExecutionContext)
  extends TouchpointServiceProvider[GoCardlessService, GoCardlessConfig](configProvider) {
  override protected def createService(config: GoCardlessConfig) =
    new GoCardlessService(config.apiToken, config.environment)
}
