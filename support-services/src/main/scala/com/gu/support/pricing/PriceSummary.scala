package com.gu.support.pricing

import com.gu.support.promotions._


case class PriceSummary(
  price: BigDecimal,
  promotion: Option[PromotionSummary]
)

case class PromotionSummary(
  name: String,
  description: String,
  promoCode: PromoCode,
  discountedPrice: Option[BigDecimal],
  numberOfDiscountedPeriods: Option[Int],
  discount: Option[DiscountBenefit],
  freeTrialBenefit: Option[FreeTrialBenefit],
  incentive: Option[IncentiveBenefit] = None
)

import com.gu.support.encoding.Codec
import com.gu.support.encoding.Codec._

object PromotionSummary {
  implicit val codec: Codec[PromotionSummary] = deriveCodec
}

object PriceSummary {
  import com.gu.support.encoding.CustomCodecs._
  implicit val codec: Codec[PriceSummary] = deriveCodec
}
