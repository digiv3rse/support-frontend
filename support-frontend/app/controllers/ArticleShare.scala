package controllers

import actions.CustomActionBuilders
import cats.implicits._

import scala.concurrent.duration._
import com.typesafe.scalalogging.StrictLogging
import controllers.ArticleShare.articleIds
import play.api.libs.json.Json
import play.api.mvc._
import services.CapiArticle._
import services.CapiService

import scala.concurrent.{ExecutionContext, Future}

object ArticleShare {
  val articleIds = List(
    "environment/2019/oct/16/today-we-pledge-to-give-the-climate-crisis-the-attention-it-demands",
    "environment/2019/oct/16/guardian-language-changes-climate-environment",
    "environment/2019/oct/17/guardian-editors-climate-emergency-pledge"
  )
}

class ArticleShare(
  actionRefiners: CustomActionBuilders,
  components: ControllerComponents,
  capiService: CapiService
)(implicit val ec: ExecutionContext) extends AbstractController(components) with StrictLogging {
  import actionRefiners._

  def getArticles: Action[AnyContent] = CachedAction(5.minutes).async {
    capiService.getArticles(articleIds).fold(
      error => {
        logger.error("Failed to retrieve article data", error)
        InternalServerError("Failed to retrieve article data")
      },
      success => Ok(Json.toJson(success))
    )
  }
}
