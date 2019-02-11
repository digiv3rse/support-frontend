package com.gu.support.zuora.api

import com.gu.i18n.Currency.{AUD, GBP}
import com.gu.support.workers.CreditCardReferenceTransaction
import com.typesafe.scalalogging.LazyLogging
import org.scalatest.{AsyncFlatSpec, Matchers}

class PaymentGatewaySpec extends AsyncFlatSpec with Matchers with LazyLogging {

  "PaymentGateway" should "match to the correct PaymentMethod" in {
    val stripePaymentMethod = CreditCardReferenceTransaction("", "", "", None, 1, 1, "Visa")
    PaymentGateway.forPaymentMethod(stripePaymentMethod, AUD) should be(StripeGatewayAUD)
    PaymentGateway.forPaymentMethod(stripePaymentMethod, GBP) should be(StripeGatewayDefault)
  }

}
