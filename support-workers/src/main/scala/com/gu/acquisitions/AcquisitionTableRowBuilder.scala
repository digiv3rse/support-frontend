package com.gu.acquisitions

import com.gu.acquisition.model.ReferrerAcquisitionData
import com.gu.acquisitions.AcquisitionType.{Purchase, Redemption}
import com.gu.i18n.Country
import com.gu.support.catalog._
import com.gu.support.promotions.DefaultPromotions
import com.gu.support.workers.lambdas.SendAcquisitionEventOld.paymentProviderFromPaymentMethod
import com.gu.support.workers.lambdas.SendAcquisitionEventStateAndRequestInfo
import com.gu.support.workers.states.SendThankYouEmailState.{SendThankYouEmailContributionState, SendThankYouEmailDigitalSubscriptionCorporateRedemptionState, SendThankYouEmailDigitalSubscriptionDirectPurchaseState, SendThankYouEmailDigitalSubscriptionGiftPurchaseState, SendThankYouEmailDigitalSubscriptionGiftRedemptionState, SendThankYouEmailGuardianWeeklyState, SendThankYouEmailPaperState}
import com.gu.support.workers.states.{SendAcquisitionEventState, SendThankYouEmailState}
import com.gu.support.workers.{AcquisitionData, Annual, BillingPeriod, ClonedDirectDebitPaymentMethod, Contribution, CreditCardReferenceTransaction, DigitalPack, DirectDebitPaymentMethod, GuardianWeekly, Monthly, Paper, PayPalReferenceTransaction, PaymentMethod, ProductType, Quarterly, RequestInfo, SixWeekly, StripePaymentType}
import com.gu.support.zuora.api.ReaderType.{Corporate, Direct, Gift}
import ophan.thrift.event.AbTest

import scala.collection.JavaConverters._

object AcquisitionTableRowBuilder {
  def buildAcquisitionTableRow(state: SendAcquisitionEventState, requestInfo: RequestInfo) = {
    val commonState = state.sendThankYouEmailState
    val (productType, amount) = productTypeAndAmount(commonState)
    val acquisitionTypeDetails = getAcquisitionTypeDetails(commonState)
    val row = Map(
      "product" -> productType,
      "amount" -> amount,
      "print_options" -> printOptionsFromProduct(commonState.product, commonState.user.deliveryAddress.map(_.country)),
      "payment_frequency" -> paymentFrequencyFromBillingPeriod(commonState.product.billingPeriod),
      "country_code" -> commonState.user.billingAddress.country.alpha2,
      "currency" -> commonState.product.currency.iso,
      "payment_provider" -> acquisitionTypeDetails.paymentProvider,
      "platform" -> "SUPPORT",
      "identity_id" -> commonState.user.id,
      "labels" -> buildLabels(state, requestInfo.accountExists)
    ) ++ state.acquisitionData.map(getReferrerData).getOrElse(Map[String, String]())

  }

  def productTypeAndAmount(state: SendThankYouEmailState) = state.product match {
    case c: Contribution => ("RECURRING_CONTRIBUTION", c.amount.toDouble)
    case _: DigitalPack => ("DIGITAL_SUBSCRIPTION", 0D)
    case _: Paper => ("PRINT_SUBSCRIPTION", 0D)
    case _: GuardianWeekly => ("PRINT_SUBSCRIPTION", 0D)
  }

  def printOptionsFromProduct(product: ProductType, deliveryCountry: Option[Country]): Option[Map[String, String]] = {

    def printProduct(fulfilmentOptions: FulfilmentOptions, productOptions: ProductOptions): String = {
      (fulfilmentOptions, productOptions) match {
        case (HomeDelivery, Everyday) => "HOME_DELIVERY_EVERYDAY"
        case (HomeDelivery, EverydayPlus) => "HOME_DELIVERY_EVERYDAY_PLUS"
        case (HomeDelivery, Sixday) => "HOME_DELIVERY_SIXDAY"
        case (HomeDelivery, SixdayPlus) => "HOME_DELIVERY_SIXDAY_PLUS"
        case (HomeDelivery, Weekend) => "HOME_DELIVERY_WEEKEND"
        case (HomeDelivery, WeekendPlus) => "HOME_DELIVERY_WEEKEND_PLUS"
        case (HomeDelivery, Saturday) => "HOME_DELIVERY_SATURDAY"
        case (HomeDelivery, SaturdayPlus) => "HOME_DELIVERY_SATURDAY_PLUS"
        case (HomeDelivery, Sunday) => "HOME_DELIVERY_SUNDAY"
        case (HomeDelivery, SundayPlus) => "HOME_DELIVERY_SUNDAY_PLUS"
        case (Collection, Everyday) => "VOUCHER_EVERYDAY"
        case (Collection, EverydayPlus) => "VOUCHER_EVERYDAY_PLUS"
        case (Collection, Sixday) => "VOUCHER_SIXDAY"
        case (Collection, SixdayPlus) => "VOUCHER_SIXDAY_PLUS"
        case (Collection, Weekend) => "VOUCHER_WEEKEND"
        case (Collection, WeekendPlus) => "VOUCHER_WEEKEND_PLUS"
        case (Collection, Saturday) => "VOUCHER_SATURDAY"
        case (Collection, SaturdayPlus) => "VOUCHER_SATURDAY_PLUS"
        case (Collection, Sunday) => "VOUCHER_SUNDAY"
        case _ => "VOUCHER_SUNDAY_PLUS"
      }
    }

    product match {
      case p: Paper => Some(Map(
        "product" -> printProduct(p.fulfilmentOptions, p.productOptions),
        "delivery_country_code" -> "GB"
      ))
      case _: GuardianWeekly => Some(Map(
        "product" -> "GUARDIAN_WEEKLY",
        "delivery_country_code" -> deliveryCountry.map(_.alpha2).getOrElse("")
      ))
      case _ => None
    }
  }

  def paymentFrequencyFromBillingPeriod(billingPeriod: BillingPeriod) =
    billingPeriod match {
      case Monthly => "MONTHLY"
      case Quarterly | SixWeekly => "QUARTERLY"
      case Annual => "ANNUALLY"
    }

  def getReferrerData(data: AcquisitionData) = {
    val abTests = (data.supportAbTests ++ data.referrerAcquisitionData.abTests.getOrElse(Set[AbTest]()))
      .map(abTest =>
        Map(
          "name" -> abTest.name,
          "variant" -> abTest.variant
        ).asJava)

    val queryParams = data.referrerAcquisitionData.queryParameters.getOrElse(Set())
      .map(queryParam =>
        Map(
          "key" -> queryParam.name,
          "value" -> queryParam.value
        ).asJava).asJava

    Map(
      // Currently only passing through at most one campaign code
      "campaign_codes" -> List(data.referrerAcquisitionData.campaignCode).asJava,
      "ab_tests" -> abTests,
      "referrer_page_view_id" -> data.referrerAcquisitionData.referrerPageviewId,
      "referrer_url" -> data.referrerAcquisitionData.referrerUrl,
      "component_id" -> data.referrerAcquisitionData.componentId,
      "component_type" -> data.referrerAcquisitionData.componentType,
      "source" -> data.referrerAcquisitionData.source,
      "query_parameters" -> queryParams
    )
  }

  def buildLabels(state: SendAcquisitionEventState, accountExists: Boolean) =
    Some(Set(
      if (accountExists) Some("REUSED_EXISTING_PAYMENT_METHOD") else None,
      if (isSixForSix(state)) Some("guardian-weekly-six-for-six") else None,
      if (state.analyticsInfo.isGiftPurchase) Some("gift-subscription") else None,
      state.sendThankYouEmailState match {
        case _: SendThankYouEmailDigitalSubscriptionCorporateRedemptionState => Some("corporate-subscription")
        case _ => None
      }
    ).flatten)

  def isSixForSix(state: SendAcquisitionEventState) =
    state.sendThankYouEmailState match {
      case state: SendThankYouEmailGuardianWeeklyState =>
        state.product.billingPeriod == Quarterly && state.promoCode.contains(DefaultPromotions.GuardianWeekly.NonGift.sixForSix)
      case _ => false
    }

  def getAcquisitionTypeDetails(s: SendThankYouEmailState): AcquisitionTypeDetails = (s match {
    case s: SendThankYouEmailContributionState =>
      AcquisitionTypeDetails(
        paymentProviderFromPaymentMethod(s.paymentMethod),
        Direct.value,
        Purchase.value
      )
    case s: SendThankYouEmailDigitalSubscriptionDirectPurchaseState =>
      AcquisitionTypeDetails(
        paymentProviderFromPaymentMethod(s.paymentMethod),
        Direct.value,
        Purchase.value
      )
    case s: SendThankYouEmailDigitalSubscriptionGiftPurchaseState =>
      AcquisitionTypeDetails(
        paymentProviderFromPaymentMethod(s.paymentMethod),
        Gift.value,
        Purchase.value
      )
    case s: SendThankYouEmailPaperState => AcquisitionTypeDetails(
      paymentProviderFromPaymentMethod(s.paymentMethod),
      Direct.value,
      Purchase.value
    )
    case s: SendThankYouEmailGuardianWeeklyState => AcquisitionTypeDetails(
      paymentProviderFromPaymentMethod(s.paymentMethod),
      if(s.giftRecipient.isDefined) Gift.value else Direct.value,
      Purchase.value
    )
    case _: SendThankYouEmailDigitalSubscriptionCorporateRedemptionState => AcquisitionTypeDetails(
      None,
      Corporate.value,
      Redemption.value
    )
    case _: SendThankYouEmailDigitalSubscriptionGiftRedemptionState => AcquisitionTypeDetails(
      None,
      Gift.value,
      Redemption.value
    )
  })

  def paymentProviderFromPaymentMethod(paymentMethod: PaymentMethod): Option[String] =
    Some(paymentMethod match {
      case creditCardPayment: CreditCardReferenceTransaction =>
        creditCardPayment.stripePaymentType match {
          case Some(StripePaymentType.StripeApplePay) => "STRIPE_APPLE_PAY"
          case Some(StripePaymentType.StripePaymentRequestButton) => "STRIPE_PAYMENT_REQUEST_BUTTON"
          case _ => "STRIPE"
        }
      case _: PayPalReferenceTransaction => "PAYPAL"
      case _: DirectDebitPaymentMethod | _: ClonedDirectDebitPaymentMethod => "GOCARDLESS"
    })

  case class AcquisitionTypeDetails(paymentProvider: Option[String], readerType: String, acquisitionType: String)
}
