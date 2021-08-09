package com.gu.acquisitionEventsApi

import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent
import com.gu.i18n.{Country, Currency}
import com.gu.support.acquisitions.models.{AcquisitionDataRow, AcquisitionProduct, AcquisitionType, PaymentFrequency, PaymentProvider}
import com.gu.support.zuora.api.ReaderType
import org.joda.time.DateTime
import org.scalatest.matchers.should.Matchers
import org.scalatest.flatspec.AnyFlatSpec
import io.circe.syntax._

class LambdaSpec extends AnyFlatSpec with Matchers {
  val acquisition = AcquisitionDataRow(
    eventTimeStamp = new DateTime(1544710504165L),
    product = AcquisitionProduct.RecurringContribution,
    amount = Some(1.0),
    country = Country.UK,
    currency = Currency.GBP,
    componentId = Some("MY_COMPONENT_ID"),
    componentType = None,
    campaignCode = Some("MY_CAMPAIGN_CODE"),
    source = None,
    referrerUrl = Some("referrer-url"),
    abTests = Nil,
    paymentFrequency = PaymentFrequency.Monthly,
    paymentProvider = Some(PaymentProvider.Stripe),
    printOptions = None,
    browserId = None,
    identityId = None,
    pageViewId = None,
    referrerPageViewId = None,
    labels = Nil,
    promoCode = None,
    reusedExistingPaymentMethod = false,
    readerType = ReaderType.Direct,
    acquisitionType = AcquisitionType.Purchase,
    zuoraSubscriptionNumber = None,
    zuoraAccountNumber = None,
    contributionId = None,
    paymentId = None,
    queryParameters = Nil,
    platform = None
  )

  it should "successfully get big query config from SSM" in {
    val request = new APIGatewayProxyRequestEvent()
    request.setBody(acquisition.asJson.noSpaces)
    val result = Lambda.handler(request)
    println(result)
  }
}
