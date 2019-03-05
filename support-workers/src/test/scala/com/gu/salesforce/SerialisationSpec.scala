package com.gu.salesforce

import com.gu.salesforce.Fixtures._
import com.gu.salesforce.Salesforce.{Authentication, NewContact, UpsertData}
import com.typesafe.scalalogging.LazyLogging
import io.circe.Printer
import io.circe.parser._
import io.circe.syntax._
import org.joda.time.DateTime
import org.scalatest.{FlatSpec, Matchers}

class SerialisationSpec extends FlatSpec with Matchers with LazyLogging {

  "UpsertData" should "serialise to correct UK json" in {
    val upsertData = UpsertData(newContactUK)
    upsertData.asJson.pretty(Printer.noSpaces.copy(dropNullValues = true)) should be(parse(upsertJson).right.get.noSpaces)
  }

  "UpsertData" should "serialise to correct US json" in {
    val upsertData = UpsertData(newContactUS)
    upsertData.asJson.pretty(Printer.noSpaces.copy(dropNullValues = true)) should be(parse(upsertJsonWithState).right.get.noSpaces)
  }

  "UpsertData" should "serialise to correct json when telephoneNumber provided" in {
    val upsertData = UpsertData(newContactUK.copy(Phone = Some(telephoneNumber)))
    upsertData.asJson.pretty(Printer.noSpaces.copy(dropNullValues = true)) should be(parse(upsertJsonWithTelephoneNumber).right.get.noSpaces)
  }

  "UpsertData" should "serialise to correct json when billing address provided" in {
    val upsertData = UpsertData(newContactUKWithBillingAddress)
    upsertData.asJson.pretty(Printer.noSpaces.copy(dropNullValues = true)) should be(parse(upsertJsonWithBillingAddress).right.get.noSpaces)
  }

  "UpsertData" should "serialise to correct json when billing address and delivery address provided" in {
    val upsertData = UpsertData(newContactUKWithBothAddressesAndTelephone)
    upsertData.asJson.pretty(Printer.noSpaces.copy(dropNullValues = true)) should be(parse(upsertJsonWithBillingAndDeliveryAddresses).right.get.noSpaces)
  }

  "Authentication" should "deserialize correctly" in {
    val now = DateTime.now()
    val stale = DateTime.parse("1971-02-20")

    //Deserialize a fresh token
    val decodeResult = decode[Authentication](authJson.format(now.getMillis)) //issued_at time is in millis
    decodeResult.isRight should be(true)
    decodeResult.right.get.isFresh should be(true)

    //Deserialize a stale token
    val decodeResult2 = decode[Authentication](authJson.format(stale.getMillis))
    decodeResult2.isRight should be(true)
    decodeResult2.right.get.isFresh should be(false)
  }
}
