package controllers

import com.typesafe.scalalogging.StrictLogging
import config.Identity
import controllers.AuthCodeFlow._
import play.api.mvc.Cookie.SameSite
import play.api.mvc._
import services.AsyncAuthenticationService

import java.net.URLEncoder
import java.nio.charset.StandardCharsets.UTF_8
import java.security.{MessageDigest, SecureRandom}
import java.util.Base64
import scala.concurrent.{ExecutionContext, Future}
import scala.util.Random

/*
 * Endpoints that implement the OAuth2 and OIDC authorisation code flow with PKCE.
 *
 * The flow has two main stages:
 * 1. Get an authorisation code.
 * 2. Redeem the authorisation code for ID and access tokens.
 *
 * See:
 * - https://developer.okta.com/docs/guides/implement-grant-type/authcode/main
 * - https://developer.okta.com/docs/reference/api/oidc
 * - https://auth0.com/docs/get-started/authentication-and-authorization-flow/call-your-api-using-the-authorization-code-flow-with-pkce
 * - https://datatracker.ietf.org/doc/html/rfc6749#section-4.1
 */
class AuthCodeFlowController(cc: ControllerComponents, authService: AsyncAuthenticationService, config: Identity)(
    implicit ec: ExecutionContext,
) extends AbstractController(cc)
    with StrictLogging {

  /*
   * Redirects the request to the 'authorize' endpoint on the auth server to try to get an authorisation code.
   * This is step (1) in the flow.
   * If the attempt is successful, the auth server will redirect back to this controller's 'callback' endpoint.
   * This implementation is a silent authorisation so if the user isn't signed in, the request
   * to the callback endpoint will contain an error rather than attempting to sign the user in.
   *
   * See https://developer.okta.com/docs/reference/api/oidc/#authorize
   */
  def authorize(): Action[AnyContent] = Action { implicit request =>
    val state = Random.alphanumeric.take(32).mkString
    val codeVerifier = Pkce.codeVerifier()
    val codeChallenge = Pkce.codeChallenge(codeVerifier)
    val queryParams = Map(
      "response_type" -> "code",
      "client_id" -> config.oauthClientId,
      "redirect_uri" -> config.oauthCallbackUrl,
      "scope" -> config.oauthScopes,
      "state" -> state,
      "code_challenge" -> codeChallenge,
      "code_challenge_method" -> "S256",

      /*
       * Tells auth server to do a 'silent' authorisation - this means if the user isn't signed in, the request
       * to the callback endpoint will contain an error rather than attempting to sign the user in.
       */
      "prompt" -> "none",
    )
    val authorizeUrl = s"${config.oauthAuthorizeUrl}?${toQuery(queryParams)}"
    Redirect(authorizeUrl).addingToSession(
      SessionKey.state -> state,
      SessionKey.codeVerifier -> codeVerifier,
    )
  }

  /*
   * Called by the auth server with the result of the attempt to get an authorisation token.
   * ie. the result of the call redirected from the 'authorize' endpoint of this controller.
   *
   * It will contain an authorisation code if successful, or an error and error description if not.
   */
  def callback(
      code: Option[String],
      state: String,
      error: Option[String],
      errorDescription: Option[String],
  ): Action[AnyContent] = Action.async { implicit request =>
    val originUrl = request.session.get(SessionKey.originUrl)
    val codeVerifier = request.session.get(SessionKey.codeVerifier)
    val sessionState = request.session.get(SessionKey.state)

    def cleansed(result: Result) =
      result.removingFromSession(SessionKey.originUrl, SessionKey.state, SessionKey.codeVerifier)

    lazy val redirect = cleansed(Redirect(originUrl.getOrElse("/"))).flashing(FlashKey.authTried -> "true")

    (code, codeVerifier, sessionState, error, errorDescription) match {

      case (Some(authorisationCode), Some(verifier), Some(stateInSession), None, None) if state == stateInSession =>
        /*
         * Successfully received an authorisation code - can now try to redeem it for ID and access tokens.
         * This is step (2) in the flow.
         * See https://developer.okta.com/docs/reference/api/oidc/#token
         */
        val requestBody = Map(
          "grant_type" -> "authorization_code",
          "client_id" -> config.oauthClientId,
          "code_verifier" -> verifier,
          "code" -> authorisationCode,
          "redirect_uri" -> config.oauthCallbackUrl,
        )
        authService
          .getTokens(toQuery(requestBody))
          .map { response =>
            if (response.status == 200) {
              val idToken = (response.json \ "id_token").as[String]
              val accessToken = (response.json \ "access_token").as[String]
              redirect.withCookies(
                secureCookie(config.idTokenCookieName, idToken),
                secureCookie(config.accessTokenCookieName, accessToken),
              )
            } else {
              logger.error(s"Failed to generate auth tokens: HTTP ${response.status}: ${response.body}")
              redirect
            }
          }

      case (None, _, _, Some(error), _) if error == "login_required" =>
        // Failed to generate auth tokens as user is signed out - this is expected.
        Future.successful(redirect)

      case (None, _, _, Some(error), Some(errorDescription)) =>
        logger.error(s"Failed to generate auth tokens: $error: $errorDescription")
        Future.successful(cleansed(BadRequest(s"$error: $errorDescription")))

      case _ =>
        // Should never get to this case
        logger.error(s"Failed to generate auth tokens for request: ${request.body}")
        Future.successful(cleansed(BadRequest))
    }
  }
}

object AuthCodeFlow {

  object SessionKey {
    // URL from which the auth flow was triggered, and where the flow should end up
    val originUrl = "oauth.originUrl"

    // To be compared with state param in callback request to avoid CSRF
    val state = "oauth.state"

    // Verifier for PKCE. Used to generate code challenge
    val codeVerifier = "oauth.codeVerifier"
  }

  object FlashKey {
    // Stops an infinite loop by telling authenticated actions that authentication has been tried
    val authTried = "oauth.authTried"
  }

  def toQuery(ss: Map[String, String]): String = {
    def urlEncode(s: String) = URLEncoder.encode(s, UTF_8.name())
    ss.map { case (k, v) => s"$k=${urlEncode(v)}" }.mkString("&")
  }

  def secureCookie(name: String, value: String): Cookie =
    Cookie(name, value, maxAge = Some(3600), secure = true, httpOnly = false, sameSite = Some(SameSite.Lax))

  /*
   * Methods to help with Proof Keys for Code Exchange (PKCE).
   * PKCE (RFC 7636) is an extension to the Authorization Code flow to prevent CSRF and authorization code injection attacks.
   * See https://datatracker.ietf.org/doc/html/rfc7636
   * and https://oauth.net/2/pkce
   */
  object Pkce {

    // See https://auth0.com/docs/get-started/authentication-and-authorization-flow/call-your-api-using-the-authorization-code-flow-with-pkce#create-code-verifier
    def codeVerifier(): String = {
      val rnd = new SecureRandom()
      val code = new Array[Byte](32)
      rnd.nextBytes(code)
      Base64.getUrlEncoder.withoutPadding.encodeToString(code)
    }

    // See https://auth0.com/docs/get-started/authentication-and-authorization-flow/call-your-api-using-the-authorization-code-flow-with-pkce#create-code-challenge
    def codeChallenge(verifier: String): String = {
      val bytes = verifier.getBytes("US-ASCII")
      val md = MessageDigest.getInstance("SHA-256")
      md.update(bytes, 0, bytes.length)
      val digest = md.digest()
      Base64.getUrlEncoder.withoutPadding.encodeToString(digest)
    }
  }
}
