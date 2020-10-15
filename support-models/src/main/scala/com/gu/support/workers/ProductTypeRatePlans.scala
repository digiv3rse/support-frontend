package com.gu.support.workers

import com.gu.support.catalog
import com.gu.support.catalog.{Product, ProductRatePlan}
import com.gu.support.config.TouchPointEnvironment
import com.gu.support.zuora.api.ReaderType
import com.gu.support.zuora.api.ReaderType.Corporate

object ProductTypeRatePlans {

  def productTypeRatePlan(product: ProductType, environment: TouchPointEnvironment, readerType: ReaderType): Option[ProductRatePlan[Product]] =
    product match {
      case d: DigitalPack => digitalRatePlan(d, environment)
      case p: Paper => paperRatePlan(p, environment)
      case w: GuardianWeekly => weeklyRatePlan(w, environment, readerType)
      case _ => None
    }

  def weeklyRatePlan(
    product: GuardianWeekly,
    environment: TouchPointEnvironment,
    readerType: ReaderType
  ): Option[ProductRatePlan[catalog.GuardianWeekly.type]] = {
    val postIntroductoryBillingPeriod = if (product.billingPeriod == SixWeekly) Quarterly else product.billingPeriod
    catalog.GuardianWeekly.ratePlans.getOrElse(environment, Nil).find(productRatePlan =>
      productRatePlan.fulfilmentOptions == product.fulfilmentOptions &&
        productRatePlan.billingPeriod == postIntroductoryBillingPeriod &&
      productRatePlan.readerType == readerType
    )
  }

  /**
   * Return the productRatePlan for the introductory part of the subscription ie. 6 for 6
   */
  def weeklyIntroductoryRatePlan(guardianWeekly: GuardianWeekly, environment: TouchPointEnvironment): Option[ProductRatePlan[catalog.GuardianWeekly.type]] =
    catalog.GuardianWeekly.ratePlans.getOrElse(environment, Nil).find(productRatePlan =>
      productRatePlan.fulfilmentOptions == guardianWeekly.fulfilmentOptions &&
        productRatePlan.billingPeriod == SixWeekly
    )

  def digitalRatePlan(product: DigitalPack, environment: TouchPointEnvironment): Option[ProductRatePlan[catalog.DigitalPack.type]] =
    catalog.DigitalPack.ratePlans.getOrElse(environment, Nil).find(productRatePlan =>
      (productRatePlan.billingPeriod == product.billingPeriod && productRatePlan.readerType == product.readerType) ||
        (productRatePlan.readerType == Corporate && product.readerType == Corporate) // We don't care about the billing period for corporates
    )

  def paperRatePlan(product: Paper, environment: TouchPointEnvironment): Option[ProductRatePlan[catalog.Paper.type]] =
    catalog.Paper.ratePlans.getOrElse(environment, Nil).find(productRatePlan =>
      productRatePlan.productOptions == product.productOptions &&
        productRatePlan.fulfilmentOptions == product.fulfilmentOptions
    )

}

