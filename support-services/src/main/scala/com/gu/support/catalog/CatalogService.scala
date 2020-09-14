package com.gu.support.catalog

import com.gu.aws.{AwsCloudWatchMetricPut, AwsCloudWatchMetricSetup}
import com.gu.i18n.Currency
import com.gu.support.catalog.GuardianWeekly.getProductRatePlan
import com.gu.support.config.TouchPointEnvironment
import com.gu.support.workers.{BillingPeriod, Quarterly, SixWeekly}
import com.typesafe.scalalogging.LazyLogging

object CatalogService {
  def apply(environment: TouchPointEnvironment): CatalogService = new CatalogService(environment, new S3CatalogProvider(environment))
}

class CatalogService(val environment: TouchPointEnvironment, jsonProvider: CatalogJsonProvider) extends LazyLogging {

  private[this] def getRatePlanId(billingPeriod: BillingPeriod, fulfilmentOptions: FulfilmentOptions)
    = getProductRatePlan(environment, billingPeriod, fulfilmentOptions, NoProductOptions).map(_.id).getOrElse("")

  private[this] def fetchQuarterlyPrice(
    quarterlyId: ProductRatePlanId,
    sixWeeklyPriceList: Pricelist,
    catalogPrices: List[Pricelist]
  ) = {
    Pricelist(sixWeeklyPriceList.productRatePlanId, sixWeeklyPriceList.savingVsRetail,
      catalogPrices.find(_.productRatePlanId == quarterlyId).map(_.prices).getOrElse(sixWeeklyPriceList.prices)
    )
  }

  def adjustSixWeeklyPriceList(c: Catalog): Catalog = {
    // The price stored for the 6 weekly billing period in Zuora is £6 - the price of the
    // promotion. It is much more use from the point of view of the site to have the subscription
    // price, ie. the quarterly price as the £6 is available through the introductory promotion object
    val ratePlanIdsToSwap = Map(
      getRatePlanId(SixWeekly, Domestic) -> getRatePlanId(Quarterly, Domestic),
      getRatePlanId(SixWeekly, RestOfWorld) -> getRatePlanId(Quarterly, RestOfWorld)
    )

    Catalog(
      c.prices.map(priceList =>
        ratePlanIdsToSwap.get(priceList.productRatePlanId)
          .map(fetchQuarterlyPrice(_, priceList, c.prices))
          .getOrElse(priceList)
      )
    )
  }

  private lazy val catalog = {

    jsonProvider.get.flatMap { json =>
      val attempt = json.as[Catalog]
      attempt.fold(
        err => {
          logger.error(s"Failed to load the catalog, error was: $err")
          AwsCloudWatchMetricPut(AwsCloudWatchMetricPut.client)(AwsCloudWatchMetricSetup.catalogFailureRequest(environment))
          None
        },
        c => {
          logger.info(s"Successfully loaded the catalog")
          Some(adjustSixWeeklyPriceList(c))
        }
      )
    }
  }

  def getProductRatePlanFromId[T <: Product](product: T, id: ProductRatePlanId): Option[ProductRatePlan[Product]] =
    product.ratePlans(environment).find(_.id == id)

  def getPrice[T <: Product](
    product: T,
    currency: Currency,
    billingPeriod: BillingPeriod,
    fulfilmentOptions: FulfilmentOptions,
    productOptions: ProductOptions
  ): Option[Price] = {
    for {
      productRatePlan <- product.getProductRatePlan(environment, billingPeriod, fulfilmentOptions, productOptions)
      priceList <- getPriceList(productRatePlan)
      price <- priceList.prices.find(_.currency == currency)
    } yield price
  }


  def getPriceList[T <: Product](productRatePlan: ProductRatePlan[T]): Option[Pricelist] =
    catalog.flatMap(_.prices.find(_.productRatePlanId == productRatePlan.id))

}
