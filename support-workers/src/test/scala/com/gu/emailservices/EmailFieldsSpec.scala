package com.gu.emailservices

import com.gu.i18n.Currency.GBP
import com.gu.support.config.TouchPointEnvironments.SANDBOX
import com.gu.support.workers.integration.TestData
import com.gu.support.workers.integration.TestData.{countryOnlyAddress, directDebitPaymentMethod}
import com.gu.support.workers.states.SendThankYouEmailState._
import com.gu.support.workers._
import com.gu.support.workers.integration.SendThankYouEmailManualTest.sfContactRecord
import io.circe.parser._
import io.circe.syntax._
import org.joda.time.LocalDate
import org.scalatest.Inside
import org.scalatest.flatspec.{AnyFlatSpec, AsyncFlatSpec}
import org.scalatest.matchers.should.Matchers

class EmailFieldsSpec extends AnyFlatSpec with Matchers {
  "EmailPayload" should "serialize to json" in {
    val Right(expectedJson) = parse(
      s"""
         |{
         |  "To": {
         |    "Address": "email@email.com",
         |    "ContactAttributes": {
         |      "SubscriberAttributes": { "attribute1" : "value1" ,  "attribute2" : "value2" }
         |    }
         |  },
         |  "DataExtensionName": "dataExtensionName",
         |  "SfContactId": "sfContactId",
         |  "IdentityUserId": "identityUserId"
         |}
      """.stripMargin
    )

    val serializedJson =
      EmailPayload(
      EmailPayloadTo(
        "email@email.com",
        EmailPayloadContactAttributes(
          Map("attribute1" -> "value1", "attribute2" -> "value2")
        )
      ),
      "dataExtensionName",
      Some("sfContactId"),
      Some("identityUserId")
    ).asJson

    serializedJson shouldBe expectedJson
  }
}

class DigitalPackEmailFieldsSpec extends AsyncFlatSpec with Matchers with Inside {

  it should "generate the right json for direct subs" in {
    val expectedJson = parse(
      """{
        |"To" : {
        |  "Address" : "test@gu.com",
        |  "ContactAttributes" : {
        |    "SubscriberAttributes" : {
        |      "first_name" : "Mickey",
        |      "emailaddress" : "test@gu.com",
        |      "mandateid" : "65HK26E",
        |      "subscription_details" : "£119.90 for the first year",
        |      "date_of_first_payment" : "Monday, 14 January 2019",
        |      "country" : "United Kingdom",
        |      "trial_period" : "14",
        |      "account_number" : "******11",
        |      "zuorasubscriberid" : "A-S00045678",
        |      "sort_code" : "20-20-20",
        |      "last_name" : "Mouse",
        |      "account_name" : "Mickey Mouse",
        |      "default_payment_method" : "Direct Debit"
        |    }
        |  }
        |},
        |"DataExtensionName" : "digipack",
        |"SfContactId" : "0033E00001DTBHJQA5",
        |"IdentityUserId" : null
        |}
        |""".stripMargin)
    val actual = new DigitalPackEmailFields(
      new PaperFieldsGenerator(TestData.promotionService, TestData.getMandate),
      TestData.getMandate,
      SANDBOX,
    ).build(
      SendThankYouEmailDigitalSubscriptionDirectPurchaseState(
        User("1234", "test@gu.com", None, "Mickey", "Mouse", billingAddress = countryOnlyAddress),
        sfContactRecord,
        DigitalPack(GBP, Annual),
        directDebitPaymentMethod,
        PaymentSchedule(List(Payment(new LocalDate(2019, 1, 14), 119.90))),
        None,
        "acno",
        "A-S00045678",
      )
    ).map(_.map(ef => parse(ef.payload)))
    actual.map(inside(_) {
      case actualJson :: Nil =>
        actualJson should be(expectedJson)
    })
  }


  it should "generate the right json for corporate subs" in {
    val expectedJson = parse(
      """{
        |"To" : {
        |  "Address" : "test@gu.com",
        |  "ContactAttributes" : {
        |    "SubscriberAttributes" : {
        |      "first_name" : "Mickey",
        |      "emailaddress" : "test@gu.com",
        |      "subscription_details" : "Group subscription",
        |      "zuorasubscriberid" : "A-S00045678",
        |      "last_name" : "Mouse"
        |    }
        |  }
        |},
        |"DataExtensionName" : "digipack-corporate-redemption",
        |"SfContactId" : "0033E00001DTBHJQA5",
        |"IdentityUserId" : null
        |}
        |""".stripMargin)
    val actual = new DigitalPackEmailFields(
      new PaperFieldsGenerator(TestData.promotionService, TestData.getMandate),
      TestData.getMandate,
      SANDBOX,
    ).build(
      SendThankYouEmailDigitalSubscriptionCorporateRedemptionState(
        User("1234", "test@gu.com", None, "Mickey", "Mouse", billingAddress = countryOnlyAddress),
        sfContactRecord,
        DigitalPack(GBP, Annual),
        "A-S00045678",
      )
    ).map(_.map(ef => parse(ef.payload)))
    actual.map(inside(_) {
      case actualJson :: Nil =>
        actualJson should be(expectedJson)
    })
  }
}
