package com.gu.i18n

sealed trait Currency {
  def prefix: Option[String] = None
  def glyph: String
  def identifier: String = prefix.getOrElse("") + glyph
  def iso: String
}

object Currency {
  val all = List(GBP, USD, AUD, CAD, EUR, NZD, SEK, CHF, NOK, DKK)

  def fromString(s: String): Option[Currency] = all.find(_.iso == s)

  case object GBP extends Currency {
    override def glyph: String = "£"
    override def iso: String = "GBP"
  }
  case object USD extends Currency {
    override def glyph: String = "$"
    override def prefix: Option[String] = Some("US")
    override def iso: String = "USD"
  }
  case object AUD extends Currency {
    override def glyph: String = "$"
    override def prefix: Option[String] = Some("AU")
    override def iso: String = "AUD"
  }
  case object CAD extends Currency {
    override def glyph: String = "$"
    override def prefix: Option[String] = Some("CA")
    override def iso: String = "CAD"
  }
  case object EUR extends Currency {
    override def glyph: String = "€"
    override def iso: String = "EUR"
  }
  case object NZD extends Currency {
    override def glyph: String = "$"
    override def prefix: Option[String] = Some("NZ")
    override def iso: String = "NZD"
  }
  case object SEK extends Currency {
    override def glyph: String = "kr"
    override def prefix: Option[String] = Some("SE")
    override def iso: String = "SEK"
  }
  case object CHF extends Currency {
    override def glyph: String = "fr"
    override def prefix: Option[String] = Some("CH")
    override def iso: String = "CHF"
  }
  case object NOK extends Currency {
    override def glyph: String = "kr"
    override def prefix: Option[String] = Some("NO")
    override def iso: String = "NOK"
  }
  case object DKK extends Currency {
    override def glyph: String = "kr."
    override def prefix: Option[String] = Some("DK")
    override def iso: String = "DKK"
  }
}
