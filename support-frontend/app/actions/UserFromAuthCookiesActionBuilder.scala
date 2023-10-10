package actions

import actions.AsyncAuthenticatedBuilder.OptionalAuthRequest
import actions.UserFromAuthCookiesActionBuilder.UserClaims.toUser
import actions.UserFromAuthCookiesActionBuilder._
import com.gu.identity.auth._
import com.gu.identity.model.{PrivateFields, User}
import config.Identity
import controllers.AuthCodeFlow.FlashKey.authTried
import controllers.AuthCodeFlow.SessionKey.{originUrl, referringUrl}
import controllers.routes
import play.api.Logging
import play.api.http.HeaderNames.REFERER
import play.api.mvc.Results.Redirect
import play.api.mvc.Security.AuthenticatedRequest
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

/** Tries to authenticate the user from ID and access token cookies. Provides a [[User]] to the request if cookies are
  * present and authentication is possible.
  */
class UserFromAuthCookiesActionBuilder(
    override val parser: BodyParser[AnyContent],
    oktaAuthService: OktaAuthService[DefaultAccessClaims, UserClaims],
    config: Identity,
)(implicit val executionContext: ExecutionContext)
    extends ActionBuilder[OptionalAuthRequest, AnyContent]
    with Logging {

  override def invokeBlock[A](request: Request[A], block: OptionalAuthRequest[A] => Future[Result]): Future[Result] =
    processRequest(config, oktaAuthService)(request, block, _ => processRequestWithoutUser(config)(request, block))
}

/** Tries to authenticate the user from ID and access token cookies. If there are no cookies, queries the auth server to
  * try to generate them. Provides a [[User]] to the request if authentication is possible.
  */
class UserFromAuthCookiesOrAuthServerActionBuilder(
    override val parser: BodyParser[AnyContent],
    oktaAuthService: OktaAuthService[DefaultAccessClaims, UserClaims],
    config: Identity,
    isAuthServerUp: () => Future[Boolean],
)(implicit val executionContext: ExecutionContext)
    extends ActionBuilder[OptionalAuthRequest, AnyContent]
    with Logging {

  override def invokeBlock[A](request: Request[A], block: OptionalAuthRequest[A] => Future[Result]): Future[Result] = {
    processRequest(config, oktaAuthService)(
      request,
      block,
      failure => {
        logger.info(s"Request ${request.id} doesn't have valid token cookies: ${failure.message}")
        if (request.flash.get(authTried).isDefined) {
          // Already tried to authenticate this request so just pass it through without a user
          processRequestWithoutUser(config)(request, block)
        } else {
          // Haven't tried to authenticate this request yet so redirect to auth
          isAuthServerUp().flatMap {
            case true =>
              val session = {
                val withoutReferrer = request.session + (originUrl -> request.uri)
                request.headers
                  .get(REFERER)
                  .map(referrer => withoutReferrer + (referringUrl -> referrer))
                  .getOrElse(withoutReferrer)
              }
              Future.successful(Redirect(routes.AuthCodeFlowController.authorize()).withSession(session))
            case false =>
              // If auth server is down, just pass request through without a user
              logger.warn(s"Auth server is down, can't authenticate request ${request.id}")
              processRequestWithoutUser(config)(request, block)
          }
        }
      },
    )
  }
}

object UserFromAuthCookiesActionBuilder {

  def processRequest[A](config: Identity, oktaAuthService: OktaAuthService[DefaultAccessClaims, UserClaims])(
      request: Request[A],
      block: OptionalAuthRequest[A] => Future[Result],
      handleFailure: ValidationError => Future[Result],
  )(implicit ctx: ExecutionContext): Future[Result] = {
    def isCookiePresent(name: String) = request.cookies.get(name).isDefined
    val isSignedOut = isCookiePresent(config.signedOutCookieName)
    val isSignedIn = isCookiePresent(config.signedInCookieName)
    if (isSignedOut || !isSignedIn) {
      processRequestWithoutUser(config)(request, block)
    } else {
      val result = tryToProcessRequest(config, oktaAuthService)(request, block)
      result.left.map(handleFailure).merge
    }
  }

  /** Processes a request where the [[OptionalAuthRequest]] doesn't have a user. */
  def processRequestWithoutUser[A](
      config: Identity,
  )(request: Request[A], block: OptionalAuthRequest[A] => Future[Result])(implicit
      ctx: ExecutionContext,
  ): Future[Result] = {
    def toDiscardingCookie(cookieName: String) = DiscardingCookie(name = cookieName, secure = true)
    block(new AuthenticatedRequest(None, request)).map(result =>
      // Discard token cookies as we know they're invalid
      result.discardingCookies(
        toDiscardingCookie(config.idTokenCookieName),
        toDiscardingCookie(config.accessTokenCookieName),
      ),
    )
  }

  /** Tries to process a request with the given block. If the request doesn't have valid token cookies, returns a
    * [[ValidationError]].
    */
  private def tryToProcessRequest[A](
      config: Identity,
      oktaAuthService: OktaAuthService[DefaultAccessClaims, UserClaims],
  )(request: Request[A], block: OptionalAuthRequest[A] => Future[Result]): Either[ValidationError, Future[Result]] = {
    val accessScopes = config.oauthScopes.trim.split("\\s+").map(scope => ClientAccessScope(scope)).toList
    for {
      idTokenCookie <- request.cookies
        .get(config.idTokenCookieName)
        .toRight(GenericValidationError("No id token cookie"))
      accessTokenCookie <- request.cookies
        .get(config.accessTokenCookieName)
        .toRight(GenericValidationError("No access token cookie"))
      userClaims <- oktaAuthService.validateIdTokenLocally(IdToken(idTokenCookie.value), nonce = None)
      _ <- oktaAuthService.validateAccessTokenLocally(AccessToken(accessTokenCookie.value), accessScopes)
    } yield block(new AuthenticatedRequest(Some(toUser(userClaims)), request))
  }

  case class UserClaims(
      primaryEmailAddress: String,
      identityId: String,
      firstName: Option[String],
      lastName: Option[String],
  ) extends IdentityClaims

  object UserClaims {

    val parser: IdentityClaimsParser[UserClaims] = new IdentityClaimsParser[UserClaims] {

      // Not used
      override protected def fromDefaultAndRaw(
          defaultClaims: DefaultIdentityClaims,
          rawClaims: JsonString,
      ): Either[ValidationError, UserClaims] = throw new UnsupportedOperationException()

      override protected def fromDefaultAndUnparsed(
          defaultClaims: DefaultIdentityClaims,
          unparsedClaims: UnparsedClaims,
      ): Either[ValidationError, UserClaims] =
        Right(
          UserClaims(
            primaryEmailAddress = defaultClaims.primaryEmailAddress,
            identityId = defaultClaims.identityId,
            firstName = unparsedClaims.getOptional("first_name"),
            lastName = unparsedClaims.getOptional("last_name"),
          ),
        )
    }

    def toUser(claims: UserClaims): User = User(
      id = claims.identityId,
      primaryEmailAddress = claims.primaryEmailAddress,
      privateFields = PrivateFields(
        firstName = claims.firstName,
        secondName = claims.lastName,
      ),
    )
  }

  case class ClientAccessScope(name: String) extends AccessScope
}
