package com.gu.support.workers

import cats.syntax.functor._
import com.gu.i18n.Country
import com.gu.support.encoding.{Codec, CodecHelpers}
import com.gu.support.encoding.Codec.deriveCodec
import io.circe.syntax._
import io.circe.{Encoder, _}

sealed trait PaymentFields

case class PayPalPaymentFields(baid: String) extends PaymentFields

case class StripePaymentFields(
    paymentMethod: PaymentMethodId,
    stripePaymentType: Option[StripePaymentType],
    stripePublicKey: Option[StripePublicKey], // this is only optional until all checkouts are updated
) extends PaymentFields

object StripePublicKey {

  def parse(value: String): Either[String, StripePublicKey] =
    if (
      value.length > 10 &&
      value.forall { char =>
        (char >= 'a' && char <= 'z') ||
        (char >= 'A' && char <= 'Z') ||
        (char >= '0' && char <= '9') ||
        char == '_'
      }
    ) Right(new StripePublicKey(value))
    else Left(s"StripePublicKey <$value> had invalid characters")

  def get(value: String): StripePublicKey =
    parse(value).left.map(new Throwable(_)).toTry.get

  implicit val decoder: Decoder[StripePublicKey] = Decoder.decodeString.emap(parse)
  implicit val encoder: Encoder[StripePublicKey] = Encoder.encodeString.contramap[StripePublicKey](_.value)

}
case class StripePublicKey private (value: String) extends AnyVal

object PaymentMethodId {

  def apply(value: String): Option[PaymentMethodId] =
    if (
      value.nonEmpty &&
      value.forall { char =>
        (char >= 'a' && char <= 'z') ||
        (char >= 'A' && char <= 'Z') ||
        (char >= '0' && char <= '9') ||
        char == '_'
      }
    ) Some(new PaymentMethodId(value))
    else None

  implicit val decoder: Decoder[PaymentMethodId] = Decoder.decodeString.emap { str =>
    apply(str).toRight(s"PaymentMethodId $str had invalid characters")
  }
  implicit val encoder: Encoder[PaymentMethodId] = Encoder.encodeString.contramap[PaymentMethodId](_.value)

}
case class PaymentMethodId private (value: String) extends AnyVal

case class DirectDebitPaymentFields(
    accountHolderName: String,
    sortCode: String,
    accountNumber: String,
    recaptchaToken: String,
) extends PaymentFields

case class SepaPaymentFields(
    accountHolderName: String,
    iban: String,
    country: Option[String],
    streetName: Option[String],
) extends PaymentFields

case class ExistingPaymentFields(billingAccountId: String) extends PaymentFields

case class AmazonPayPaymentFields(amazonPayBillingAgreementId: String) extends PaymentFields

object PaymentFields {
  // Payment fields are input from support-frontend
  implicit val payPalPaymentFieldsCodec: Codec[PayPalPaymentFields] = deriveCodec
  implicit val stripePaymentMethodPaymentFieldsCodec: Codec[StripePaymentFields] = deriveCodec
  implicit val directDebitPaymentFieldsCodec: Codec[DirectDebitPaymentFields] = deriveCodec
  implicit val sepaPaymentFieldsCodec: Codec[SepaPaymentFields] = deriveCodec
  implicit val existingPaymentFieldsCodec: Codec[ExistingPaymentFields] = deriveCodec
  implicit val amazonPayPaymentFieldsCodec: Codec[AmazonPayPaymentFields] = deriveCodec

  implicit val encodePaymentFields: Encoder[PaymentFields] = Encoder.instance {
    case p: PayPalPaymentFields => p.asJson
    case s: StripePaymentFields => s.asJson
    case d: DirectDebitPaymentFields => d.asJson
    case s: SepaPaymentFields => s.asJson.deepDropNullValues
    case e: ExistingPaymentFields => e.asJson
    case a: AmazonPayPaymentFields => a.asJson
  }

  implicit val decodePaymentFields: Decoder[PaymentFields] = {
    import CodecHelpers.withClue
    List[Decoder[PaymentFields]](
      withClue(Decoder[PayPalPaymentFields].widen, "PayPalPaymentFields"),
      withClue(Decoder[StripePaymentFields].widen, "StripePaymentFields"),
      withClue(Decoder[DirectDebitPaymentFields].widen, "DirectDebitPaymentFields"),
      withClue(Decoder[SepaPaymentFields].widen, "SepaPaymentFields"),
      withClue(Decoder[ExistingPaymentFields].widen, "ExistingPaymentFields"),
      withClue(Decoder[AmazonPayPaymentFields].widen, "AmazonPayPaymentFields"),
    ).reduceLeft(CodecHelpers.or(_, _))
  }

}
