package com.gu.support.workers.lambdas

import com.amazonaws.services.lambda.runtime.Context
import com.gu.gocardless.GoCardlessWorkersService
import com.gu.i18n.{Country, CountryGroup}
import com.gu.services.{ServiceProvider, Services}
import com.gu.support.workers._
import com.gu.support.workers.lambdas.PaymentMethodExtensions.PaymentMethodExtension
import com.gu.support.workers.states.CreateZuoraSubscriptionState.CreateZuoraSubscriptionContributionState
import com.gu.support.workers.states.{CreateZuoraSubscriptionWrapperState, PreparePaymentMethodForReuseState}
import com.gu.support.zuora.api.PaymentGateway
import com.gu.support.zuora.api.response.{GetPaymentMethodCardReferenceResponse, GetPaymentMethodDirectDebitResponse, GetPaymentMethodResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}

class PreparePaymentMethodForReuse(servicesProvider: ServiceProvider = ServiceProvider)
    extends ServicesHandler[PreparePaymentMethodForReuseState, CreateZuoraSubscriptionWrapperState](servicesProvider) {

  def this() = this(ServiceProvider)

  override protected def servicesHandler(state: PreparePaymentMethodForReuseState, requestInfo: RequestInfo, context: Context, services: Services) = {

    import com.gu.WithLoggingSugar._

    val zuoraService = services.zuoraService
    val accountId = state.paymentFields.billingAccountId
    for {
      account <- zuoraService.getObjectAccount(accountId).withEventualLogging(s"getObjectAccount($accountId)")
      accountIdentityId <- getOrFailWithMessage(account.IdentityId__c, s"Zuora account $accountId has no identityId")
      _ <- ifFalseReturnError(accountIdentityId == state.user.id, s"Zuora account $accountId identity id: $accountIdentityId does not match ${state.user.id}")
      paymentId <- getOrFailWithMessage(account.DefaultPaymentMethodId, s"Zuora account $accountId has no default payment method")
      getPaymentMethodResponse <- zuoraService.getPaymentMethod(paymentId).withEventualLogging(s"getPaymentMethod($paymentId)")
      _ <- ifFalseReturnError(getPaymentMethodResponse.paymentMethodStatus == "Active", s"Zuora account $accountId has a non active default payment method")
      sfContactId <- getOrFailWithMessage(account.sfContactId__c, s"Zuora account $accountId has no sfContact")
      crmId <- getOrFailWithMessage(account.CrmId, s"Zuora account $accountId has not CrmId")
      paymentMethod <- toPaymentMethod(getPaymentMethodResponse, services.goCardlessService, account.PaymentGateway)
      sfContact = SalesforceContactRecord(sfContactId, crmId)
      contribution <- Future.fromTry(state.product match {
        case c: Contribution => Success(c)
        case _ => Failure(new RuntimeException("not yet supported reuse payment method for other than contributions"))
      })
    } yield HandlerResult(
      CreateZuoraSubscriptionWrapperState(
        CreateZuoraSubscriptionContributionState(
          product = contribution,
          paymentMethod = paymentMethod,
          salesForceContact = sfContact,
        ),
        state.requestId,
        state.user,
        contribution,
        state.analyticsInfo,
        None,
        None,
        acquisitionData = state.acquisitionData
      ),
      requestInfo
        .appendMessage(s"Payment method is ${paymentMethod.toFriendlyString}")
        .appendMessage(s"Product is ${state.product.describe}")
    )
  }

  def toPaymentMethod(
    getPaymentMethodResponse: GetPaymentMethodResponse,
    goCardlessService: GoCardlessWorkersService,
    paymentGateway: PaymentGateway
  ): Future[PaymentMethod] = getPaymentMethodResponse match {

    case cardResponse: GetPaymentMethodCardReferenceResponse =>
      val maybeCountry: Option[Country] = cardResponse.creditCardCountry.flatMap(CountryGroup.byOptimisticCountryNameOrCode)
      Future.successful(
        CreditCardReferenceTransaction(
          tokenId = cardResponse.tokenId,
          secondTokenId = cardResponse.secondTokenId,
          creditCardNumber = cardResponse.creditCardMaskNumber,
          creditCardCountry = maybeCountry,
          creditCardExpirationMonth = cardResponse.creditCardExpirationMonth,
          creditCardExpirationYear = cardResponse.creditCardExpirationYear,
          creditCardType = cardResponse.creditCardType,
          paymentGateway = paymentGateway,
          stripePaymentType = None
        )
      )
    case directDebitResponse: GetPaymentMethodDirectDebitResponse =>
      cloneMandate(directDebitResponse, goCardlessService)
    case other =>
      errorResponse(s"unsupported payment method: '$other'")

  }

  def cloneMandate(
    existingDirectDebit: GetPaymentMethodDirectDebitResponse,
    goCardlessService: GoCardlessWorkersService
  ) : Future[ClonedDirectDebitPaymentMethod] = for {
    customerBankAccountId <- goCardlessService.getCustomerAccountIdFromMandateId(existingDirectDebit.tokenId)
    clonedMandateRefs <- goCardlessService.createNewMandateOnExistingCustomerAccount(customerBankAccountId)
  } yield ClonedDirectDebitPaymentMethod(
    tokenId = clonedMandateRefs.mandateId, // yes Zuora put the mandateId into tokenId
    mandateId = clonedMandateRefs.reference, // and yes Zuora like to use the 'reference' in the 'mandateId' field, sigh
    firstName = existingDirectDebit.firstName,
    lastName = existingDirectDebit.lastName,
    bankTransferAccountName = existingDirectDebit.bankTransferAccountName,
    bankTransferAccountNumber = existingDirectDebit.bankTransferAccountNumberMask,
    bankCode = existingDirectDebit.bankCode
  )

  def errorResponse(msg:String): Future[Nothing] = Future.failed(new Exception(msg))

  def ifFalseReturnError(condition: Boolean, falseResponse:String): Future[Unit] = if(condition) Future.successful(()) else errorResponse(falseResponse)

  def getOrFailWithMessage[T](option:Option[T], message: String): Future[T] = option match {
    case None => errorResponse(message)
    case Some(value) => Future.successful(value)
  }

}
