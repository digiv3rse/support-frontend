package services

import cats.implicits._
import com.gu.identity.auth.UserCredentials
import com.gu.identity.model.User
import com.gu.identity.play.IdentityPlayAuthService
import config.Identity
import org.http4s.Uri
import play.api.mvc.{Cookie, RequestHeader}

import scala.concurrent.{ExecutionContext, Future}

// The following classes were previously defined in identity-play-auth,
// but have been removed as part of the changes to that library:
// authenticating users via a call to identity API; removing periphery functionality.
// They have been redefined here to reduce diff across PRs,
// but these classes could get refactored / simplified / removed in subsequent PRs.
sealed trait AccessCredentials
object AccessCredentials {
  case class Cookies(scGuU: String, guU: Option[String] = None) extends AccessCredentials {
    val cookies: Seq[Cookie] = Seq(
      Cookie(name = "SC_GU_U", scGuU)
    ) ++ guU.map(c => Cookie(name = "GU_U", c))
  }
  case class Token(tokenText: String) extends AccessCredentials
}
case class IdMinimalUser(id: String, displayName: Option[String])
case class AuthenticatedIdUser(credentials: AccessCredentials, user: IdMinimalUser)

// TODO: consider porting this to identity-play-auth.
class AsyncAuthenticationService(
    identityPlayAuthService: IdentityPlayAuthService,
    testUserService: TestUserService
)(implicit ec: ExecutionContext) {

  import AsyncAuthenticationService._

  def authenticateUser(requestHeader: RequestHeader): Future[AuthenticatedIdUser] =
    identityPlayAuthService.getUserFromRequest(requestHeader)
      .map { case (credentials, user) => buildAuthenticatedUser(credentials, user) }
      .unsafeToFuture()

  def tryAuthenticateUser(requestHeader: RequestHeader): Future[Option[AuthenticatedIdUser]] =
    authenticateUser(requestHeader)
      .map(user => Option(user))
      .handleError(_ => None) // TODO: log error?

  def authenticateTestUser(requestHeader: RequestHeader): Future[AuthenticatedIdUser] =
    authenticateUser(requestHeader).ensure(new RuntimeException("user not a test user")) { user =>
       testUserService.isTestUser(user.user.displayName)
    }
}

object AsyncAuthenticationService {

  def apply(config: Identity, testUserService: TestUserService)(implicit ec: ExecutionContext): AsyncAuthenticationService = {
    val apiUrl = Uri.unsafeFromString(config.apiUrl)
    val identityPlayAuthService = IdentityPlayAuthService.unsafeInit(apiUrl, config.apiClientToken)
    new AsyncAuthenticationService(identityPlayAuthService, testUserService)
  }

  def buildAuthenticatedUser(credentials: UserCredentials, user: User): AuthenticatedIdUser = {
    val accessCredentials = credentials match {
      case UserCredentials.SCGUUCookie(value) => AccessCredentials.Cookies(scGuU = value)
      case UserCredentials.CryptoAccessToken(value) => AccessCredentials.Token(tokenText = value)
    }
    AuthenticatedIdUser(accessCredentials, IdMinimalUser(user.id, user.publicFields.displayName))
  }
}
