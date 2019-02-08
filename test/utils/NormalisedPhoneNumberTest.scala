package utils

import com.gu.i18n.Country
import org.scalatest.{FlatSpec, Matchers}

class NormalisedPhoneNumberTest extends FlatSpec with Matchers {

  "fromStringAndCountry" should "return None when no number or country is provided" in {
    NormalisedTelephoneNumber.fromStringAndCountry(None, Some(Country.UK)) shouldBe None
    NormalisedTelephoneNumber.fromStringAndCountry(Some("02033532000"), None) shouldBe None
    NormalisedTelephoneNumber.fromStringAndCountry(None, None) shouldBe None
  }
  "fromStringAndCountry" should "return None when an invalid number is provided" in {
    NormalisedTelephoneNumber.fromStringAndCountry(Some(":)"), Some(Country.UK)) shouldBe None
    NormalisedTelephoneNumber.fromStringAndCountry(Some("000000000000000000000000"), Some(Country.UK)) shouldBe None
    NormalisedTelephoneNumber.fromStringAndCountry(Some("07777777"), Some(Country.UK)) shouldBe None
  }
  "fromStringAndCountry" should "process a UK local number (Kings Place) with spaces" in {
    NormalisedTelephoneNumber.fromStringAndCountry(Some("020 3353 2000"), Some(Country.UK)) shouldBe Some(NormalisedTelephoneNumber("44", "2033532000"))
  }
  "fromStringAndCountry" should "process a UK local number without spaces" in {
    NormalisedTelephoneNumber.fromStringAndCountry(Some("02033532000"), Some(Country.UK)) shouldBe Some(NormalisedTelephoneNumber("44", "2033532000"))
  }
  "fromStringAndCountry" should "process a UK local number without a leading 0" in {
    NormalisedTelephoneNumber.fromStringAndCountry(Some("2033532000"), Some(Country.UK)) shouldBe Some(NormalisedTelephoneNumber("44", "2033532000"))
  }
  "fromStringAndCountry" should "process a UK local number with a preceding 0044" in {
    NormalisedTelephoneNumber.fromStringAndCountry(Some("00442033532000"), Some(Country.UK)) shouldBe Some(NormalisedTelephoneNumber("44", "2033532000"))
  }
  "fromStringAndCountry" should "process a UK local number with a preceding +44" in {
    NormalisedTelephoneNumber.fromStringAndCountry(Some("+442033532000"), Some(Country.UK)) shouldBe Some(NormalisedTelephoneNumber("44", "2033532000"))
  }
  "fromStringAndCountry" should "process a UK local number with a preceding +44 from Ireland" in {
    NormalisedTelephoneNumber.fromStringAndCountry(Some("+442033532000"), Some(Country.Ireland)) shouldBe Some(NormalisedTelephoneNumber("44", "2033532000"))
  }
  "fromStringAndCountry" should "process a UK local number with a preceding +44 from the US" in {
    NormalisedTelephoneNumber.fromStringAndCountry(Some("+442033532000"), Some(Country.US)) shouldBe Some(NormalisedTelephoneNumber("44", "2033532000"))
  }
  "fromStringAndCountry" should "process a UK local number with a preceding +44 from Australia" in {
    NormalisedTelephoneNumber.fromStringAndCountry(Some("+442033532000"), Some(Country.Australia)) shouldBe Some(NormalisedTelephoneNumber("44", "2033532000"))
  }
  "fromStringAndCountry" should "process a US local number (NY office) with dashes" in {
    NormalisedTelephoneNumber.fromStringAndCountry(Some("212-231-7762"), Some(Country.US)) shouldBe Some(NormalisedTelephoneNumber("1", "2122317762"))
  }
  "fromStringAndCountry" should "process a US local number with brackets" in {
    NormalisedTelephoneNumber.fromStringAndCountry(Some("212(231)7762"), Some(Country.US)) shouldBe Some(NormalisedTelephoneNumber("1", "2122317762"))
  }
  "fromStringAndCountry" should "process a US local number with  a leading +1" in {
    NormalisedTelephoneNumber.fromStringAndCountry(Some("+12122317762"), Some(Country.US)) shouldBe Some(NormalisedTelephoneNumber("1", "2122317762"))
  }
  "fromStringAndCountry" should "process a US local number with  a leading +1 from Canada" in {
    NormalisedTelephoneNumber.fromStringAndCountry(Some("+12122317762"), Some(Country.Canada)) shouldBe Some(NormalisedTelephoneNumber("1", "2122317762"))
  }
  "fromStringAndCountry" should "process an AU local number (Sydney) with spaces" in {
    NormalisedTelephoneNumber.fromStringAndCountry(Some("02 8076 8500"), Some(Country.Australia)) shouldBe Some(NormalisedTelephoneNumber("61", "280768500"))
  }
  "fromStringAndCountry" should "process an AU local number (Sydney) with leading +61" in {
    NormalisedTelephoneNumber.fromStringAndCountry(Some("+612 8076 8500"), Some(Country.Australia)) shouldBe Some(NormalisedTelephoneNumber("61", "280768500"))
  }
}


