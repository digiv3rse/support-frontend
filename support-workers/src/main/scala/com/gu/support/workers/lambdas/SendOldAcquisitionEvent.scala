package com.gu.support.workers.lambdas

import java.util.UUID
import com.amazonaws.services.lambda.runtime.Context
import com.gu.acquisition.model.errors.AnalyticsServiceError
import com.gu.acquisition.model.{GAData, OphanIds}
import com.gu.acquisition.typeclasses.AcquisitionSubmissionBuilder
import com.gu.aws.AwsCloudWatchMetricPut
import com.gu.aws.AwsCloudWatchMetricSetup.paymentSuccessRequest
import com.gu.config.Configuration
import com.gu.i18n.Country
import com.gu.monitoring.{LambdaExecutionResult, SafeLogger, Success}
import com.gu.services.{ServiceProvider, Services}
import com.gu.support.catalog
import com.gu.support.catalog.GuardianWeekly.postIntroductorySixForSixBillingPeriod
import com.gu.support.catalog.{Contribution => _, DigitalPack => _, Paper => _, _}
import com.gu.support.promotions.{DefaultPromotions, PromoCode}
import com.gu.support.workers._
import com.gu.support.workers.states.SendThankYouEmailState._
import com.gu.support.workers.states.{SendAcquisitionEventState, SendThankYouEmailState}
import ophan.thrift.event.{PrintOptions, PrintProduct, Product => OphanProduct}
import ophan.thrift.{event => thrift}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

// This class sends acquisition events to the data lake via the old acquisition-event-producer library
// we are changing to a new approach which writes directly to BigQuery.
// When we are happy that the new approach is working successfully we can remove this
// class, however we will also need to migrate the code which writes acquisition events to
// Google Analytics and the contributions Kinesis stream as both of those are serviced via
// acquisition-event-producer currently

class SendOldAcquisitionEvent(serviceProvider: ServiceProvider = ServiceProvider)
  extends ServicesHandler[SendAcquisitionEventState, Unit](serviceProvider) {

  import SendOldAcquisitionEvent._
  import cats.instances.future._

  def this() = this(ServiceProvider)

  override protected def servicesHandler(
    state: SendAcquisitionEventState,
    requestInfo: RequestInfo,
    context: Context,
    services: Services
  ): FutureHandlerResult = {

    state.sendThankYouEmailState match {
      case _: SendThankYouEmailDigitalSubscriptionGiftRedemptionState =>
        // We don't want to send an acquisition event for Digital subscription gift redemptions as we have already done so on purchase
        Future.successful(HandlerResult((), requestInfo))
      case _ =>
        sendAcquisitionEvent(state, requestInfo, services)
    }

  }

  private def sendAcquisitionEvent(state: SendAcquisitionEventState, requestInfo: RequestInfo, services: Services) = {
    SafeLogger.info(s"Sending acquisition event to ophan: ${state.toString}")
    // Throw any error in the EitherT monad so that it can be processed by ErrorHandler.handleException
    services.acquisitionService.submit(
      SendAcquisitionEventStateAndRequestInfo(state, requestInfo)
    ).fold(
      errors => throw AnalyticsServiceErrorList(errors),
      _ => HandlerResult((), requestInfo)
    )
  }

}

case class SendAcquisitionEventStateAndRequestInfo(
  state: SendAcquisitionEventState,
  requestInfo: RequestInfo
)

object SendOldAcquisitionEvent {

  case class AnalyticsServiceErrorList(errors: List[AnalyticsServiceError]) extends Throwable {
    override def getMessage: String = errors.map(_.getMessage).mkString(". ")
  }

  def paymentProviderFromPaymentMethod(paymentMethod: PaymentMethod): thrift.PaymentProvider =
    paymentMethod match {
      case creditCardPayment: CreditCardReferenceTransaction =>
        creditCardPayment.StripePaymentType match {
          case Some(StripePaymentType.StripeApplePay) => thrift.PaymentProvider.StripeApplePay
          case Some(StripePaymentType.StripePaymentRequestButton) => thrift.PaymentProvider.StripePaymentRequestButton
          case _ => thrift.PaymentProvider.Stripe
        }
      case _: PayPalReferenceTransaction => thrift.PaymentProvider.Paypal
      case _: DirectDebitPaymentMethod | _: ClonedDirectDebitPaymentMethod => thrift.PaymentProvider.Gocardless
      case _: SepaPaymentMethod => thrift.PaymentProvider.StripeSepa
      case _: AmazonPayPaymentMethod => thrift.PaymentProvider.AmazonPay
    }

  // Typeclass instance used by the Ophan service to attempt to build a submission from the state.
  private implicit val stateAcquisitionSubmissionBuilder: AcquisitionSubmissionBuilder[SendAcquisitionEventStateAndRequestInfo] =

    new AcquisitionSubmissionBuilder[SendAcquisitionEventStateAndRequestInfo] {

      import cats.syntax.either._

      override def buildOphanIds(stateAndInfo: SendAcquisitionEventStateAndRequestInfo): Either[String, OphanIds] =
        Either.fromOption(stateAndInfo.state.acquisitionData.map(_.ophanIds), "acquisition data not included")

      override def buildGAData(stateAndInfo: SendAcquisitionEventStateAndRequestInfo): Either[String, GAData] = {
        for {
          acquisitionData <- Either.fromOption(stateAndInfo.state.acquisitionData, "acquisition data not included")
          ref = acquisitionData.referrerAcquisitionData
          hostname <- Either.fromOption(ref.hostname, "missing hostname in referrer acquisition data")
          gaClientId = ref.gaClientId.getOrElse(UUID.randomUUID().toString)
          ipAddress = ref.ipAddress
          userAgent = ref.userAgent
        } yield GAData(
          hostname = hostname,
          clientId = gaClientId,
          clientIpAddress = ipAddress,
          clientUserAgent = userAgent
        )
      }

      def paymentFrequencyFromBillingPeriod(billingPeriod: BillingPeriod): thrift.PaymentFrequency =
      // object BillingObject extends the BillingObject trait.
      // Don't match on this as its not a valid billing period.
        (billingPeriod: @unchecked) match {
          case Monthly => thrift.PaymentFrequency.Monthly
          case Quarterly => thrift.PaymentFrequency.Quarterly
          case SixWeekly if postIntroductorySixForSixBillingPeriod == Quarterly => thrift.PaymentFrequency.Quarterly
          case SixWeekly => thrift.PaymentFrequency.Monthly
          case Annual => thrift.PaymentFrequency.Annually
        }

      def printOptionsFromProduct(product: ProductType, deliveryCountry: Option[Country]): Option[PrintOptions] = {

        def printProduct(fulfilmentOptions: FulfilmentOptions, productOptions: ProductOptions): PrintProduct = {
          (fulfilmentOptions, productOptions) match {
            case (HomeDelivery, Everyday) => PrintProduct.HomeDeliveryEveryday
            case (HomeDelivery, Sixday) => PrintProduct.HomeDeliverySixday
            case (HomeDelivery, Weekend) => PrintProduct.HomeDeliveryWeekend
            case (HomeDelivery, Saturday) => PrintProduct.HomeDeliverySaturday
            case (HomeDelivery, Sunday) => PrintProduct.HomeDeliverySunday
            case (Collection, Everyday) => PrintProduct.VoucherEveryday
            case (Collection, Sixday) => PrintProduct.VoucherSixday
            case (Collection, Weekend) => PrintProduct.VoucherWeekend
            case (Collection, Saturday) => PrintProduct.VoucherSaturday
            case _ => PrintProduct.VoucherSunday
          }
        }

        product match {
          case p: Paper => Some(PrintOptions(printProduct(p.fulfilmentOptions, p.productOptions), "GB"))
          case _: GuardianWeekly => Some(PrintOptions(PrintProduct.GuardianWeekly, deliveryCountry.map(_.alpha2).getOrElse("")))
          case _ => None
        }
      }

      override def buildAcquisition(stateAndInfo: SendAcquisitionEventStateAndRequestInfo): Either[String, thrift.Acquisition] = {
        val (productType, productAmount) = stateAndInfo.state.sendThankYouEmailState.product match {
          case c: Contribution => (OphanProduct.RecurringContribution, c.amount.toDouble)
          case _: DigitalPack => (OphanProduct.DigitalSubscription, 0D) //TODO: Send the real amount in the acquisition event
          case _: Paper => (OphanProduct.PrintSubscription, 0D) //TODO: same as above
          case _: GuardianWeekly => (OphanProduct.PrintSubscription, 0D) //TODO: same as above
        }

        Either.fromOption(
          stateAndInfo.state.acquisitionData.map { data =>
            thrift.Acquisition(
              product = productType,
              printOptions = printOptionsFromProduct(stateAndInfo.state.sendThankYouEmailState.product, stateAndInfo.state.user.deliveryAddress.map(_.country)),
              paymentFrequency = paymentFrequencyFromBillingPeriod(stateAndInfo.state.sendThankYouEmailState.product.billingPeriod),
              currency = stateAndInfo.state.sendThankYouEmailState.product.currency.iso,
              amount = productAmount,
              paymentProvider = maybePaymentProvider(stateAndInfo.state.sendThankYouEmailState),
              // Currently only passing through at most one campaign code
              campaignCode = data.referrerAcquisitionData.campaignCode.map(Set(_)),
              abTests = Some(thrift.AbTestInfo(
                data.supportAbTests ++ data.referrerAcquisitionData.abTests.getOrElse(Set())
              )),
              countryCode = Some(stateAndInfo.state.user.billingAddress.country.alpha2),
              referrerPageViewId = data.referrerAcquisitionData.referrerPageviewId,
              referrerUrl = data.referrerAcquisitionData.referrerUrl,
              componentId = data.referrerAcquisitionData.componentId,
              componentTypeV2 = data.referrerAcquisitionData.componentType,
              source = data.referrerAcquisitionData.source,
              platform = Some(ophan.thrift.event.Platform.Support),
              queryParameters = data.referrerAcquisitionData.queryParameters,
              identityId = Some(stateAndInfo.state.user.id),
              labels = buildLabels(stateAndInfo)
            )
          },
          "acquisition data not included"
        )
      }

      def buildLabels(stateAndInfo: SendAcquisitionEventStateAndRequestInfo) =
        Some(Set(
          if (stateAndInfo.requestInfo.accountExists) Some("REUSED_EXISTING_PAYMENT_METHOD") else None,
          if (isSixForSix(stateAndInfo)) Some("guardian-weekly-six-for-six") else None,
          if (stateAndInfo.state.analyticsInfo.isGiftPurchase) Some("gift-subscription") else None,
          stateAndInfo.state.sendThankYouEmailState match {
            case _: SendThankYouEmailDigitalSubscriptionCorporateRedemptionState => Some("corporate-subscription")
            case _ => None
          }
        ).flatten)

      def isSixForSix(stateAndInfo: SendAcquisitionEventStateAndRequestInfo) =
        stateAndInfo.state.sendThankYouEmailState match {
          case state: SendThankYouEmailGuardianWeeklyState =>
            state.product.billingPeriod == Quarterly && state.promoCode.contains(DefaultPromotions.GuardianWeekly.NonGift.sixForSix)
          case _ => false
        }
    }

  def maybePaymentProvider(s: SendThankYouEmailState): Option[thrift.PaymentProvider] = (s match {
    case s: SendThankYouEmailContributionState => Some(s.paymentMethod)
    case s: SendThankYouEmailDigitalSubscriptionDirectPurchaseState => Some(s.paymentMethod)
    case s: SendThankYouEmailDigitalSubscriptionGiftPurchaseState => Some(s.paymentMethod)
    case _: SendThankYouEmailDigitalSubscriptionCorporateRedemptionState => None
    case _: SendThankYouEmailDigitalSubscriptionGiftRedemptionState => None
    case s: SendThankYouEmailPaperState => Some(s.paymentMethod)
    case s: SendThankYouEmailGuardianWeeklyState => Some(s.paymentMethod)
  }).map(paymentProviderFromPaymentMethod)

  def maybePromoCode(s: SendThankYouEmailState): Option[PromoCode] = s match {
    case _: SendThankYouEmailContributionState => None
    case s: SendThankYouEmailDigitalSubscriptionDirectPurchaseState => s.promoCode
    case s: SendThankYouEmailDigitalSubscriptionGiftPurchaseState => s.promoCode
    case _: SendThankYouEmailDigitalSubscriptionCorporateRedemptionState => None
    case _: SendThankYouEmailDigitalSubscriptionGiftRedemptionState => None
    case s: SendThankYouEmailPaperState => s.promoCode
    case s: SendThankYouEmailGuardianWeeklyState => s.promoCode
  }
}
