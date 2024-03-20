package com.gu.lambdas

import com.amazonaws.services.lambda.runtime.{Context, RequestStreamHandler}
import com.gu.monitoring.SafeLogging
import io.circe.parser.decode
import io.circe.syntax._
import io.circe.{Decoder, Encoder}

import java.io.{InputStream, OutputStream}
import scala.concurrent.duration._
import scala.concurrent.{Await, ExecutionContext, Future}
import scala.io.Source
import scala.util.Try

abstract class Handler[IN, OUT](implicit
    decoder: Decoder[IN],
    encoder: Encoder[OUT],
    ec: ExecutionContext,
) extends RequestStreamHandler
    with SafeLogging {

  override def handleRequest(is: InputStream, os: OutputStream, context: Context): Unit =
    Await.result(
      handleRequestFuture(is, os, context),
      Duration(context.getRemainingTimeInMillis.toLong, MILLISECONDS),
    )

  private def handleRequestFuture(is: InputStream, os: OutputStream, context: Context): Future[Unit] = {
    for {
      inputData <- Future.fromTry(StreamHandler.fromStream(is))
      result <- handlerFuture(inputData, context)
      _ <- Future.fromTry(StreamHandler.toStream(result, os))
    } yield ()
  }

  protected def handlerFuture(
      input: IN,
      context: Context,
  ): Future[OUT]

}

object StreamHandler extends SafeLogging {
  def fromStream[T](is: InputStream)(implicit decoder: Decoder[T]): Try[T] = {
    val triedT = Try {
      val body = Source.fromInputStream(is).mkString
      logger.info(s"Lambda input: $body")
      body
    }.flatMap(decode[T](_).toTry)
    is.close()
    triedT
  }

  def toStream[T](result: T, os: OutputStream)(implicit encoder: Encoder[T]): Try[Unit] = {
    val triedUnit = Try(os.write(result.asJson.noSpaces.getBytes()))
    os.close()
    triedUnit
  }

}
