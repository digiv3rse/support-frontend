package actions

import cats.data.EitherT
import services.AsyncAuthenticationService.logUserAuthenticationError
import play.api.mvc.Security.AuthenticatedRequest
import play.api.mvc._
import cats.implicits._

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

// scalastyle:off
// This is based on AuthenticatedBuilder in https://github.com/playframework/playframework/blob/1ca9d0af237ac45a011671b2e036d726cd05e4e7/core/play/src/main/scala/play/api/mvc/Security.scala
// The main difference is that this action builder enables authenticating a user asynchronously.
// i.e. RequestHeader => Future[Option[U]] instead of RequestHeader => Option[U]
// In the context of Guardian applications, asynchronous authentication equals making a call to identity API,
// to authenticate the user data.
// TODO: considering porting this to identity-play-auth.
// scalastyle:on
class AsyncAuthenticatedBuilder[U](
    userinfo: RequestHeader => Future[U],
    defaultParser: BodyParser[AnyContent],
    onUnauthorized: RequestHeader => Result
)(implicit val executionContext: ExecutionContext)
  extends ActionBuilder[({ type R[A] = AuthenticatedRequest[A, U] })#R, AnyContent] { // scalastyle:ignore

  lazy val parser = defaultParser

  def invokeBlock[A](request: Request[A], block: AuthenticatedRequest[A, U] => Future[Result]): Future[Result] =
    authenticate(request, block)

  /**
    * Authenticate the given block.
    */
  def authenticate[A](request: Request[A], block: AuthenticatedRequest[A, U] => Future[Result]): Future[Result] = {
    val result = for {
      user <- EitherT(userinfo(request).transform {
        case Success(result) => Success(Right(result))
        case Failure(err) =>
          logUserAuthenticationError(err)
          Success(Left(onUnauthorized(request)))
      })
      chainedBlockResult <- EitherT.right[Result](block(new AuthenticatedRequest(user, request)))
    } yield chainedBlockResult
    result.merge
  }
}
