package com.gu.support.workers.lambdas

import com.amazonaws.services.lambda.runtime.Context
import com.gu.config.Configuration.zuoraConfigProvider
import com.gu.monitoring.SafeLogger
import com.gu.services.{ServiceProvider, Services}
import com.gu.support.encoding.CustomCodecs._
import com.gu.support.promotions.PromotionService
import com.gu.support.workers._
import com.gu.support.workers.states.{CreateZuoraSubscriptionState, SendThankYouEmailState}
import com.gu.support.zuora.api._
import com.gu.support.zuora.api.response._
import com.gu.support.zuora.domain.DomainSubscription
import com.gu.zuora.ProductSubscriptionBuilders._
import io.circe.generic.auto._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class CreateZuoraSubscription(servicesProvider: ServiceProvider = ServiceProvider)
    extends ServicesHandler[CreateZuoraSubscriptionState, SendThankYouEmailState](servicesProvider) {

  def this() = this(ServiceProvider)

  override protected def servicesHandler(
    state: CreateZuoraSubscriptionState,
    requestInfo: RequestInfo,
    context: Context,
    services: Services
  ): FutureHandlerResult = {
    val subscribeItem = buildSubscribeItem(state, services.promotionService)
    for {
      identityId <- Future.fromTry(IdentityId(state.user.id))
      maybeDomainSubscription <- GetSubscriptionWithCurrentRequestId(services.zuoraService, state.requestId, identityId, state.product.billingPeriod)
      previewPaymentSchedule <- PreviewPaymentSchedule(subscribeItem, state.product.billingPeriod, services, checkSingleResponse)
      thankYouState <- maybeDomainSubscription match {
        case Some(domainSubscription) => skipSubscribe(state, requestInfo, previewPaymentSchedule, domainSubscription)
        case None => subscribe(state, subscribeItem, services).map(response => toHandlerResult(state, response, previewPaymentSchedule, requestInfo))
      }
    } yield thankYouState
  }

  def skipSubscribe(
    state: CreateZuoraSubscriptionState,
    requestInfo: RequestInfo,
    previewedPaymentSchedule: PaymentSchedule,
    subscription: DomainSubscription
  ): FutureHandlerResult = {
    val message = "Skipping subscribe for user because a subscription has already been created for this request"
    SafeLogger.info(message)
    FutureHandlerResult(
      getEmailState(state, subscription.accountNumber, subscription.subscriptionNumber, previewedPaymentSchedule),
      requestInfo.appendMessage(message)
    )
  }

  def singleSubscribe(
    multiSubscribe: SubscribeRequest => Future[List[SubscribeResponseAccount]]
  ): SubscribeItem => Future[SubscribeResponseAccount] = { subscribeItem =>
    checkSingleResponse(multiSubscribe(SubscribeRequest(List(subscribeItem))))
  }

  def checkSingleResponse[ResponseItem](response: Future[List[ResponseItem]]): Future[ResponseItem] = {
    response.flatMap {
      case result :: Nil => Future.successful(result)
      case results => Future.failed(new RuntimeException(s"didn't get a single response item, got: $results"))
    }
  }

  def subscribe(state: CreateZuoraSubscriptionState, subscribeItem: SubscribeItem, services: Services): Future[SubscribeResponseAccount] =
    singleSubscribe(services.zuoraService.subscribe)(subscribeItem)

  def toHandlerResult(
    state: CreateZuoraSubscriptionState,
    response: SubscribeResponseAccount,
    previewedPaymentSchedule: PaymentSchedule,
    requestInfo: RequestInfo
  ): HandlerResult = HandlerResult(getEmailState(state, response.domainAccountNumber, response.domainSubscriptionNumber, previewedPaymentSchedule), requestInfo)

  private def getEmailState(
    state: CreateZuoraSubscriptionState,
    accountNumber: ZuoraAccountNumber,
    subscriptionNumber: ZuoraSubscriptionNumber,
    paymentSchedule: PaymentSchedule
  ) =
    SendThankYouEmailState(
      state.requestId,
      state.user,
      state.giftRecipient,
      state.product,
      state.paymentMethod,
      state.firstDeliveryDate,
      state.salesforceContacts.buyer,
      accountNumber.value,
      subscriptionNumber.value,
      paymentSchedule,
      state.acquisitionData
    )

  private def buildSubscribeItem(state: CreateZuoraSubscriptionState, promotionService: PromotionService): SubscribeItem = {
    //Documentation for this request is here: https://www.zuora.com/developer/api-reference/#operation/Action_POSTsubscribe
    SubscribeItem(
      account = buildAccount(state),
      billToContact = buildContactDetails(state.user, state.user.billingAddress),
      soldToContact = state.user.deliveryAddress map (buildContactDetails(state.user, _)),
      paymentMethod = state.paymentMethod,
      subscriptionData = buildSubscriptionData(state, promotionService),
      subscribeOptions= SubscribeOptions()
    )
  }

  private def buildSubscriptionData(state: CreateZuoraSubscriptionState, promotionService: PromotionService) = {
    val isTestUser = state.user.isTestUser
    val config = zuoraConfigProvider.get(isTestUser)
    val readerType: ReaderType = state.giftRecipient match  {
      case _: Some[GiftRecipient] => ReaderType.Gift
      case _ => ReaderType.Direct
    }

    state.product match {
      case c: Contribution => c.build(state.requestId, config)
      case d: DigitalPack => d.build(state.requestId, config, state.user.billingAddress.country, state.promoCode, promotionService, isTestUser)
      case p: Paper => p.build(state.requestId, state.user.billingAddress.country, state.promoCode, state.firstDeliveryDate, promotionService, isTestUser)
      case w: GuardianWeekly => w.build(
        state.requestId,
        state.user.billingAddress.country,
        state.promoCode,
        state.firstDeliveryDate,
        promotionService,
        readerType,
        isTestUser
      )
    }
  }

  private def buildContactDetails(user: User, address: Address) = {
    ContactDetails(
      firstName = user.firstName,
      lastName = user.lastName,
      workEmail = user.primaryEmailAddress,
      address1 = address.lineOne,
      address2 = address.lineTwo,
      city = address.city,
      postalCode = address.postCode,
      country = address.country,
      state = address.state
    )
  }

  private def buildAccount(state: CreateZuoraSubscriptionState) = Account(
    name = state.salesforceContacts.recipient.AccountId, //We store the Salesforce Account id in the name field
    currency = state.product.currency,
    crmId = state.salesforceContacts.recipient.AccountId, //Somewhere else we store the Salesforce Account id
    sfContactId__c = state.salesforceContacts.buyer.Id,
    identityId__c = state.user.id,
    paymentGateway = PaymentGateway.forPaymentMethod(state.paymentMethod, state.product.currency),
    createdRequestId__c = state.requestId.toString
  )
}
