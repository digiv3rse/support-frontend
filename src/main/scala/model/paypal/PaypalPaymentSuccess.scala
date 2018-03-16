package model.paypal

import java.net.URL

import backend.BackendError
import com.paypal.api.payments.Payment
import io.circe.generic.JsonCodec

import scala.collection.JavaConverters._
import scala.util.Try

@JsonCodec case class PaypalPaymentSuccess(approvalUrl: String, paymentId: String)

object PaypalPaymentSuccess {

  def fromPayment(payment: Payment): Either[BackendError, PaypalPaymentSuccess] = {
    (for {
      links <- Option(payment.getLinks)
      approvalLinks <- links.asScala.find(_.getRel.equalsIgnoreCase("approval_url"))
      approvalUrl <- Try {
        new URL(approvalLinks.getHref)
      }.toOption.map(_.getHost)
      paymentId <- Option(payment.getId)
    } yield PaypalPaymentSuccess(approvalUrl, paymentId))
      .map(Right(_))
      .getOrElse(Left(BackendError.fromPaypalAPIError(PaypalApiError.fromString("Unable to parse payment"))))
  }

}