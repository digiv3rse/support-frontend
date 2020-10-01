package com.gu.support.redemptions

import java.util.Locale

import com.gu.support.encoding.Codec
import io.circe.{Decoder, Encoder}

object RedemptionCode {
  val length = 13

  def apply(value: String): Either[String, RedemptionCode] = {
    val lower = value.toLowerCase(Locale.UK)
    // make sure no one can inject anything bad
    val validChars = List('a' -> 'z', '0' -> '9', '-' -> '-')
    val validCharsSet = validChars.flatMap { case (from, to) => (from to to) }.toSet
    if (lower.forall(validCharsSet.contains))
      Right(new RedemptionCode(lower))
    else
      Left(s"redemption code must only include a-z, 0-9 and '-'")
  }

  implicit val encoder: Encoder[RedemptionCode] = Encoder.encodeString.contramap(_.value)

  implicit val decoder: Decoder[RedemptionCode] = Decoder.decodeString.emap(apply)

  implicit val corporateCodec: Codec[RedemptionCode] = new Codec[RedemptionCode](encoder, decoder)

}
case class RedemptionCode private (value: String)
