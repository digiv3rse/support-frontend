package backend

import cats.data.EitherT
import cats.kernel.Semigroup
import com.gu.acquisition.model.errors.AnalyticsServiceError
import model.DefaultThreadPool
import services.{ContributionsStoreService, EmailService, IdentityClient}
import model.paypal.{PaypalApiError => PaypalAPIError}
import cats.implicits._
import model.amazonpay.{AmazonPayApiError => AmazonPayError }
import model.stripe.{StripeApiError => StripeError}

import scala.concurrent.Future

sealed abstract class BackendError extends Exception {
  override def getMessage: String = this match {
    case BackendError.Database(err) => err.getMessage
    case BackendError.IdentityServiceError(err) => err.getMessage
    case BackendError.Ophan(err) => err.map(_.getMessage).mkString(", ")
    case BackendError.StripeApiError(err) => err.getMessage
    case BackendError.PaypalApiError(err) => err.message
    case BackendError.AmazonPayApiError(err) => err.message
    case BackendError.Email(err) => err.getMessage
    case BackendError.MultipleErrors(errors) => errors.map(_.getMessage).mkString(" & ")
    case BackendError.SubscribeWithGoogleDuplicateEventError(error) => error.getMessage
  }
}

object BackendError {
  final case class IdentityIdMissingError(error: String) extends BackendError
  final case class Database(error: ContributionsStoreService.Error) extends BackendError
  final case class IdentityServiceError(error: IdentityClient.ContextualError) extends BackendError
  final case class Ophan(error: List[AnalyticsServiceError]) extends BackendError
  final case class PaypalApiError(error: PaypalAPIError) extends BackendError
  final case class StripeApiError(error: StripeError) extends BackendError
  final case class AmazonPayApiError(err: AmazonPayError) extends BackendError
  final case class SubscribeWithGoogleDuplicateEventError(error: SubscribeWithGoogleDuplicateInsertEventError) extends BackendError
  final case class Email(error: EmailService.Error) extends BackendError
  final case class MultipleErrors(errors: List[BackendError]) extends BackendError

  implicit val backendSemiGroup: Semigroup[BackendError] =
  Semigroup.instance((x,y) => MultipleErrors(List(x,y)))

  def combineResults(
      result1: EitherT[Future, BackendError, Unit],
      result2:  EitherT[Future, BackendError, Unit])(implicit pool: DefaultThreadPool):  EitherT[Future, BackendError, Unit] = {
    EitherT(for {
      r1 <- result1.toValidated
      r2 <- result2.toValidated
    } yield {
      r1.combine(r2).toEither
    })
  }

  def identityIdMissingError(err: String): BackendError = IdentityIdMissingError(err)
  def fromIdentityError(err: IdentityClient.ContextualError): BackendError = IdentityServiceError(err)
  def fromDatabaseError(err: ContributionsStoreService.Error): BackendError = Database(err)
  def fromOphanError(err: List[AnalyticsServiceError]): BackendError = Ophan(err)
  def fromPaypalAPIError(err: PaypalAPIError): BackendError = PaypalApiError(err)
  def fromStripeApiError(err: StripeError): BackendError = StripeApiError(err)
  def fromEmailError(err: EmailService.Error): BackendError = Email(err)
  def fromSubscribeWithGoogleDuplicatePaymentError(err: SubscribeWithGoogleDuplicateInsertEventError): BackendError =
    SubscribeWithGoogleDuplicateEventError(err)
}
