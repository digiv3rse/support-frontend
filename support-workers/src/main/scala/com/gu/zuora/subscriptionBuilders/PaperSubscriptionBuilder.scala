package com.gu.zuora.subscriptionBuilders

import java.util.UUID

import com.gu.i18n.Country
import com.gu.support.config.TouchPointEnvironment
import com.gu.support.promotions.{PromoCode, PromoError, PromotionService}
import com.gu.support.workers.{Paper, ProductTypeRatePlans}
import com.gu.support.workers.exceptions.BadRequestException
import com.gu.support.zuora.api.ReaderType.Direct
import com.gu.support.zuora.api.SubscriptionData
import com.gu.zuora.subscriptionBuilders.ProductSubscriptionBuilders.{applyPromoCodeIfPresent, buildProductSubscription, validateRatePlan}
import org.joda.time.{DateTimeZone, LocalDate}
import com.gu.support.workers.ProductTypeRatePlans._

import scala.util.{Failure, Success, Try}

object PaperSubscriptionBuilder {
  def build(
    paper: Paper,
    requestId: UUID,
    country: Country,
    maybePromoCode: Option[PromoCode],
    firstDeliveryDate: Option[LocalDate],
    promotionService: PromotionService,
    environment: TouchPointEnvironment
  ): Either[PromoError, SubscriptionData] = {

    val contractEffectiveDate = LocalDate.now(DateTimeZone.UTC)

    val contractAcceptanceDate = Try(firstDeliveryDate.get) match {
      case Success(value) => value
      case Failure(e) => throw new BadRequestException(s"First delivery date was not provided. It is required for a print subscription.", e)
    }

    val productRatePlanId = validateRatePlan(paperRatePlan(paper, environment), paper.describe)

    val subscriptionData = buildProductSubscription(
      requestId,
      productRatePlanId,
      contractAcceptanceDate = contractAcceptanceDate,
      contractEffectiveDate = contractEffectiveDate,
      readerType = Direct
    )

    applyPromoCodeIfPresent(promotionService, maybePromoCode, country, productRatePlanId, subscriptionData)
  }
}
