package utils
import org.scalatest.{MustMatchers, WordSpec}


class QueryStringUtilsTest extends WordSpec with MustMatchers  {

  "addServerSideRenderingTestParameterQueryString" should {
    "add value of ssr parameter to query string" in {
      val queryString = Map.empty[String, Seq[String]]
      val result = utils.QueryStringUtils.addServerSideRenderingTestParameterQueryString(queryString)
      result.get("ssrTwo") === Some(List("on")) || result.get("ssrTwo") === Some(List("off")) mustBe true
    }
  }

  "addServerSideRenderingTestParameterQueryString" should {
    "overwrite value of ssr parameter if it already exists" in {
      val queryString = Map("ssrTwo" -> Seq("test"))
      val result = utils.QueryStringUtils.addServerSideRenderingTestParameterQueryString(queryString)
      result.get("ssrTwo") === Some(List("on")) || result.get("ssrTwo") === Some(List("off")) mustBe true
    }
  }
}
