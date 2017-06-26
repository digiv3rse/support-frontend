package com.gu.helpers

import com.gu.okhttp.RequestRunners.FutureHttpClient
import com.typesafe.scalalogging.LazyLogging
import io.circe
import io.circe.parser._
import io.circe.{Decoder, Json, Printer}
import okhttp3._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.reflect.{ClassTag, classTag}

case class WebServiceHelperError[T: ClassTag](responseCode: Int, responseBody: String) extends Throwable {
  override def getMessage: String = s"${classTag[T]} - $responseCode: $responseBody"
}

/**
 * A wrapper for a JSON web service. It automatically converts the response to a solid type, or
 * handles and logs the error.
 *
 * @tparam Error The type that will attempt to be extracted if extracting the expected object fails.
 *               This is useful when a web service has a standard error format
 */
trait WebServiceHelper[Error <: Throwable] extends LazyLogging {
  val wsUrl: String
  val httpClient: FutureHttpClient

  private def urlBuilder = HttpUrl.parse(wsUrl).newBuilder()

  /**
   * Manipulate the request before it is executed. Generally used to add any authentication settings
   * the web services requires (e.g. add an Authentication header)
   *
   * @param req The request
   * @return The modified request
   */
  def wsPreExecute(req: Request.Builder): Request.Builder = req

  /**
   * Send a request to the web service and attempt to convert the response to an A
   *
   * @param rb           The request to send
   * @param decoder      A Decoder to convert JSON to A
   * @param errorDecoder A Decoder to convert JSON to Error
   * @tparam A The type of the object that is expected to be returned from the request
   * @return
   */
  private def request[A](rb: Request.Builder)(implicit decoder: Decoder[A], errorDecoder: Decoder[Error], ctag: ClassTag[A]): Future[A] = {
    val req = wsPreExecute(rb).build()
    logger.debug(s"Issuing request ${req.method} ${req.url}")
    for {
      response <- httpClient(req)
    } yield {
      val responseBody = response.body.string()
      logger.debug(responseBody)
      decode[A](responseBody) match {
        case Left(err) => throw decodeError(responseBody).right.getOrElse(
          WebServiceHelperError[A](response.code(), responseBody)
        )
        case Right(value) => value
      }
    }
  }

  /**
   * Allow subclasses to customise the way errors are decoded
   * @param responseBody
   * @param errorDecoder
   * @return Either[circe.Error, Error]
   */
  def decodeError(responseBody: String)(implicit errorDecoder: Decoder[Error]): Either[circe.Error, Error] = decode[Error](responseBody)

  def get[A](endpoint: String, params: (String, String)*)(implicit decoder: Decoder[A], errorDecoder: Decoder[Error], ctag: ClassTag[A]): Future[A] =
    request[A](new Request.Builder().url(endpointUrl(endpoint, params)))

  def post[A](endpoint: String, data: Json, params: (String, String)*)(implicit reads: Decoder[A], error: Decoder[Error], ctag: ClassTag[A]): Future[A] = {
    val json = data.pretty(Printer.noSpaces.copy(dropNullKeys = true))
    val body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json)
    request[A](new Request.Builder().url(endpointUrl(endpoint, params)).post(body))
  }

  def post[A](endpoint: String, data: Map[String, Seq[String]])(implicit decoder: Decoder[A], errorDecoder: Decoder[Error], ctag: ClassTag[A]): Future[A] = {
    val postParams = data.foldLeft(new FormBody.Builder()) {
      case (params, (name, values)) =>
        val paramName = if (values.size > 1) s"$name[]" else name
        values.foldLeft(params) { case (ps, value) => ps.add(paramName, value) }
    }.build()

    request[A](new Request.Builder().url(endpointUrl(endpoint)).post(postParams))
  }

  def put[A](endpoint: String, params: (String, String)*)(implicit reads: Decoder[A], error: Decoder[Error], ctag: ClassTag[A]): Future[A] = {
    val body = RequestBody.create(null, new Array[Byte](0)) // scalastyle:ignore
    request[A](new Request.Builder().url(endpointUrl(endpoint, params)).put(body))
  }

  private def endpointUrl(endpoint: String, params: Seq[(String, String)] = Seq.empty): HttpUrl = {
    val withSegments = endpoint.split("/").foldLeft(urlBuilder) {
      case (url, segment) =>
        url.addEncodedPathSegment(segment)
    }
    params.foldLeft(withSegments) {
      case (url, (k, v)) =>
        url.addQueryParameter(k, v)
    }.build()
  }

}
