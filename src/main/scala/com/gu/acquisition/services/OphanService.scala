package com.gu.acquisition.services

import cats.data.EitherT
import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.Uri.Query
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.headers.{Cookie, HttpCookiePair}
import akka.stream.Materializer
import com.gu.acquisition.model.{AcquisitionSubmission, AcquisitionSubmissionBuilder}
import com.gu.acquisition.services.OphanServiceError.NetworkFailure

import scala.collection.immutable.Seq
import scala.concurrent.{ExecutionContext, Future}
import scala.reflect.ClassTag

sealed trait OphanServiceError extends Throwable

object OphanServiceError {

  case class SubmissionBuildError(message: String) extends OphanServiceError {
    override def getMessage: String = message
  }

  case class NetworkFailure(underlying: Throwable) extends OphanServiceError {
    override def getMessage: String = underlying.getMessage
  }

  case class ResponseUnsuccessful(failedResponse: HttpResponse) extends OphanServiceError {
    override def getMessage: String = s"Ophan HTTP request failed: ${failedResponse.status}"
  }

}


sealed trait ProcessError extends Exception

case class BuildError(message: String) extends ProcessError {
  override def getMessage: String = s"Acquisition submission build error: $message"
}

case class CustomError[E <: Exception : ClassTag](error: E) extends ProcessError {
  override def getMessage: String = s"Custom acquisition submission error: ${error.getMessage} ${classOf[error]}"
}

trait AcquisitionSubmissionProcessor {

  def process[A : AcquisitionSubmissionBuilder](a: A)
    (implicit ec: ExecutionContext): EitherT[Future, ProcessError, AcquisitionSubmission]
}

object OphanService {

  val prodEndpoint: Uri = "https://ophan.theguardian.com"

  def prod(implicit system: ActorSystem, materializer: Materializer): OphanService =
    new HttpOphanService(prodEndpoint)

  def apply(endpoint: Uri)(implicit system: ActorSystem, materializer: Materializer): OphanService =
    new HttpOphanService(endpoint)
}

class OphanSubmission extends AcquisitionSubmissionProcessor[OphanServiceError] {
  /**
    * Submit an acquisition to Ophan.
    *
    * If browserId or viewId are missing, then it is not guaranteed they will be available
    * for the respective acquisition in the data lake table: acquisitions.
    * This will make certain reporting and analysis harder.
    * If possible they should be included.
    */
  override def process[A: AcquisitionSubmissionBuilder](a: A)(implicit ec: ExecutionContext) = ???
}


private class HttpOphanService(val endpoint: Uri)(implicit system: ActorSystem, materializer: Materializer)
  extends OphanService {

  private val additionalEndpoint = endpoint.copy(path = Uri.Path("/a.gif"))

  private def buildRequest(submission: AcquisitionSubmission): HttpRequest = {
    import com.gu.acquisition.instances.acquisition._
    import io.circe.syntax._
    import submission._

    val params = Query("viewId" -> ophanIds.pageviewId, "acquisition" -> acquisition.asJson.noSpaces)

    val cookies = List(
      ophanIds.browserId.map(HttpCookiePair("bwid", _)),
      ophanIds.visitId.map(HttpCookiePair("vsid", _))
    ).flatten

    HttpRequest(
      uri = additionalEndpoint.withQuery(params),
      headers = Seq(Cookie(cookies))
    )
  }

  private def executeRequest(
      request: HttpRequest
  )(implicit ec: ExecutionContext): EitherT[Future, OphanServiceError, HttpResponse] = {
    import cats.instances.future._
    import cats.syntax.applicativeError._
    import cats.syntax.either._

    Http().singleRequest(request).attemptT
      .leftMap(OphanServiceError.NetworkFailure)
      .subflatMap { res =>
        if (res.status.isSuccess) Either.right(res)
        else Either.left(OphanServiceError.ResponseUnsuccessful(res))
      }
  }

  /**
    * Submit an acquisition to Ophan.
    *
    * If browserId or viewId are missing, then it is not guaranteed they will be available
    * for the respective acquisition in the data lake table: acquisitions.
    * This will make certain reporting and analysis harder.
    * If possible they should be included.
    */
  def submit[A : AcquisitionSubmissionBuilder](a: A)
    (implicit ec: ExecutionContext): EitherT[Future, OphanServiceError, AcquisitionSubmission] = {
    import cats.instances.future._
    import cats.syntax.either._
    import com.gu.acquisition.model.AcquisitionSubmissionBuilder.ops._

    a.asAcquisitionSubmission.toEitherT
      .map(buildRequest)
      .flatMap(executeRequest)
  }
}
