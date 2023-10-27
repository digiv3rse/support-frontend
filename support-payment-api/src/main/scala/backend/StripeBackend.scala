package backend

import akka.actor.ActorSystem
import cats.data.EitherT
import cats.instances.future._
import cats.syntax.apply._
import cats.syntax.validated._
import com.amazonaws.services.cloudwatch.AmazonCloudWatchAsync
import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.sqs.model.SendMessageResult
import com.gu.support.acquisitions.eventbridge.AcquisitionsEventBusService
import com.gu.support.acquisitions.eventbridge.AcquisitionsEventBusService.Sources
import com.gu.support.config.Stages.{CODE, PROD}
import com.stripe.model.{Charge, PaymentIntent}
import com.typesafe.scalalogging.StrictLogging
import conf.ConfigLoader._
import conf._
import model.Environment.{Live, Test}
import model._
import model.acquisition.{AcquisitionDataRowBuilder, StripeAcquisition}
import model.db.ContributionData
import model.email.ContributorRow
import model.stripe.StripeApiError.{recaptchaErrorText, stripeDisabledErrorText}
import model.stripe.StripePaymentMethod.{StripeApplePay, StripeCheckout, StripePaymentRequestButton}
import model.stripe._
import play.api.libs.ws.WSClient
import services._
import util.EnvironmentBasedBuilder

import scala.concurrent.Future
import scala.jdk.CollectionConverters._

class StripeBackend(
    stripeService: StripeService,
    val databaseService: ContributionsStoreService,
    identityService: IdentityService,
    val acquisitionsEventBusService: AcquisitionsEventBusService,
    emailService: EmailService,
    recaptchaService: RecaptchaService,
    cloudWatchService: CloudWatchService,
    val supporterProductDataService: SupporterProductDataService,
    val softOptInsService: SoftOptInsService,
    val switchService: SwitchService,
    environment: Environment,
)(implicit pool: DefaultThreadPool, WSClient: WSClient)
    extends StrictLogging
    with PaymentBackend {

  switchService.startPoller()

  // We only want the backend switch to be valid if the frontend switch is enabled
  private def recaptchaEnabled =
    switchService.allSwitches
      .map(s =>
        s.recaptchaSwitches.exists(switch =>
          switch.switches.enableRecaptchaFrontend.state.isOn && switch.switches.enableRecaptchaBackend.state.isOn,
        ),
      )

  private def stripeEnabled(request: StripePaymentIntentRequest.CreatePaymentIntent) =
    request.paymentData.stripePaymentMethod match {
      case Some(StripeCheckout) => stripeCheckoutEnabled
      case Some(StripeApplePay) => stripeApplePayEnabled
      case Some(StripePaymentRequestButton) => stripePaymentRequestEnabled
      case None => stripeCheckoutEnabled
    }

  private def stripeCheckoutEnabled =
    switchService.allSwitches.map(switch => switch.oneOffPaymentMethods.exists(s => s.switches.stripe.state.isOn))

  private def stripeApplePayEnabled =
    switchService.allSwitches.map(switch =>
      switch.oneOffPaymentMethods.exists(s => s.switches.stripeApplePay.state.isOn),
    )

  private def stripePaymentRequestEnabled =
    switchService.allSwitches.map(switch =>
      switch.oneOffPaymentMethods.exists(s => s.switches.stripePaymentRequestButton.state.isOn),
    )

  // Ok using the default thread pool - the mapping function is not computationally intensive, nor does is perform IO.
  // Legacy handler for the Stripe Charges API. Still required for mobile apps payments
  def createCharge(
      chargeData: LegacyStripeChargeRequest,
      clientBrowserInfo: ClientBrowserInfo,
  ): EitherT[Future, StripeApiError, StripeCreateChargeResponse] =
    stripeService
      .createCharge(chargeData)
      .leftMap(err => {
        logger.info(s"unable to create Stripe charge ($chargeData)")
        cloudWatchService.recordFailedPayment(err, PaymentProvider.Stripe)
        err
      })
      .semiflatMap { charge =>
        cloudWatchService.recordPaymentSuccess(PaymentProvider.Stripe)

        getOrCreateIdentityIdFromEmail(chargeData.paymentData.email.value).map { identityId =>
          postPaymentTasks(chargeData.paymentData.email.value, chargeData, charge, clientBrowserInfo, identityId)

          StripeCreateChargeResponse.fromCharge(charge)
        }
      }

  def processRefundHook(refundHook: StripeRefundHook): EitherT[Future, BackendError, Unit] = {
    for {
      _ <- validateRefundHook(refundHook)
      dbUpdateResult <- flagContributionAsRefunded(refundHook.data.`object`.id)
    } yield dbUpdateResult
  }

  def createPaymentIntent(
      request: StripePaymentIntentRequest.CreatePaymentIntent,
      clientBrowserInfo: ClientBrowserInfo,
  ): EitherT[Future, StripeApiError, StripePaymentIntentsApiResponse] = {

    def isApplePayOrPaymentRequestButton = request.paymentData.stripePaymentMethod match {
      case Some(StripeApplePay) | Some(StripePaymentRequestButton) => true
      case _ => false
    }

    // Check the Switch Bypass Recaptcha for Test Stripe account // Apple Pay on Live
    // Note that in DEV/CODE there is no Live StripeBackend, so it will never verify Recaptcha
    def recaptchaRequired() =
      recaptchaEnabled.map {
        case true =>
          environment match {
            case Live if isApplePayOrPaymentRequestButton =>
              false
            case Live =>
              true
            case Test =>
              false
          }
        case _ =>
          false
      }

    def createIntent(): EitherT[Future, StripeApiError, StripePaymentIntentsApiResponse] = {
      stripeService
        .createPaymentIntent(request)
        .leftMap(err => {
          logger.info(
            s"Unable to create Stripe Payment Intent ($request). User-Agent was: ${clientBrowserInfo.userAgent}",
          )
          cloudWatchService.recordFailedPayment(err, PaymentProvider.Stripe)
          err
        })
        .flatMap { paymentIntent =>
          // https://stripe.com/docs/payments/intents#intent-statuses
          paymentIntent.getStatus match {
            case "requires_action" =>
              // 3DS required, return the clientSecret to the client
              EitherT.fromEither(Right(StripePaymentIntentsApiResponse.RequiresAction(paymentIntent.getClientSecret)))

            case "succeeded" =>
              // Payment complete without the need for 3DS - do post-payment tasks and return success to client
              EitherT.liftF[Future, StripeApiError, StripePaymentIntentsApiResponse](
                paymentIntentSucceeded(request, paymentIntent, clientBrowserInfo),
              )

            case otherStatus =>
              logger.info(s"Unexpected status on Stripe Payment Intent: $otherStatus. Request was $request")
              val error =
                StripeApiError.fromString(s"Unexpected status on Stripe Payment Intent: $otherStatus", publicKey = None)
              cloudWatchService.recordFailedPayment(error, PaymentProvider.Stripe)
              EitherT.fromEither(Left(error))
          }
        }
    }

    def checkRecaptcha: EitherT[Future, StripeApiError, StripePaymentIntentsApiResponse] = recaptchaRequired().flatMap {
      case true =>
        recaptchaService
          .verify(request.recaptchaToken)
          .flatMap { resp =>
            if (resp.success) createIntent()
            else EitherT.leftT(StripeApiError.fromString(recaptchaErrorText, publicKey = None))
          }
      case false =>
        createIntent()
    }

    stripeEnabled(request).flatMap {
      case true =>
        checkRecaptcha
      case false =>
        EitherT.leftT(StripeApiError.fromString(stripeDisabledErrorText, publicKey = None))
    }
  }
  def confirmPaymentIntent(
      request: StripePaymentIntentRequest.ConfirmPaymentIntent,
      clientBrowserInfo: ClientBrowserInfo,
  ): EitherT[Future, StripeApiError, StripePaymentIntentsApiResponse.Success] = {

    stripeService
      .confirmPaymentIntent(request)
      .leftMap(err => {
        logger.info(s"Unable to confirm Stripe Payment Intent ($request)")
        cloudWatchService.recordFailedPayment(err, PaymentProvider.Stripe)
        err
      })
      .flatMap { paymentIntent =>
        // At this point we expect the PaymentIntent to have been ready for confirmation. Status should be 'succeeded'
        paymentIntent.getStatus match {
          case "succeeded" => EitherT.liftF(paymentIntentSucceeded(request, paymentIntent, clientBrowserInfo))

          case otherStatus =>
            logger.info(s"Unexpected status on Stripe Payment Intent: $otherStatus. Request was $request")
            val error =
              StripeApiError.fromString(s"Unexpected status on Stripe Payment Intent: $otherStatus", publicKey = None)
            cloudWatchService.recordFailedPayment(error, PaymentProvider.Stripe)
            EitherT.fromEither(Left(error))
        }
      }
  }

  private def paymentIntentSucceeded(
      request: StripeRequest,
      paymentIntent: PaymentIntent,
      clientBrowserInfo: ClientBrowserInfo,
  ): Future[StripePaymentIntentsApiResponse.Success] = {

    cloudWatchService.recordPaymentSuccess(PaymentProvider.Stripe)

    getOrCreateIdentityIdFromEmail(request.paymentData.email.value).map { identityId =>
      paymentIntent.getCharges.getData.asScala.toList.headOption match {
        case Some(charge) =>
          postPaymentTasks(request.paymentData.email.value, request, charge, clientBrowserInfo, identityId)
        case None =>
          /** This should never happen, but in case it does we still return success to the client because the payment
            * was reported as successful by Stripe. It does however prevent us from executing post-payment tasks and so
            * would need investigation.
            */
          cloudWatchService.recordPostPaymentTasksError(
            PaymentProvider.Stripe,
            s"No charge found on completed Stripe Payment Intent, cannot do post-payment tasks. Request was $request",
          )
      }

      StripePaymentIntentsApiResponse.Success()
    }
  }

  private def postPaymentTasks(
      email: String,
      chargeData: StripeRequest,
      charge: Charge,
      clientBrowserInfo: ClientBrowserInfo,
      identityId: Option[Long],
  ): Unit = {
    trackContribution(charge, chargeData, identityId, clientBrowserInfo)
      .map(errors =>
        cloudWatchService.recordPostPaymentTasksErrors(
          PaymentProvider.Stripe,
          errors,
        ),
      )

    identityId.foreach { id =>
      sendThankYouEmail(email, chargeData, id).leftMap { err =>
        cloudWatchService.recordPostPaymentTasksError(
          PaymentProvider.Stripe,
          s"unable to send thank you email: ${err.getMessage}",
        )
      }
    }
  }

  private def trackContribution(
      charge: Charge,
      data: StripeRequest,
      identityId: Option[Long],
      clientBrowserInfo: ClientBrowserInfo,
  ): Future[List[BackendError]] = {
    val contributionData = ContributionData.fromStripeCharge(
      identityId,
      charge,
      clientBrowserInfo.countrySubdivisionCode,
      data.acquisitionData.postalCode,
      PaymentProvider.fromStripePaymentMethod(data.paymentData.stripePaymentMethod),
    )

    val stripeAcquisition = StripeAcquisition(data, charge, identityId, clientBrowserInfo)

    track(
      acquisition = AcquisitionDataRowBuilder.buildFromStripe(stripeAcquisition, contributionData),
      contributionData,
    )
  }

  private def getOrCreateIdentityIdFromEmail(email: String): Future[Option[Long]] =
    identityService
      .getOrCreateIdentityIdFromEmail(email)
      .fold(
        err => {
          logger
            .warn(s"unable to get identity id for email $email, tracking acquisition anyway. Error: ${err.getMessage}")
          None
        },
        identityIdWithGuestAccountCreationToken => Some(identityIdWithGuestAccountCreationToken),
      )

  private def validateRefundHook(refundHook: StripeRefundHook): EitherT[Future, BackendError, Unit] =
    stripeService
      .validateRefundHook(refundHook)
      .leftMap(BackendError.fromStripeApiError)

  private def flagContributionAsRefunded(stripePaymentId: String): EitherT[Future, BackendError, Unit] =
    databaseService
      .flagContributionAsRefunded(stripePaymentId)
      .leftMap(BackendError.fromDatabaseError)

  private def sendThankYouEmail(
      email: String,
      data: StripeRequest,
      identityId: Long,
  ): EitherT[Future, BackendError, SendMessageResult] = {
    val contributorRow = ContributorRow(
      email,
      data.paymentData.currency.toString,
      identityId,
      PaymentProvider.Stripe,
      None,
      data.paymentData.amount,
    )

    emailService.sendThankYouEmail(contributorRow).leftMap(BackendError.fromEmailError)
  }
}

object StripeBackend {

  private def apply(
      stripeService: StripeService,
      databaseService: ContributionsStoreService,
      identityService: IdentityService,
      acquisitionsEventBusService: AcquisitionsEventBusService,
      emailService: EmailService,
      recaptchaService: RecaptchaService,
      cloudWatchService: CloudWatchService,
      supporterProductDataService: SupporterProductDataService,
      softOptInsService: SoftOptInsService,
      switchService: SwitchService,
      environment: Environment,
  )(implicit pool: DefaultThreadPool, WSClient: WSClient, awsClient: AmazonS3): StripeBackend = {
    new StripeBackend(
      stripeService,
      databaseService,
      identityService,
      acquisitionsEventBusService,
      emailService,
      recaptchaService,
      cloudWatchService,
      supporterProductDataService,
      softOptInsService,
      switchService,
      environment,
    )
  }

  class Builder(configLoader: ConfigLoader, cloudWatchAsyncClient: AmazonCloudWatchAsync)(implicit
      defaultThreadPool: DefaultThreadPool,
      stripeThreadPool: StripeThreadPool,
      sqsThreadPool: SQSThreadPool,
      wsClient: WSClient,
      awsClient: AmazonS3,
      system: ActorSystem,
  ) extends EnvironmentBasedBuilder[StripeBackend] {

    override def build(env: Environment): InitializationResult[StripeBackend] = (
      configLoader
        .loadConfig[Environment, StripeConfig](env)
        .map(StripeService.fromStripeConfig): InitializationResult[StripeService],
      configLoader
        .loadConfig[Environment, ContributionsStoreQueueConfig](env)
        .andThen(ContributionsStoreQueueService.fromContributionsStoreQueueConfig): InitializationResult[
        ContributionsStoreQueueService,
      ],
      configLoader
        .loadConfig[Environment, IdentityConfig](env)
        .map(IdentityService.fromIdentityConfig): InitializationResult[IdentityService],
      AcquisitionsEventBusService(Sources.paymentApi, if (env == Live) PROD else CODE).valid,
      configLoader
        .loadConfig[Environment, EmailConfig](env)
        .andThen(EmailService.fromEmailConfig): InitializationResult[EmailService],
      configLoader
        .loadConfig[Environment, RecaptchaConfig](env)
        .andThen(RecaptchaService.fromRecaptchaConfig): InitializationResult[RecaptchaService],
      new CloudWatchService(cloudWatchAsyncClient, env).valid: InitializationResult[CloudWatchService],
      new SupporterProductDataService(env).valid: InitializationResult[SupporterProductDataService],
      SoftOptInsService(env).valid: InitializationResult[SoftOptInsService],
      new SwitchService(env)(awsClient, system, stripeThreadPool).valid: InitializationResult[SwitchService],
      env.valid: InitializationResult[Environment],
    ).mapN(StripeBackend.apply)
  }
}
