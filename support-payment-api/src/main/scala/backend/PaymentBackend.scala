package backend

import cats.data.EitherT
import cats.implicits._
import com.gu.acquisition.typeclasses.AcquisitionSubmissionBuilder
import com.gu.support.acquisitions.{AcquisitionsStreamService, BigQueryService}
import com.gu.support.acquisitions.models.AcquisitionDataRow
import com.typesafe.scalalogging.StrictLogging
import model.DefaultThreadPool
import model.db.ContributionData
import services.{AnalyticsService, ContributionsStoreService}

import scala.concurrent.Future
import scala.util.control.NonFatal

trait PaymentBackend extends StrictLogging {
  val ophanService: AnalyticsService
  val bigQueryService: BigQueryService
  val acquisitionsStreamService: AcquisitionsStreamService
  val databaseService: ContributionsStoreService

  private def insertContributionDataIntoDatabase(contributionData: ContributionData)(implicit pool: DefaultThreadPool): EitherT[Future, BackendError, Unit] = {
    // log so that if something goes wrong we can reconstruct the missing data from the logs
    logger.info(s"about to insert contribution into database: $contributionData")
    databaseService.insertContributionData(contributionData)
      .leftMap(BackendError.fromDatabaseError)
  }

  def track[A : AcquisitionSubmissionBuilder](legacyAcquisition: A, acquisition: AcquisitionDataRow, contributionData: ContributionData)(implicit pool: DefaultThreadPool): Future[List[BackendError]] = {
    val ophanFuture = ophanService.submitAcquisition(legacyAcquisition)
      .bimap(BackendError.fromOphanError, _ => ())

    val bigQueryFuture = bigQueryService.tableInsertRowWithRetry(acquisition, maxRetries = 5).leftMap(BackendError.BigQueryError)
    val streamFuture = acquisitionsStreamService.putAcquisitionWithRetry(acquisition, maxRetries = 5).leftMap(BackendError.AcquisitionsStreamError)

    val dbFuture = insertContributionDataIntoDatabase(contributionData)

    Future.sequence(List(ophanFuture.value, bigQueryFuture.value, streamFuture.value, dbFuture.value))
      .map { results =>
        results.collect { case Left(err) => err }
      }
      .recover {
        case NonFatal(err) => List(BackendError.TrackingError(err))
      }
  }
}
