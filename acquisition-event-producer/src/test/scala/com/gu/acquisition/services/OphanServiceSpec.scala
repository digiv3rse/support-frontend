package com.gu.acquisition.services

import cats.implicits._
import com.gu.acquisition.model.{AcquisitionSubmission, GAData, OphanIds}
import okhttp3.OkHttpClient
import ophan.thrift.event._
import org.scalatest.{Matchers, WordSpecLike}
import scala.concurrent.ExecutionContext.Implicits.global

class OphanServiceSpec extends WordSpecLike with Matchers {

  implicit val client: OkHttpClient = new OkHttpClient()

  val service: OphanService = new OphanService()

  val submission: AcquisitionSubmission = AcquisitionSubmission(
    OphanIds(Some("pageviewId"), Some("visitId"), Some("browserId")),
    GAData("support.theguardian.com", "GA1.1.1633795050.1537436107", None, None),
    Acquisition(
      product = ophan.thrift.event.Product.Contribution,
      paymentFrequency = PaymentFrequency.OneOff,
      currency = "GBP",
      amount = 20d,
      paymentProvider = Some(PaymentProvider.Stripe),
      campaignCode = Some(Set("FAKE_ACQUISITION_EVENT")),
      abTests = Some(AbTestInfo(Set(AbTest("test_name", "variant_name")))),
      countryCode = Some("US"),
      referrerPageViewId = None,
      referrerUrl = None,
      componentId = None,
      componentTypeV2 = None,
      source = None
    )
  )

  "An Ophan service" should {

    "build a correct request" in {

      def checkRequest() = {

        service.buildRequest(submission).map {
          requestData =>
            val request = requestData.request
            request.method shouldEqual "GET"
            request.header("Cookie") shouldEqual "vsid=visitId;bwid=browserId"

            request.url().url().toString shouldEqual
              "https://ophan.theguardian.com/a.gif?viewId=pageviewId&acquisition={%22product%22:%22CONTRIBUTION%22,%22paymentFrequency%22:%22ONE_OFF%22,%22currency%22:%22GBP%22,%22amount%22:20.0,%22paymentProvider%22:%22STRIPE%22,%22campaignCode%22:[%22FAKE_ACQUISITION_EVENT%22],%22abTests%22:{%22tests%22:[{%22name%22:%22test_name%22,%22variant%22:%22variant_name%22}]},%22countryCode%22:%22US%22}"
        }
      }

      // Check request is as expected
      checkRequest()

      // Check idempotency of request builder.
      // Previously a mutable request builder was accumulating state over multiple requests!
      checkRequest()
    }
  }
}
