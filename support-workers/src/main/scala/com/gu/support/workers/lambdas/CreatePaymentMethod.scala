package com.gu.support.workers.lambdas

import com.amazonaws.services.lambda.runtime.Context
import com.gu.i18n.{CountryGroup, Currency}
import com.gu.monitoring.SafeLogger
import com.gu.paypal.PayPalService
import com.gu.services.{ServiceProvider, Services}
import com.gu.stripe.StripeService
import com.gu.support.encoding.CustomCodecs._
import com.gu.support.workers._
import com.gu.support.workers.lambdas.PaymentMethodExtensions.PaymentMethodExtension
import com.gu.support.workers.states.{CreatePaymentMethodState, CreateSalesforceContactState}
import io.circe.generic.auto._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class CreatePaymentMethod(servicesProvider: ServiceProvider = ServiceProvider)
    extends ServicesHandler[CreatePaymentMethodState, CreateSalesforceContactState](servicesProvider) {

  def this() = this(ServiceProvider)

  override protected def servicesHandler(state: CreatePaymentMethodState, requestInfo: RequestInfo, context: Context, services: Services) = {
    SafeLogger.debug(s"CreatePaymentMethod state: $state")
    createPaymentMethod(state, services)
      .map(paymentMethod =>
        HandlerResult(
          getCreateSalesforceContactState(state, paymentMethod),
          requestInfo.appendMessage(s"Payment method is ${paymentMethod.toFriendlyString}")
        ))
  }

  private def createPaymentMethod(
    state: CreatePaymentMethodState,
    services: Services
  ) =
    state.paymentFields match {
      case stripe: StripePaymentFields =>
        createStripePaymentMethod(stripe, state.product.currency, services.stripeService)
      case paypal: PayPalPaymentFields =>
        createPayPalPaymentMethod(paypal, services.payPalService)
      case dd: DirectDebitPaymentFields =>
        createDirectDebitPaymentMethod(dd, state.user)
    }

  private def getCreateSalesforceContactState(state: CreatePaymentMethodState, paymentMethod: PaymentMethod) =
    CreateSalesforceContactState(
      state.requestId,
      state.user,
      state.product,
      paymentMethod,
      state.promoCode,
      state.acquisitionData
    )

  def createStripePaymentMethod(stripe: StripePaymentFields, currency: Currency, stripeService: StripeService): Future[CreditCardReferenceTransaction] =
    stripeService
      .createCustomer(stripe.stripeToken, currency)
      .map { stripeCustomer =>
        val card = stripeCustomer.source
        CreditCardReferenceTransaction(card.id, stripeCustomer.id, card.last4,
          CountryGroup.countryByCode(card.country), card.exp_month, card.exp_year, card.zuoraCardType)
      }

  def createPayPalPaymentMethod(payPal: PayPalPaymentFields, payPalService: PayPalService): Future[PayPalReferenceTransaction] =
    payPalService
      .retrieveEmail(payPal.baid)
      .map(PayPalReferenceTransaction(payPal.baid, _))

  def createDirectDebitPaymentMethod(dd: DirectDebitPaymentFields, user: User): Future[DirectDebitPaymentMethod] =
    Future.successful(DirectDebitPaymentMethod(
      firstName = user.firstName,
      lastName = user.lastName,
      bankTransferAccountName = dd.accountHolderName,
      bankCode = dd.sortCode,
      bankTransferAccountNumber = dd.accountNumber,
      country = user.country,
      city = dd.city,
      postalCode = dd.postalCode,
      state = dd.state,
      streetName = dd.streetName,
      streetNumber = dd.streetNumber
    ))
}
