package com.gu.support.workers

import com.gu.i18n.Currency
import com.gu.support.SerialisationTestHelpers
import com.gu.support.catalog.RestOfWorld
import com.gu.support.encoding.CustomCodecs._
import com.gu.support.workers.Fixtures._
import com.gu.support.workers.states._
import com.typesafe.scalalogging.LazyLogging
import io.circe.generic.auto._
import org.scalatest.FlatSpec

class SerialisationSpec extends FlatSpec with SerialisationTestHelpers with LazyLogging {

  "Contribution JSON with a billing period set" should "be decoded correctly" in {
    val input = contribution(billingPeriod = Annual)
    testDecoding[Contribution](input, _.billingPeriod shouldBe Annual)
  }

  "CreatePaymentMethodState" should "deserialise correctly" in {
    testDecoding[CreatePaymentMethodState](createStripePaymentMethodContributionJson())
    testDecoding[CreatePaymentMethodState](createPayPalPaymentMethodContributionJson(Currency.USD))
    testDecoding[CreatePaymentMethodState](createPayPalPaymentMethodDigitalPackJson)
    testDecoding[CreatePaymentMethodState](createDirectDebitDigitalPackJson,
      _.acquisitionData.get.ophanIds.pageviewId shouldBe Some("jkcg440imu1c0m8pxpxe")
    )
    testDecoding[CreatePaymentMethodState](createDirectDebitGuardianWeeklyJson,
      state => state.product match {
        case g: GuardianWeekly => g.fulfilmentOptions shouldBe RestOfWorld
        case _ => fail()
      }
    )
  }

  "CreateSalesforceContactState" should "deserialise correctly" in {
    testDecoding[CreateSalesforceContactState](createSalesforceContactJson)
  }

  "CreateZuoraSubscription" should "deserialise correctly" in {
    testDecoding[CreateZuoraSubscriptionState](createContributionZuoraSubscriptionJson())
    testDecoding[CreateZuoraSubscriptionState](createContributionZuoraSubscriptionJson(Annual))
    testDecoding[CreateZuoraSubscriptionState](createDigiPackZuoraSubscriptionJson)
  }

  "SendThankYouEmailState" should "deserialise correctly" in {
    testDecoding[SendThankYouEmailState](thankYouEmailJson())
  }

  "FailureHandlerState" should "deserialise correctly from any lambda" in {
    testDecoding[FailureHandlerState](createPayPalPaymentMethodDigitalPackJson,
      state => state.paymentFields.isDefined shouldBe true
    )
    testDecoding[FailureHandlerState](createContributionZuoraSubscriptionJson(Annual),
      state => state.paymentMethod.isDefined shouldBe true
    )
  }

}
