package com.gu.monitoring

import java.util.UUID

import com.gu.i18n.Country
import com.gu.support.encoding.CustomCodecs._
import com.gu.support.encoding.JsonHelpers._
import com.gu.support.promotions.PromoCode
import com.gu.support.redemptions.RedemptionData
import com.gu.support.workers.CheckoutFailureReasons.CheckoutFailureReason
import com.gu.support.workers._
import io.circe.generic.semiauto.deriveEncoder
import io.circe.syntax._
import io.circe.{Decoder, Encoder}
import org.joda.time.LocalDate

sealed trait LambdaExecutionStatus

case object Success extends LambdaExecutionStatus

case object PaymentFailure extends LambdaExecutionStatus

case object Error extends LambdaExecutionStatus

case object IgnoredError extends LambdaExecutionStatus

object LambdaExecutionStatus {
  def fromString(code: String): Option[LambdaExecutionStatus] = {
    List(Success, PaymentFailure, Error, IgnoredError).find(_.getClass.getSimpleName == s"$code$$")
  }

  implicit val decoder: Decoder[LambdaExecutionStatus] =
    Decoder.decodeString.emap(code => LambdaExecutionStatus.fromString(code).toRight(s"unrecognised execution status '$code'"))

  implicit val encoder: Encoder[LambdaExecutionStatus] = Encoder.encodeString.contramap[LambdaExecutionStatus](_.toString)
}

case class LambdaExecutionResult(
  requestId: UUID,
  status: LambdaExecutionStatus,
  isTestUser: Boolean,
  product: ProductType,
  paymentDetails: PaymentProvider,
  firstDeliveryDate: Option[LocalDate],
  isGift: Boolean,
  promoCode: Option[PromoCode],
  billingCountry: Country,
  deliveryCountry: Option[Country],
  checkoutFailureReason: Option[CheckoutFailureReason],
  error: Option[ExecutionError],
)

object LambdaExecutionResult {

  def logResult(lambdaExecutionResult: LambdaExecutionResult): Unit = {
    SafeLogger.info(s"LambdaExecutionResult: ${lambdaExecutionResult.asJson.noSpaces}")
  }

  implicit val encoder: Encoder[LambdaExecutionResult] = deriveEncoder[LambdaExecutionResult]
    .mapJsonObject(
      _.unNest("product", "amount")
        .unNest("product", "productType")
        .unNest("product", "currency")
        .unNest("product", "billingPeriod")
        .unNest("product", "fulfilmentOptions")
        .unNest("product", "productOptions")
        .remove("product")
    )
}

