package selenium.contributions.pages

import org.openqa.selenium.WebDriver
import org.scalatestplus.selenium.Page
import selenium.util.{Browser, Config, TestUser}

case class ContributionsLanding(region: String, testUser: TestUser)(implicit val webDriver: WebDriver) extends Page with Browser {

  val url = s"${Config.supportFrontendUrl}/$region/contribute"

  private val contributeButton = cssSelector("#qa-contributions-landing-submit-contribution-button")

  private val contributePayPalButton = className("paypal-button")

  private val oneOffButton = cssSelector(".form__radio-group--contribution-type label[for='contributionType-ONE_OFF']")
  private val monthlyButton = cssSelector(".form__radio-group--contribution-type label[for='contributionType-MONTHLY']")
  private val annualButton = cssSelector(".form__radio-group--contribution-type label[for='contributionType-ANNUAL']")

  private val otherAmountButton = cssSelector(".form__radio-group--contribution-type label[for='contributionAmount-other']")

  private val otherAmount = id("contributionOther")

  private val stripeSelector = cssSelector(".form__radio-group-label[for='paymentMethodSelector-Stripe']")
  private val payPalSelector = cssSelector(".form__radio-group-label[for='paymentMethodSelector-PayPal']")
  private val stateSelector = id("contributionState")

  private val stripeOverlayIframe = cssSelector(".stripe_checkout_app")

  private object RegisterFields {
    private val firstName = id("contributionFirstName")
    private val lastName = id("contributionLastName")
    private val email = id("contributionEmail")

    def fillIn(hasNameFields: Boolean) {

      setValue(email, s"${testUser.username}@gu.com", clear = true)
      if (hasNameFields) {
        setValue(firstName, testUser.username, clear = true)
        setValue(lastName, testUser.username, clear = true)
      }
    }

    def clear(hasNameFields: Boolean): Unit = {
      clearValue(email)
      if (hasNameFields) {
        clearValue(firstName)
        clearValue(lastName)
      }
    }
  }

  private object CardDetailsFields {
    case class StripeCardField(containerId: String, inputName: String) {
      def iframeSelector: CssSelectorQuery = cssSelector(s"#$containerId iframe")
      def inputSelector: CssSelectorQuery = cssSelector(s"input[name='$inputName']")

      def set(value: String): Unit = {
        switchToParentFrame

        switchFrame(iframeSelector)
        setValueSlowly(inputSelector, value)

        switchToParentFrame
      }
    }

    val cardNumber = StripeCardField("stripeCardNumberElement", "cardnumber")
    val expiryDate = StripeCardField("stripeCardExpiryElement", "exp-date")
    val cvc = StripeCardField("stripeCardCVCElement", "cvc")

    def fillIn: Unit = {
      cardNumber.set("4242424242424242")
      expiryDate.set("0150")
      cvc.set("111")
    }
  }

  def fillInPersonalDetails(hasNameFields: Boolean) { RegisterFields.fillIn(hasNameFields) }

  def clearForm(hasNameFields: Boolean): Unit = RegisterFields.clear(hasNameFields)

  def selectState: Unit = setSingleSelectionValue(stateSelector, "NY")

  def selectStripePayment(): Unit = clickOn(stripeSelector)

  def fillInCardDetails(): Unit = CardDetailsFields.fillIn

  def selectPayPalPayment(): Unit = clickOn(payPalSelector)

  def pageHasLoaded: Boolean = {
    pageHasElement(contributeButton)
    elementIsClickable(contributeButton)
  }

  def clickContribute: Unit = clickOn(contributeButton)

  def clickOneOff: Unit = clickOn(oneOffButton)
  def clickMonthly: Unit = clickOn(monthlyButton)
  def clickAnnual: Unit = clickOn(annualButton)

  def clickOtherAmount: Unit = clickOn(otherAmountButton)

  def enterAmount(amount: Double): Unit = setValueSlowly(otherAmount, amount.toString)

  def hasStripeOverlay: Boolean = {
    Thread.sleep(500)
    pageHasAtLeastOneVisibleElement(stripeOverlayIframe)
  }

}
