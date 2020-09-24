package controllers

import akka.actor.ActorSystem
import akka.stream.{ActorMaterializer, Materializer}
import backend._
import cats.data.EitherT
import cats.implicits._
import model.{DefaultThreadPool, PaymentStatus}
import model.subscribewithgoogle.GoogleRecordPayment
import play.api.{ApplicationLoader, Configuration, Environment}
import play.api.http.Status
import play.api.inject.DefaultApplicationLifecycle
import play.api.libs.json.Json
import play.api.test.{FakeRequest, Helpers}
import play.api.test.Helpers._
import play.core.DefaultWebCommands
import util.RequestBasedProvider
import io.circe.syntax._
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito._
import org.scalatest.matchers.must.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.mockito.MockitoSugar
import services.ContributionsStoreService

import scala.concurrent.{ExecutionContext, Future}


class SubscribeWithGoogleControllerFixture()(implicit _ec: ExecutionContext, context: ApplicationLoader.Context)
  extends MockitoSugar {

  val ec = implicitly[ExecutionContext]

  val refundGooglePayment = GoogleRecordPayment("Guardian",
    "email@example.com",
    PaymentStatus.Refunded,
    BigDecimal(1.00),
    "GBP",
    "UK",
    "my-super-payment-id",
    System.currentTimeMillis()
  )

  val paidGooglePayment = GoogleRecordPayment("Guardian",
    "email@example.com",
    PaymentStatus.Paid,
    BigDecimal(1.00),
    "GBP",
    "UK",
    "my-super-payment-id",
    System.currentTimeMillis()
  )

  val failedGooglePayment = GoogleRecordPayment("Guardian",
    "email@example.com",
    PaymentStatus.Failed,
    BigDecimal(1.00),
    "GBP",
    "UK",
    "my-super-payment-id",
    System.currentTimeMillis()
  )

  val dbInsertResult: EitherT[Future, ContributionsStoreService.Error, Unit] =
    EitherT.right(Future.successful(()))

  val dbInsertError: EitherT[Future, ContributionsStoreService.Error, Unit] =
    EitherT.left(Future.successful(ContributionsStoreService.Error(new Exception("Didn't update :("))))

  val recordPaymentResult: EitherT[Future, BackendError, Unit] =
    EitherT.right(Future.successful(()))

  val recordPaymentError: EitherT[Future, BackendError, Unit] =
    EitherT.left(Future.successful(BackendError.fromDatabaseError(ContributionsStoreService.Error(new Exception("Didn't update :(")))))

  val mockSubscribeWithGoogleBackend = mock[SubscribeWithGoogleBackend]

  val subscribeWithGoogleBackendProvider: RequestBasedProvider[SubscribeWithGoogleBackend] =
    mock[RequestBasedProvider[SubscribeWithGoogleBackend]]


  val subscribeWithGoogleController = new SubscribeWithGoogleController(stubControllerComponents(),
    subscribeWithGoogleBackendProvider)(DefaultThreadPool(ec), List.empty)

}

class SubscribeWithGoogleControllerSpec extends AnyWordSpec with Matchers with Status with MockitoSugar {

  implicit val actorSystem: ActorSystem = ActorSystem()
  implicit val materializer: Materializer = ActorMaterializer()
  implicit val executionContext: ExecutionContext = ExecutionContext.global

  implicit val context = ApplicationLoader.Context.create(Environment.simple())

  "Subscribe with Google Controller" must {
    "process a refund" in {
      val fixture = new SubscribeWithGoogleControllerFixture() {
        when(subscribeWithGoogleBackendProvider.getInstanceFor(any())(any()))
          .thenReturn(mockSubscribeWithGoogleBackend)

        when(mockSubscribeWithGoogleBackend.recordRefund(any())).thenReturn(dbInsertResult)
      }

      val json = Json.parse(fixture.refundGooglePayment.asJson.noSpaces)
      val request = FakeRequest("POST", "/contribute/one-off/swg/record-refund")
        .withJsonBody(json)

      val eventualResult: Future[play.api.mvc.Result] =
        Helpers.call(fixture.subscribeWithGoogleController.refundPayment, request)

      status(eventualResult) mustBe 200

      verify(fixture.mockSubscribeWithGoogleBackend, times(1)).recordRefund(any())
    }

    "process a refund and fail to change db" in {
      val fixture = new SubscribeWithGoogleControllerFixture() {
        when(subscribeWithGoogleBackendProvider.getInstanceFor(any())(any()))
          .thenReturn(mockSubscribeWithGoogleBackend)

        when(mockSubscribeWithGoogleBackend.recordRefund(any())).thenReturn(dbInsertError)
      }

      val json = Json.parse(fixture.refundGooglePayment.asJson.noSpaces)
      val request = FakeRequest("POST", "/contribute/one-off/swg/record-refund")
        .withJsonBody(json)

      val eventualResult: Future[play.api.mvc.Result] =
        Helpers.call(fixture.subscribeWithGoogleController.refundPayment, request)

      status(eventualResult) mustBe 500

      verify(fixture.mockSubscribeWithGoogleBackend, times(1)).recordRefund(any())
    }

    "receive a payment on refund route" in {
      val fixture = new SubscribeWithGoogleControllerFixture() {
        when(subscribeWithGoogleBackendProvider.getInstanceFor(any())(any()))
          .thenReturn(mockSubscribeWithGoogleBackend)

        when(mockSubscribeWithGoogleBackend.recordRefund(any())).thenReturn(dbInsertError)
      }

      val json = Json.parse(fixture.paidGooglePayment.asJson.noSpaces)
      val request = FakeRequest("POST", "/contribute/one-off/swg/record-refund")
        .withJsonBody(json)

      val eventualResult: Future[play.api.mvc.Result] =
        Helpers.call(fixture.subscribeWithGoogleController.refundPayment, request)

      status(eventualResult) mustBe 400

      verify(fixture.mockSubscribeWithGoogleBackend, times(0)).recordRefund(any())
    }

    "receive a payment fail on refund route" in {
      val fixture = new SubscribeWithGoogleControllerFixture() {
        when(subscribeWithGoogleBackendProvider.getInstanceFor(any())(any()))
          .thenReturn(mockSubscribeWithGoogleBackend)

        when(mockSubscribeWithGoogleBackend.recordRefund(any())).thenReturn(dbInsertError)
      }

      val json = Json.parse(fixture.failedGooglePayment.asJson.noSpaces)
      val request = FakeRequest("POST", "/contribute/one-off/swg/record-refund")
        .withJsonBody(json)

      val eventualResult: Future[play.api.mvc.Result] =
        Helpers.call(fixture.subscribeWithGoogleController.refundPayment, request)

      status(eventualResult) mustBe 400

      verify(fixture.mockSubscribeWithGoogleBackend, times(0)).recordRefund(any())
    }

    "process a payment" in {
      val fixture = new SubscribeWithGoogleControllerFixture() {
        when(subscribeWithGoogleBackendProvider.getInstanceFor(any())(any()))
          .thenReturn(mockSubscribeWithGoogleBackend)

        when(mockSubscribeWithGoogleBackend.recordPayment(any(), any()))
          .thenReturn(recordPaymentResult)
      }

      val json = Json.parse(fixture.paidGooglePayment.asJson.noSpaces)
      val request = FakeRequest("POST", "/contribute/one-off/swg/record-payment")
        .withJsonBody(json)

      val eventualResult: Future[play.api.mvc.Result] =
        Helpers.call(fixture.subscribeWithGoogleController.recordPayment, request)

      status(eventualResult) mustBe 200

      verify(fixture.mockSubscribeWithGoogleBackend, times(1))
        .recordPayment(any(), any())
    }

    "process a payment and fail" in {
      val fixture = new SubscribeWithGoogleControllerFixture() {
        when(subscribeWithGoogleBackendProvider.getInstanceFor(any())(any()))
          .thenReturn(mockSubscribeWithGoogleBackend)

        when(mockSubscribeWithGoogleBackend.recordPayment(any(), any()))
          .thenReturn(recordPaymentError)
      }

      val json = Json.parse(fixture.paidGooglePayment.asJson.noSpaces)
      val request = FakeRequest("POST", "/contribute/one-off/swg/record-payment")
        .withJsonBody(json)

      val eventualResult: Future[play.api.mvc.Result] =
        Helpers.call(fixture.subscribeWithGoogleController.recordPayment, request)

      status(eventualResult) mustBe 500

      verify(fixture.mockSubscribeWithGoogleBackend, times(1))
        .recordPayment(any(), any())
    }

    "receive a payment fail and do nothing" in {
      val fixture = new SubscribeWithGoogleControllerFixture() {
        when(subscribeWithGoogleBackendProvider.getInstanceFor(any())(any()))
          .thenReturn(mockSubscribeWithGoogleBackend)

        when(mockSubscribeWithGoogleBackend.recordPayment(any(), any()))
          .thenReturn(recordPaymentError)
      }

      val json = Json.parse(fixture.failedGooglePayment.asJson.noSpaces)
      val request = FakeRequest("POST", "/contribute/one-off/swg/record-payment")
        .withJsonBody(json)

      val eventualResult: Future[play.api.mvc.Result] =
        Helpers.call(fixture.subscribeWithGoogleController.recordPayment, request)

      status(eventualResult) mustBe 400

      verify(fixture.mockSubscribeWithGoogleBackend, times(0))
        .recordPayment(any(), any())
    }
    "receive a payment refund on payment route" in {
      val fixture = new SubscribeWithGoogleControllerFixture() {
        when(subscribeWithGoogleBackendProvider.getInstanceFor(any())(any()))
          .thenReturn(mockSubscribeWithGoogleBackend)

        when(mockSubscribeWithGoogleBackend.recordPayment(any(), any()))
          .thenReturn(recordPaymentError)
      }

      val json = Json.parse(fixture.refundGooglePayment.asJson.noSpaces)
      val request = FakeRequest("POST", "/contribute/one-off/swg/record-payment")
        .withJsonBody(json)

      val eventualResult: Future[play.api.mvc.Result] =
        Helpers.call(fixture.subscribeWithGoogleController.recordPayment, request)

      status(eventualResult) mustBe 400

      verify(fixture.mockSubscribeWithGoogleBackend, times(0))
        .recordPayment(any(), any())
    }
  }
}
