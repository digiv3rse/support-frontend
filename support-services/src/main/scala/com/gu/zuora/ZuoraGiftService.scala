package com.gu.zuora

import com.gu.okhttp.RequestRunners.FutureHttpClient
import com.gu.rest.WebServiceHelper
import com.gu.support.config.ZuoraConfig
import com.gu.support.redemptions.RedemptionCode
import com.gu.support.touchpoint.TouchpointService
import com.gu.support.zuora.api.{Day, QueryData, UpdateRedemptionDataRequest}
import com.gu.support.zuora.api.response.{Subscription, SubscriptionRedemptionQueryResponse, UpdateRedemptionDataResponse, ZuoraErrorResponse}
import io.circe.syntax.EncoderOps
import org.joda.time.LocalDate

import scala.concurrent.{ExecutionContext, Future}

trait ZuoraGiftLookupService extends TouchpointService {
  def getSubscriptionFromRedemptionCode(redemptionCode: RedemptionCode): Future[SubscriptionRedemptionQueryResponse]
}

class ZuoraGiftService(val config: ZuoraConfig, client: FutureHttpClient)(implicit ec: ExecutionContext)
  extends WebServiceHelper[ZuoraErrorResponse] with ZuoraGiftLookupService {

  override val wsUrl: String = config.url
  override val httpClient: FutureHttpClient = client
  val authHeaders = Map(
    "apiSecretAccessKey" -> config.password,
    "apiAccessKeyId" -> config.username
  )

  override def getSubscriptionFromRedemptionCode(redemptionCode: RedemptionCode): Future[SubscriptionRedemptionQueryResponse] = {
    val queryData = QueryData(
      s"""
        select id, contractEffectiveDate, CreatedRequestId__c, GifteeIdentityId__c
        from subscription
        where RedemptionCode__c = '${redemptionCode.value}' and status = 'Active'"""
    )
    postJson[SubscriptionRedemptionQueryResponse](s"action/query", queryData.asJson, authHeaders)
  }

  def getSubscriptionById(id: String): Future[Subscription] = get[Subscription](s"subscriptions/${id}", authHeaders)

  def updateSubscriptionRedemptionData(
    subscriptionId: String,
    requestId: String,
    gifteeIdentityId: String,
    giftRedemptionDate: LocalDate,
    newTermLength: Int
  ): Future[UpdateRedemptionDataResponse] = {
    val requestData = UpdateRedemptionDataRequest(requestId, gifteeIdentityId, giftRedemptionDate, newTermLength, Day)
    putJson[UpdateRedemptionDataResponse](s"subscriptions/${subscriptionId}", requestData.asJson, authHeaders)
  }
}
