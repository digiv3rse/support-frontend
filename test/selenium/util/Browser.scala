package selenium.util

import org.openqa.selenium.WebDriver
import org.openqa.selenium.support.ui.ExpectedConditions.numberOfWindowsToBe
import org.openqa.selenium.support.ui.{ExpectedCondition, ExpectedConditions, WebDriverWait}
import org.scalatest.selenium.WebBrowser
import scala.collection.JavaConverters.asScalaSetConverter
import scala.util.Try

trait Browser extends WebBrowser {

  implicit val webDriver: WebDriver

  // Stores a handle to the first window opened by the driver.
  lazy val parentWindow = webDriver.getWindowHandle

  def elementHasText(q: Query, text: String): Boolean =
    waitUntil(ExpectedConditions.textToBePresentInElementLocated(q.by, text))

  def pageHasElement(q: Query): Boolean =
    waitUntil(ExpectedConditions.visibilityOfElementLocated(q.by))

  def elementIsClickable(q: Query): Boolean =
    waitUntil(ExpectedConditions.elementToBeClickable(q.by))

  def pageDoesNotHaveElement(q: Query): Boolean =
    waitUntil(ExpectedConditions.not(ExpectedConditions.presenceOfAllElementsLocatedBy(q.by)))

  def pageHasUrl(urlFraction: String): Boolean =
    waitUntil(ExpectedConditions.urlContains(urlFraction))

  def pageHasUrlOrElement(urlFraction: String, q: Query): Boolean =
    waitUntil(
      ExpectedConditions.or(
        ExpectedConditions.urlContains(urlFraction),
        ExpectedConditions.visibilityOfElementLocated(q.by)
      )
    )

  def clickOn(q: Query) {
    if (pageHasElement(q))
      click.on(q)
    else
      throw new MissingPageElementException(q)
  }

  def setValue(q: Query, value: String, clear: Boolean = false) {
    if (pageHasElement(q)) {

      if (clear) q.webElement.clear
      q.webElement.sendKeys(value)

    } else
      throw new MissingPageElementException(q)
  }

  def clearValue(q: Query) {
    if (pageHasElement(q)) {

      q.webElement.clear

    } else
      throw new MissingPageElementException(q)
  }

  // Unfortunately this seems to be required in order to complete 3rd party payment forms
  def setValueSlowly(q: Query, value: String): Unit = {
    for {
      c <- value
    } yield {
      setValue(q, c.toString)
      Thread.sleep(100)
    }
  }

  def setSingleSelectionValue(q: Query, value: String) {
    if (pageHasElement(q))
      singleSel(q).value = value
    else
      throw new MissingPageElementException(q)
  }

  // Switches to a new iframe specified by the Query, q.
  def switchFrame(q: Query) {
    if (pageHasElement(q))
      webDriver.switchTo().frame(q.webElement)
    else
      throw new MissingPageElementException(q)
  }

  // Switches to the first window in the list of windows that doesn't match the parent window.
  def switchWindow(): Unit = {
    waitUntil(numberOfWindowsToBe(2))
    for {
      winHandle <- webDriver.getWindowHandles.asScala
      if winHandle != parentWindow
    } webDriver.switchTo().window(winHandle)
  }

  def switchToParentWindow(): Unit = webDriver.switchTo().window(parentWindow)

  private def waitUntil[T](pred: ExpectedCondition[T]): Boolean =
    Try(new WebDriverWait(webDriver, Config.waitTimeout).until(pred)).isSuccess

  private case class MissingPageElementException(q: Query)
    extends Exception(s"Could not find WebElement with locator: ${q.queryString}")
}
