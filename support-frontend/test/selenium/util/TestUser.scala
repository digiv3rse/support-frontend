package selenium.util

import java.time.Duration.ofDays

import com.gu.identity.testing.usernames.TestUsernames

class TestUser(driverConfig: DriverConfig) {

  private val testUsers = TestUsernames(
    com.gu.identity.testing.usernames.Encoder.withSecret(Config.testUsersSecret),
    recency = ofDays(2)
  )

  private def addTestUserCookies(testUsername: String) = {
    driverConfig.addCookie(name = "pre-signin-test-user", value = testUsername)
    driverConfig.addCookie(name = "_test_username", value = testUsername, domain = Some(Config.guardianDomain))
    driverConfig.addCookie(name = "_post_deploy_user", value = "true") // This enables the tests to use the mocked payment services
  }

  val username = testUsers.generate()
  addTestUserCookies(username)
}
