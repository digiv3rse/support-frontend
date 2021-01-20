package com.gu.services

import com.gu.conf.ZuoraQuerierConfig
import com.gu.model.zuora.request.{BatchQueryRequest, ExportZoqlQueries, ZoqlExportQuery}
import com.gu.model.zuora.response.{BatchQueryErrorResponse, BatchQueryResponse}
import com.gu.okhttp.RequestRunners.FutureHttpClient
import com.gu.rest.WebServiceHelper
import io.circe.syntax.EncoderOps

import java.time.{LocalDate, ZoneId}
import scala.concurrent.{ExecutionContext, Future}

class ZuoraQuerierService(val config: ZuoraQuerierConfig, client: FutureHttpClient)(implicit ec: ExecutionContext)
  extends WebServiceHelper[BatchQueryErrorResponse] {

  override val wsUrl = config.url
  override val httpClient: FutureHttpClient = client
  val authHeaders = Map(
    "apiSecretAccessKey" -> config.password,
    "apiAccessKeyId" -> config.username
  )

  def postQuery(date: LocalDate): Future[BatchQueryResponse] = {
    val query = BatchQueryRequest(
      "SupporterProductData",
      List(
        ZoqlExportQuery("New Subscriptions",
          ExportZoqlQueries.selectActiveRatePlans(date)
        )
      )
    )
    postJson[BatchQueryResponse](s"batch-query/", query.asJson, authHeaders)
  }
}
