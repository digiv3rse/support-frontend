package backend

import cats.data.EitherT
import cats.instances.future._
import cats.syntax.apply._
import cats.syntax.either._
import cats.syntax.validated._
import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsync
import com.paypal.api.payments.Payment
import com.typesafe.scalalogging.StrictLogging
import play.api.libs.ws.WSClient
import conf._
import conf.ConfigLoader._
import model._
import model.acquisition.PaypalAcquisition
import model.db.ContributionData
import model.email.ContributorRow
import model.paypal._
import services._
import util.EnvironmentBasedBuilder

import scala.concurrent.Future
import scala.collection.JavaConverters._
import scala.util.Try

class PaypalBackend(
                     paypalService: PaypalService,
                     databaseService: ContributionsStoreService,
                     identityService: IdentityService,
                     ophanService: AnalyticsService,
                     emailService: EmailService,
                     cloudWatchService: CloudWatchService
)(implicit pool: DefaultThreadPool) extends StrictLogging {

  /*
   * Used by web clients.
   * Creates a payment which must be authorised by the user via PayPal's web UI.
   * Once authorised, the payment can be executed via the execute-payment endpoint.
   */
  def createPayment(c: CreatePaypalPaymentData): EitherT[Future, PaypalApiError, Payment] =
    paypalService.createPayment(c)
      .leftMap { error =>
        logger.error(s"Error creating paypal payment data. Error: $error")
        error
      }

  /*
   * Used by Android app clients.
   * The Android app creates and approves the payment directly via PayPal.
   * Funds are captured via this endpoint.
   */
  def capturePayment(capturePaymentData: CapturePaypalPaymentData, clientBrowserInfo: ClientBrowserInfo): EitherT[Future, PaypalApiError, EnrichedPaypalPayment] =
    paypalService.capturePayment(capturePaymentData)
      .bimap(
        err => {
          cloudWatchService.recordFailedPayment(err, PaymentProvider.Paypal)
          err
        },
        payment => {
          cloudWatchService.recordPaymentSuccess(PaymentProvider.Paypal)

          val maybeEmail = capturePaymentData.signedInUserEmail.orElse(
            Try(payment.getPayer.getPayerInfo.getEmail).toOption.filterNot(_.isEmpty)
          )

          maybeEmail.foreach { email =>
            getOrCreateIdentityIdFromEmail(email).foreach { identityIdWithGuestAccountCreationToken =>
              postPaymentTasks(payment, email, identityIdWithGuestAccountCreationToken.map(_.identityId), capturePaymentData.acquisitionData, clientBrowserInfo)
            }
          }

          // The app doesn't need the guest account token in the response, because it has no 'set password' step after payment
          EnrichedPaypalPayment(payment, maybeEmail, guestAccountCreationToken = None)
        }
      )

  def executePayment(executePaymentData: ExecutePaypalPaymentData, clientBrowserInfo: ClientBrowserInfo): EitherT[Future, PaypalApiError, EnrichedPaypalPayment] =
    paypalService.executePayment(executePaymentData)
      .leftMap(err => {
          cloudWatchService.recordFailedPayment(err, PaymentProvider.Paypal)
          err
      })
      .semiflatMap { payment =>
        cloudWatchService.recordPaymentSuccess(PaymentProvider.Paypal)

        getOrCreateIdentityIdFromEmail(executePaymentData.email).map { identityIdWithGuestAccountCreationToken =>
          postPaymentTasks(payment, executePaymentData.email, identityIdWithGuestAccountCreationToken.map(_.identityId), executePaymentData.acquisitionData, clientBrowserInfo)

          EnrichedPaypalPayment(payment, Some(executePaymentData.email), identityIdWithGuestAccountCreationToken.flatMap(_.guestAccountCreationToken))
        }
      }

  def processRefundHook(data: PaypalRefundWebHookData): EitherT[Future, BackendError, Unit] = {
    for {
      _ <- validateRefundHook(data.headers, data.body.rawBody)
      dbUpdateResult <- flagContributionAsRefunded(data.body.parentPaymentId)
    } yield dbUpdateResult
  }

  // Success or failure of these steps shouldn't affect the response to the client
  private def postPaymentTasks(payment: Payment, email: String, identityId: Option[Long], acquisitionData: AcquisitionData, clientBrowserInfo: ClientBrowserInfo): Unit = {
    trackContribution(payment, acquisitionData, email, identityId, clientBrowserInfo)
      .leftMap(trackErr => logger.error(s"unable to track contribution due to error: ${trackErr.getMessage}"))

    val emailResult = for {
      id <- EitherT.fromOption(
        identityId,
        BackendError.identityIdMissingError(s"no identity ID for $email")
      )
      contributorRow <- contributorRowFromPayment(email, id, payment)
      _ <- emailService.sendThankYouEmail(contributorRow).leftMap(BackendError.fromEmailError)
    } yield ()

    emailResult.leftMap { err =>
      logger.error(s"unable to send email: ${err.getMessage}", err)
    }
  }

  private def trackContribution(payment: Payment, acquisitionData: AcquisitionData, email: String, identityId: Option[Long], clientBrowserInfo: ClientBrowserInfo): EitherT[Future, BackendError, Unit] = {
    ContributionData.fromPaypalCharge(payment, email, identityId, clientBrowserInfo.countrySubdivisionCode)
      .leftMap { error =>
        logger.error(s"Error creating contribution data from paypal. Error: $error")
        BackendError.fromPaypalAPIError(error)
      }
      .toEitherT[Future]
      .flatMap { contributionData =>
        BackendError.combineResults(
          submitAcquisitionToOphan(payment, acquisitionData, contributionData.identityId, clientBrowserInfo),
          insertContributionDataIntoDatabase(contributionData)
        )
      }
      .leftMap { err =>
        logger.error("Error tracking contribution", err)
        err
      }
  }


  private def getOrCreateIdentityIdFromEmail(email: String): Future[Option[IdentityIdWithGuestAccountCreationToken]] =
    identityService.getOrCreateIdentityIdFromEmail(email)
      .fold(
        err => {
          logger.warn(s"unable to get identity id for email $email, tracking acquisition anyway. Error: ${err.getMessage}")
          None
        },
        identityIdWithGuestAccountCreationToken => Some(identityIdWithGuestAccountCreationToken)
      )

  private def insertContributionDataIntoDatabase(contributionData: ContributionData): EitherT[Future, BackendError, Unit] = {
    // log so that if something goes wrong we can reconstruct the missing data from the logs
    logger.info(s"about to insert contribution into database: $contributionData")
    databaseService.insertContributionData(contributionData)
      .leftMap(BackendError.fromDatabaseError)
  }

  private def submitAcquisitionToOphan(payment: Payment, acquisitionData: AcquisitionData, identityId: Option[Long], clientBrowserInfo: ClientBrowserInfo): EitherT[Future, BackendError, Unit] =
    ophanService.submitAcquisition(PaypalAcquisition(payment, acquisitionData, identityId, clientBrowserInfo))
      .bimap(BackendError.fromOphanError, _ => ())

  private def validateRefundHook(headers: Map[String, String], rawJson: String): EitherT[Future, BackendError, Unit] =
    paypalService.validateWebhookEvent(headers, rawJson)
      .leftMap(BackendError.fromPaypalAPIError)

  private def flagContributionAsRefunded(paypalPaymentId: String): EitherT[Future, BackendError, Unit] =
    databaseService.flagContributionAsRefunded(paypalPaymentId)
      .leftMap(BackendError.fromDatabaseError)

  private def contributorRowFromPayment(email: String, identityId: Long, payment: Payment): EitherT[Future, BackendError, ContributorRow] = {

    def errorMessage(details: String) = s"contributorRowFromPayment unable to extract contributorRow, $details"

    val firstName = for {
      payer <- Option(payment.getPayer)
      info <- Option(payer.getPayerInfo)
      firstName <- Option(info.getFirstName)
    } yield firstName

    val contributorRow = for {
      transactions <- Option(payment.getTransactions).toRight(s"unable to get Transactions for $identityId")
      transaction <- transactions.asScala.headOption.toRight(s"no transactions found for $identityId")
      amount <- Try(BigDecimal(transaction.getAmount.getTotal)).toEither.leftMap(e => s"unable to extract amount for $identityId ${e.getMessage}")
    } yield {
      ContributorRow(email, transaction.getAmount.getCurrency, identityId, PaymentProvider.Paypal, firstName, amount)
    }

    contributorRow.left.foreach(message => logger.error(errorMessage(message)))
    EitherT.fromEither[Future](contributorRow.leftMap(message => BackendError.fromPaypalAPIError(PaypalApiError.fromString(errorMessage(message)))))
  }

}

object PaypalBackend {

  private def apply(
                     paypalService: PaypalService,
                     databaseService: ContributionsStoreService,
                     identityService: IdentityService,
                     ophanService: AnalyticsService,
                     emailService: EmailService,
                     cloudWatchService: CloudWatchService
  )(implicit pool: DefaultThreadPool): PaypalBackend = {
    new PaypalBackend(paypalService, databaseService, identityService, ophanService, emailService, cloudWatchService)
  }

  class Builder(configLoader: ConfigLoader, cloudWatchAsyncClient: AmazonCloudWatchAsync)(
    implicit defaultThreadPool: DefaultThreadPool,
    paypalThreadPool: PaypalThreadPool,
    sqsThreadPool: SQSThreadPool,
    wsClient: WSClient
  ) extends EnvironmentBasedBuilder[PaypalBackend] {

    override def build(env: Environment): InitializationResult[PaypalBackend] = (
      configLoader
        .loadConfig[Environment, PaypalConfig](env)
        .map(PaypalService.fromPaypalConfig): InitializationResult[PaypalService],
      configLoader
        .loadConfig[Environment, ContributionsStoreQueueConfig](env)
        .andThen(ContributionsStoreQueueService.fromContributionsStoreQueueConfig): InitializationResult[ContributionsStoreQueueService],
      configLoader
        .loadConfig[Environment, IdentityConfig](env)
        .map(IdentityService.fromIdentityConfig): InitializationResult[IdentityService],
      services.AnalyticsService(configLoader, env),
      configLoader
        .loadConfig[Environment, EmailConfig](env)
        .andThen(EmailService.fromEmailConfig): InitializationResult[EmailService],
      new CloudWatchService(cloudWatchAsyncClient, env).valid: InitializationResult[CloudWatchService],
    ).mapN(PaypalBackend.apply)
  }
}

