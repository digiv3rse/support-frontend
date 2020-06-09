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

sealed trait PaymentProvider

case object Stripe extends PaymentProvider

case object StripeApplePay extends PaymentProvider

case object PayPal extends PaymentProvider

case object DirectDebit extends PaymentProvider

case object Existing extends PaymentProvider

case object RedemptionNoProvider extends PaymentProvider

object PaymentProvider {
  def fromString(code: String): Option[PaymentProvider] = {
    List(Stripe, PayPal, DirectDebit, Existing).find(_.getClass.getSimpleName == s"$code$$")
  }

  implicit val decoder: Decoder[PaymentProvider] =
    Decoder.decodeString.emap(code => PaymentProvider.fromString(code).toRight(s"unrecognised payment provider '$code'"))

  implicit val encoder: Encoder[PaymentProvider] = Encoder.encodeString.contramap[PaymentProvider](_.toString)

  def fromPaymentFields(paymentFields: Either[PaymentFields, RedemptionData]): PaymentProvider = paymentFields match {
    case Left(stripe: StripePaymentFields) => stripe.stripePaymentType match {
      case Some(StripePaymentType.StripeApplePay) => StripeApplePay
      case _ => Stripe
    }
    case Left(_: PayPalPaymentFields) => PayPal
    case Left(_: DirectDebitPaymentFields) => DirectDebit
    case Left(_: ExistingPaymentFields) => Existing
    case Right(_) => RedemptionNoProvider
  }

  def fromPaymentMethod(paymentMethod: Either[PaymentMethod, RedemptionData]): PaymentProvider = paymentMethod match {
    case Left(creditCardPayment: CreditCardReferenceTransaction) =>
      creditCardPayment.stripePaymentType match {
        case Some(StripePaymentType.StripeApplePay) => StripeApplePay
        case _ => Stripe
      }
    case Left(_: PayPalReferenceTransaction) => PayPal
    case Left(_: DirectDebitPaymentMethod) => DirectDebit
    case Left(_: ClonedDirectDebitPaymentMethod) => Existing
    case Right(_) => RedemptionNoProvider
  }

}

case class LambdaExecutionResult(
  requestId: UUID,
  status: LambdaExecutionStatus,
  isTestUser: Boolean,
  product: ProductType,
  paymentDetails: Option[PaymentProvider],
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

