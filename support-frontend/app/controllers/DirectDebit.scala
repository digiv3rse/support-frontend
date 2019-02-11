package controllers

import actions.CustomActionBuilders
import io.circe.syntax._
import models.CheckBankAccountDetails
import play.api.libs.circe.Circe
import play.api.mvc._
import services.paypal.PayPalBillingDetails.codec
import services.{GoCardlessServiceProvider, TestUserService}

import scala.concurrent.ExecutionContext

class DirectDebit(
    actionBuilders: CustomActionBuilders,
    components: ControllerComponents,
    goCardlessServiceProvider: GoCardlessServiceProvider,
    testUsers: TestUserService
)(implicit val ec: ExecutionContext) extends AbstractController(components) with Circe {

  import actionBuilders._

  def checkAccount: Action[CheckBankAccountDetails] =
    maybeAuthenticatedAction().async(circe.json[CheckBankAccountDetails]) { implicit request =>
      {
        val goCardlessService = goCardlessServiceProvider.forUser(testUsers.isTestUser(request))
        goCardlessService.checkBankDetails(request.body).map { isAccountValid =>
          Ok(Map("accountValid" -> isAccountValid).asJson)
        }
      }
    }
}
