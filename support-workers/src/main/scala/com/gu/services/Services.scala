package com.gu.services

import com.gu.acquisitions.AcquisitionServiceBuilder
import com.gu.config.Configuration._
import com.gu.gocardless.GoCardlessWorkersService
import com.gu.okhttp.RequestRunners.configurableFutureRunner
import com.gu.salesforce.SalesforceService
import com.gu.stripe.StripeService
import com.gu.support.promotions.PromotionService
import com.gu.zuora.ZuoraService

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

trait ServiceProvider {
  private lazy val defaultServices: Services = new Services(false)
  private lazy val uatServices: Services = new Services(true)
  def forUser(isTestUser: Boolean): Services = if (isTestUser) uatServices else defaultServices
}

object ServiceProvider extends ServiceProvider

class Services(isTestUser: Boolean) {

  lazy val stripeService: StripeService = new StripeService(stripeConfigProvider.get(isTestUser), configurableFutureRunner(40.seconds))
  lazy val salesforceService = new SalesforceService(salesforceConfigProvider.get(isTestUser), configurableFutureRunner(40.seconds))
  lazy val zuoraService = new ZuoraService(zuoraConfigProvider.get(isTestUser), configurableFutureRunner(60.seconds))
  lazy val acquisitionService = AcquisitionServiceBuilder.build(isTestUser)
  lazy val promotionService = new PromotionService(promotionsConfigProvider.get(isTestUser))
  lazy val goCardlessService = new GoCardlessWorkersService(goCardlessConfigProvider.get(isTestUser))
}

