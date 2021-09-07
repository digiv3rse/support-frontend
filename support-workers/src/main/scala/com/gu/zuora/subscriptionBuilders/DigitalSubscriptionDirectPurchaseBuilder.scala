package com.gu.zuora.subscriptionBuilders

import com.gu.helpers.DateGenerator
import com.gu.support.config.{TouchPointEnvironment, ZuoraDigitalPackConfig}
import com.gu.support.promotions.{PromoError, PromotionService}
import com.gu.support.workers.ProductTypeRatePlans.digitalRatePlan
import com.gu.support.workers.states.CreateZuoraSubscriptionProductState.DigitalSubscriptionDirectPurchaseState
import com.gu.support.zuora.api._
import com.gu.zuora.subscriptionBuilders.ProductSubscriptionBuilders.{applyPromoCodeIfPresent, validateRatePlan}

class DigitalSubscriptionDirectPurchaseBuilder(
  config: ZuoraDigitalPackConfig,
  promotionService: PromotionService,
  dateGenerator: DateGenerator,
  environment: TouchPointEnvironment,
  subscribeItemBuilder: SubscribeItemBuilder,
) {

  def build(state: DigitalSubscriptionDirectPurchaseState): Either[PromoError, SubscribeItem] = {

    val productRatePlanId = validateRatePlan(digitalRatePlan(state.product, environment), state.product.describe)

    val todaysDate = dateGenerator.today

    val defaultFreeTrialLength = config.defaultFreeTrialPeriod + config.paymentGracePeriod

    val freeTrialLength = state.freeTrialLength.getOrElse(defaultFreeTrialLength)
    
    val contractAcceptanceDate = todaysDate.plusDays(freeTrialLength)

    val subscriptionData = subscribeItemBuilder.buildProductSubscription(
      productRatePlanId,
      contractEffectiveDate = todaysDate,
      contractAcceptanceDate = contractAcceptanceDate,
      readerType = state.product.readerType,
      initialTermPeriodType = Month,
    )

    applyPromoCodeIfPresent(
      promotionService, state.promoCode, state.billingCountry, productRatePlanId, subscriptionData
    ).map { subscriptionData =>
      subscribeItemBuilder.build(subscriptionData, state.salesForceContact, Some(state.paymentMethod), None)
    }

  }

}
