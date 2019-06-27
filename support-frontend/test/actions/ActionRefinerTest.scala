package actions

import com.gu.identity.play.{AccessCredentials, AuthenticatedIdUser, IdMinimalUser}
import config.Configuration.IdentityUrl
import fixtures.TestCSRFComponents
import org.scalatest.mockito.MockitoSugar._
import org.scalatest.{MustMatchers, WordSpec}
import play.api.http.Status
import play.api.mvc.Results._
import play.api.test.FakeRequest
import play.api.test.Helpers._
import services.{AuthenticationService, TestUserService}

import scala.concurrent.ExecutionContext.Implicits.global

class ActionRefinerTest extends WordSpec with MustMatchers with TestCSRFComponents {

  val idApiUrl = "https://id-api-url.local"
  val supportUrl = "https://support-url.local"
  val path = "/test-path"
  val fakeRequest = FakeRequest("GET", path)

  "PrivateAction" should {

    "include Cache-control: no-cache, private" in {
      val actionRefiner =
        new CustomActionBuilders(mock[AuthenticationService], IdentityUrl(""), "", stubControllerComponents(), csrfAddToken, csrfCheck, csrfConfig)
      val result = actionRefiner.PrivateAction(Ok("")).apply(FakeRequest())
      header("Cache-Control", result) mustBe Some("no-cache, private")
    }

  }

  "AuthenticatedAction" should {

    "respond to request if provider authenticates user" in {
      val actionRefiner = new CustomActionBuilders(
        mock[AuthenticationService], IdentityUrl(""), "", stubControllerComponents(), csrfAddToken, csrfCheck, csrfConfig
      )
      val result = actionRefiner.authenticatedAction()(Ok("authentication-test")).apply(fakeRequest)
      status(result) mustEqual Status.OK
      contentAsString(result) mustEqual "authentication-test"
    }

    "redirect to identity if provider does not authenticate" in {
      val path = "/test-path"
      val actionRefiner = new CustomActionBuilders(
        authenticationService = mock[AuthenticationService],
        idWebAppUrl = IdentityUrl(idApiUrl),
        supportUrl = supportUrl,
        cc = stubControllerComponents(),
        addToken = csrfAddToken,
        checkToken = csrfCheck,
        csrfConfig = csrfConfig
      )
      val result = actionRefiner.authenticatedAction()(Ok("authentication-test")).apply(fakeRequest)

      status(result) mustEqual Status.SEE_OTHER
      redirectLocation(result) mustBe defined
      redirectLocation(result) foreach { location =>
        location must startWith(idApiUrl)
        location must include(s"returnUrl=$supportUrl$path")
        location must include("skipConfirmation=true")
        location must include("clientId=members")
      }
    }

    "return a private cache header if user is authenticated" in {
      val actionRefiner = new CustomActionBuilders(
        authenticationService = mock[AuthenticationService],
        idWebAppUrl = IdentityUrl(""),
        supportUrl = "",
        cc = stubControllerComponents(),
        addToken = csrfAddToken,
        checkToken = csrfCheck,
        csrfConfig = csrfConfig
      )
      val result = actionRefiner.authenticatedAction()(Ok("authentication-test")).apply(fakeRequest)
      header("Cache-Control", result) mustBe Some("no-cache, private")
    }

    "return a private cache header if user is not authenticated" in {
      val actionRefiner = new CustomActionBuilders(
        authenticationService = mock[AuthenticationService],
        idWebAppUrl = IdentityUrl(idApiUrl),
        supportUrl = supportUrl,
        cc = stubControllerComponents(),
        addToken = csrfAddToken,
        checkToken = csrfCheck,
        csrfConfig = csrfConfig
      )
      val result = actionRefiner.authenticatedAction()(Ok("authentication-test")).apply(fakeRequest)
      header("Cache-Control", result) mustBe Some("no-cache, private")
    }

  }

  "AuthenticatedTestUserAction" should {

    val testUsers = new TestUserService("test") {
      override def isTestUser(displayName: Option[String]): Boolean = displayName.exists(_.startsWith("test"))
    }

    val testUser = AuthenticatedIdUser(mock[AccessCredentials], IdMinimalUser("123", Some("test-user")))

    val normalUser = AuthenticatedIdUser(mock[AccessCredentials], IdMinimalUser("123", Some("normal-user")))

    "respond to request if provider authenticates user and they are a test user" in {
      val actionRefiner = new CustomActionBuilders(
        authenticationService = mock[AuthenticationService],
        idWebAppUrl = IdentityUrl(""),
        supportUrl = "",
        cc = stubControllerComponents(),
        addToken = csrfAddToken,
        checkToken = csrfCheck,
        csrfConfig = csrfConfig
      )
      val result = actionRefiner.authenticatedTestUserAction()(Ok("authentication-test")).apply(fakeRequest)
      status(result) mustEqual Status.OK
      contentAsString(result) mustEqual "authentication-test"
    }

    "redirect to identity if they are not a test user" in {
      val path = "/test-path"
      val actionRefiner = new CustomActionBuilders(
        authenticationService = mock[AuthenticationService],
        idWebAppUrl = IdentityUrl(idApiUrl),
        supportUrl = supportUrl,
        cc = stubControllerComponents(),
        addToken = csrfAddToken,
        checkToken = csrfCheck,
        csrfConfig = csrfConfig
      )
      val result = actionRefiner.authenticatedTestUserAction()(Ok("authentication-test")).apply(fakeRequest)

      status(result) mustEqual Status.SEE_OTHER
      redirectLocation(result) mustBe defined
      redirectLocation(result) foreach { location =>
        location must startWith(idApiUrl)
        location must include(s"returnUrl=$supportUrl$path")
        location must include("skipConfirmation=true")
        location must include("clientId=members")
      }
    }

    "return a private cache header if user is an authenticated test user" in {
      val actionRefiner =
          new CustomActionBuilders(mock[AuthenticationService], IdentityUrl(""), "", stubControllerComponents(), csrfAddToken, csrfCheck, csrfConfig)
      val result = actionRefiner.authenticatedTestUserAction()(Ok("authentication-test")).apply(fakeRequest)
      header("Cache-Control", result) mustBe Some("no-cache, private")
    }

  }
}
