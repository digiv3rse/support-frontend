package controllers

import config.Identity
import controllers.AuthCodeFlow.{FlashKey, SessionKey}
import org.mockito.ArgumentMatchers.any
import org.mockito.Mockito.when
import org.scalatest.matchers.must.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.mockito.MockitoSugar.mock
import play.api.libs.json.Json
import play.api.libs.ws.WSResponse
import play.api.mvc.Cookie
import play.api.mvc.Cookie.SameSite.Lax
import play.api.test.FakeRequest
import play.api.test.Helpers._
import services.AsyncAuthenticationService

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class AuthCodeFlowControllerTest extends AnyWordSpec with Matchers {

  "authorize" should {
    "return redirect" in {
      val authService = mock[AsyncAuthenticationService]
      val config = mock[Identity]
      when(config.oauthClientId).thenReturn("clientId")
      when(config.oauthAuthorizeUrl).thenReturn("authServerUrl")
      when(config.oauthScopes).thenReturn("a b c")
      when(config.oauthCallbackUrl).thenReturn("redirectUrl")
      val controller = new AuthCodeFlowController(stubControllerComponents(), authService, config)
      val result = controller.authorize()(FakeRequest())
      status(result) mustEqual 303
      val locationHeader = headers(result).get("Location").get
      locationHeader must startWith("authServerUrl?")
      locationHeader must include("state=")
      locationHeader must include("scope=a+b+c")
      locationHeader must include("client_id=clientId")
      locationHeader must include("code_challenge=")
      locationHeader must include("code_challenge_method=S256")
      locationHeader must include("response_type=code")
      locationHeader must include("prompt=none")
      locationHeader must include("redirect_uri=redirectUrl")
    }
  }

  "callback" should {

    "return redirect with cookies when serverside token call succeeds" in {
      val response = mock[WSResponse]
      when(response.status).thenReturn(200)
      when(response.json).thenReturn(Json.obj("id_token" -> "idToken", "access_token" -> "accessToken"))
      val authService = mock[AsyncAuthenticationService]
      when(authService.getTokens(any)).thenReturn(Future.successful(response))
      val config = mock[Identity]
      when(config.oauthClientId).thenReturn("clientId")
      when(config.oauthCallbackUrl).thenReturn("redirectUrl")
      when(config.idTokenCookieName).thenReturn("id_token")
      when(config.accessTokenCookieName).thenReturn("access_token")
      val controller = new AuthCodeFlowController(stubControllerComponents(), authService, config)
      val request = FakeRequest().withSession(
        SessionKey.originUrl -> "origin",
        SessionKey.codeVerifier -> "verifier",
        SessionKey.state -> "state",
      )
      val result =
        controller.callback(code = Some("code"), state = "state", error = None, errorDescription = None)(request)
      status(result) mustEqual 303
      headers(result).get("Location") must contain("origin")
      cookies(result).get(config.idTokenCookieName) must contain(
        Cookie(
          name = "id_token",
          value = "idToken",
          maxAge = Some(3600),
          secure = true,
          sameSite = Some(Lax),
        ),
      )
      cookies(result).get(config.accessTokenCookieName) must contain(
        Cookie(
          name = "access_token",
          value = "accessToken",
          maxAge = Some(3600),
          secure = true,
          sameSite = Some(Lax),
        ),
      )
      session(result).get(SessionKey.originUrl) must be(None)
      session(result).get(SessionKey.codeVerifier) must be(None)
      session(result).get(SessionKey.state) must be(None)
      flash(result).get(FlashKey.authTried) must be(defined)
    }

    "return redirect without cookies when authorize call failed because user isn't signed in" in {
      val authService = mock[AsyncAuthenticationService]
      val config = mock[Identity]
      when(config.oauthCallbackUrl).thenReturn("redirectUrl")
      when(config.idTokenCookieName).thenReturn("id_token")
      when(config.accessTokenCookieName).thenReturn("access_token")
      val controller = new AuthCodeFlowController(stubControllerComponents(), authService, config)
      val request = FakeRequest().withSession(
        SessionKey.originUrl -> "origin",
        SessionKey.codeVerifier -> "verifier",
        SessionKey.state -> "state",
      )
      val result =
        controller.callback(
          code = None,
          state = "state",
          error = Some("login_required"),
          errorDescription = Some("error desc"),
        )(request)
      status(result) mustEqual 303
      headers(result).get("Location") must contain("origin")
      cookies(result).get(config.idTokenCookieName) must be(None)
      cookies(result).get(config.accessTokenCookieName) must be(None)
      session(result).get(SessionKey.originUrl) must be(None)
      session(result).get(SessionKey.codeVerifier) must be(None)
      session(result).get(SessionKey.state) must be(None)
      flash(result).get(FlashKey.authTried) must be(defined)
    }

    "return bad request when authorize call failed because state in request's param doesn't match state in its session" in {
      val authService = mock[AsyncAuthenticationService]
      val config = mock[Identity]
      when(config.oauthCallbackUrl).thenReturn("redirectUrl")
      when(config.idTokenCookieName).thenReturn("id_token")
      when(config.accessTokenCookieName).thenReturn("access_token")
      val controller = new AuthCodeFlowController(stubControllerComponents(), authService, config)
      val request = FakeRequest().withSession(
        SessionKey.originUrl -> "origin",
        SessionKey.codeVerifier -> "verifier",
        SessionKey.state -> "state1",
      )
      val result =
        controller.callback(
          code = Some("code"),
          state = "state2",
          error = None,
          errorDescription = None,
        )(request)
      status(result) mustEqual 400
      cookies(result).get(config.idTokenCookieName) must be(None)
      cookies(result).get(config.accessTokenCookieName) must be(None)
      session(result).get(SessionKey.originUrl) must be(None)
      session(result).get(SessionKey.codeVerifier) must be(None)
      session(result).get(SessionKey.state) must be(None)
      flash(result).get(FlashKey.authTried) must be(None)
    }

    "return bad request when authorize call failed unexpectedly" in {
      val authService = mock[AsyncAuthenticationService]
      val config = mock[Identity]
      when(config.oauthCallbackUrl).thenReturn("redirectUrl")
      when(config.idTokenCookieName).thenReturn("id_token")
      when(config.accessTokenCookieName).thenReturn("access_token")
      val controller = new AuthCodeFlowController(stubControllerComponents(), authService, config)
      val request = FakeRequest().withSession(
        SessionKey.originUrl -> "origin",
        SessionKey.codeVerifier -> "verifier",
        SessionKey.state -> "state",
      )
      val result =
        controller.callback(
          code = None,
          state = "state",
          error = Some("unexpected"),
          errorDescription = Some("error desc"),
        )(request)
      status(result) mustEqual 400
      cookies(result).get(config.idTokenCookieName) must be(None)
      cookies(result).get(config.accessTokenCookieName) must be(None)
      session(result).get(SessionKey.originUrl) must be(None)
      session(result).get(SessionKey.codeVerifier) must be(None)
      session(result).get(SessionKey.state) must be(None)
      flash(result).get(FlashKey.authTried) must be(None)
    }
  }
}
