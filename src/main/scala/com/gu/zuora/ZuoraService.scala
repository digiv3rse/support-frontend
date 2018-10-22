package com.gu.zuora

import cats.data.OptionT
import cats.implicits._
import com.gu.helpers.WebServiceHelper
import com.gu.okhttp.RequestRunners.FutureHttpClient
import com.gu.support.workers.lambdas.IdentityId
import com.gu.support.workers.model.AccessScope.SessionId
import com.gu.zuora.GetAccountForIdentity.{DomainAccount, ZuoraAccountNumber}
import com.gu.zuora.GetSubscription.DomainSubscription
import com.gu.zuora.model.response._
import com.gu.zuora.model.{QueryData, SubscribeRequest}
import io.circe
import io.circe.Decoder
import io.circe.parser.decode
import io.circe.syntax._

import scala.concurrent.{ExecutionContext, Future}

class ZuoraService(val config: ZuoraConfig, client: FutureHttpClient, baseUrl: Option[String] = None)(implicit ec: ExecutionContext)
    extends WebServiceHelper[ZuoraErrorResponse] {

  override val wsUrl: String = baseUrl.getOrElse(config.url)
  override val httpClient: FutureHttpClient = client
  val authHeaders = Map(
    "apiSecretAccessKey" -> config.password,
    "apiAccessKeyId" -> config.username
  )

  def getAccount(accountNumber: String): Future[GetAccountResponse] =
    get[GetAccountResponse](s"accounts/$accountNumber", authHeaders)

  def getAccountFields(identityId: IdentityId): Future[List[DomainAccount]] = {
    // WARNING constructing queries from strings is inherently dangerous.  Be very careful.
    val queryData = QueryData(s"select AccountNumber, CreatedSessionId__c from account where IdentityId__c = '${identityId.value}'")
    postJson[AccountQueryResponse](s"action/query", queryData.asJson, authHeaders).map(_.records.map(DomainAccount.fromWireAccount))
  }

  def getSubscriptions(accountNumber: ZuoraAccountNumber): Future[List[DomainSubscription]] =
    get[SubscriptionsResponse](s"subscriptions/accounts/${accountNumber.value}", authHeaders).map { subscriptionsResponse =>
      subscriptionsResponse.subscriptions.map(DomainSubscription.fromWireSubscription)
    }

  def subscribe(subscribeRequest: SubscribeRequest): Future[List[SubscribeResponseAccount]] =
    postJson[List[SubscribeResponseAccount]]("action/subscribe", subscribeRequest.asJson, authHeaders)

  def getDefaultPaymentMethodId(accountNumber: String): Future[Option[String]] = {
    // WARNING constructing queries from strings is inherently dangerous.  Be very careful.
    val queryData = QueryData(s"select defaultPaymentMethodId from Account where AccountNumber = '$accountNumber'")
    postJson[PaymentMethodQueryResponse](s"action/query", queryData.asJson, authHeaders)
      .map(r => Some(r.records.head.DefaultPaymentMethodId))
      .fallbackTo(Future.successful(None))
  }

  def getDirectDebitMandateId(paymentMethodId: String): Future[Option[String]] = {
    get[PaymentMethodDetailResponse](s"object/payment-method/$paymentMethodId", authHeaders)
      .map(p => Some(p.MandateID))
      .fallbackTo(Future.successful(None))
  }

  def getMandateIdFromAccountNumber(accountNumber: String): Future[Option[String]] = {
    (for {
      pmId <- OptionT(getDefaultPaymentMethodId(accountNumber))
      ddId <- OptionT(getDirectDebitMandateId(pmId))
    } yield ddId).value
  }

  override def decodeError(responseBody: String)(implicit errorDecoder: Decoder[ZuoraErrorResponse]): Either[circe.Error, ZuoraErrorResponse] =
    //The Zuora api docs say that the subscribe action returns
    //a ZuoraErrorResponse but actually it returns a list of those.
    decode[List[ZuoraErrorResponse]](responseBody).map(_.head)

}

object GetAccountForIdentity {

  case class ZuoraAccountNumber(value: String)

  case class DomainAccount(accountNumber: ZuoraAccountNumber, maybeCreatedSessionId: Option[SessionId])

  object DomainAccount {

    def fromWireAccount(accountRecord: AccountRecord): DomainAccount =
      DomainAccount(
        ZuoraAccountNumber(accountRecord.AccountNumber),
        accountRecord.CreatedSessionId__c.filter(_.length > 0).map(SessionId.apply)
      )

  }

}

object GetSubscription {

  case class ZuoraIsActive(value: Boolean) extends AnyVal

  case class DomainSubscription(accountNumber: ZuoraAccountNumber, isActive: ZuoraIsActive, ratePlans: List[RatePlan])
  object DomainSubscription {
    def fromWireSubscription(subscription: Subscription): DomainSubscription =
      DomainSubscription(
        ZuoraAccountNumber(subscription.accountNumber),
        ZuoraIsActive(subscription.status == "Active"),
        subscription.ratePlans //this can be changed to map to a DomainRatePlan if necessary
      )
  }
}
