package com.gu.support.encoding

import java.util.UUID

import com.gu.i18n.{Country, CountryGroup, Currency}
import io.circe.{Decoder, Encoder, KeyDecoder, KeyEncoder}
import org.joda.time.{DateTime, Days, LocalDate, Months}

import scala.util.Try

object CustomCodecs extends InternationalisationCodecs with HelperCodecs

trait InternationalisationCodecs {
  implicit val encodeCurrency: Encoder[Currency] = Encoder.encodeString.contramap[Currency](_.iso)

  implicit val decodeCurrency: Decoder[Currency] =
    Decoder.decodeString.emap { code => Currency.fromString(code).toRight(s"Unrecognised currency code '$code'") }

  implicit val currencyKeyEncoder: KeyEncoder[Currency] = (value: Currency) => value.iso

  implicit val currencyKeyDecoder: KeyDecoder[Currency] = (key: String) => Currency.fromString(key)

  implicit val encodeCountryAsAlpha2: Encoder[Country] = Encoder.encodeString.contramap[Country](_.alpha2)
  implicit val decodeCountry: Decoder[Country] =
    Decoder.decodeString.emap { code => CountryGroup.countryByCode(code).toRight(s"Unrecognised country code '$code'") }

  implicit val countryGroupEncoder: Encoder[CountryGroup] = Encoder.encodeString.contramap(_.name)

  implicit val countryGroupDecoder: Decoder[CountryGroup] = Decoder.decodeString.emap(id => CountryGroup.byName(id).toRight(s"Unrecognised country group id '$id'"))

  implicit val countryGroupKeyEncoder: KeyEncoder[CountryGroup] = (value: CountryGroup) => value.name.toString

  implicit val countryGroupKeyDecoder: KeyDecoder[CountryGroup] = (key: String) => CountryGroup.byName(key)
}

trait HelperCodecs {
  implicit val dayDecoder: Decoder[Days] = Decoder.decodeInt.map(Days.days)
  implicit val dayEncoder: Encoder[Days] = Encoder.encodeInt.contramap(_.getDays)
  implicit val monthDecoder: Decoder[Months] = Decoder.decodeInt.map(Months.months)
  implicit val monthEncoder: Encoder[Months] = Encoder.encodeInt.contramap(_.getMonths)
  implicit val encodeLocalTime: Encoder[LocalDate] = Encoder.encodeString.contramap(_.toString("yyyy-MM-dd"))
  implicit val decodeLocalTime: Decoder[LocalDate] = Decoder.decodeString.map(LocalDate.parse)
  implicit val encodeDateTime: Encoder[DateTime] = Encoder.encodeLong.contramap(_.getMillis)
  implicit val decodeDateTime: Decoder[DateTime] = Decoder
    .decodeLong.map(new DateTime(_))
    .or(Decoder.decodeString.map(DateTime.parse))
  implicit val uuidDecoder: Decoder[UUID] = Decoder.decodeString.emap(code => Try(UUID.fromString(code)).toOption.toRight(s"Invalid UUID '$code'"))
  implicit val uuidEncoder: Encoder[UUID] = Encoder.encodeString.contramap(_.toString)
}
