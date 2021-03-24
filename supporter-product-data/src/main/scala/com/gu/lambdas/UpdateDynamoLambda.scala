package com.gu.lambdas

import com.amazonaws.services.lambda.runtime.Context
import com.gu.lambdas.UpdateDynamoLambda.writeToDynamo
import com.gu.model.Stage
import com.gu.model.dynamo.SupporterRatePlanItem
import com.gu.model.states.UpdateDynamoState
import com.gu.services.{AlarmService, ConfigService, DynamoDBService, S3Service}
import com.typesafe.scalalogging.StrictLogging
import io.circe.syntax.EncoderOps
import kantan.csv._
import kantan.csv.ops._

import scala.collection.mutable.ListBuffer
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.DurationInt
import scala.concurrent.{Await, Future}

trait TimeOutCheck {
  def timeRemainingMillis: Int
}

class ContextTimeOutCheck(context: Context) extends TimeOutCheck {
  override def timeRemainingMillis = context.getRemainingTimeInMillis
}

class UpdateDynamoLambda extends Handler[UpdateDynamoState, UpdateDynamoState] {
  override protected def handlerFuture(input: UpdateDynamoState, context: Context) = {
    writeToDynamo(Stage.fromEnvironment, input, new ContextTimeOutCheck(context))
  }
}

object UpdateDynamoLambda extends StrictLogging {
  val maxBatchSize = 5
  val timeoutBufferInMillis = maxBatchSize * 5 * 1000

  def writeToDynamo(stage: Stage, state: UpdateDynamoState, timeOutCheck: TimeOutCheck): Future[UpdateDynamoState] = {
    logger.info(s"Starting write to dynamo task for ${state.recordCount} records from ${state.filename}")

    val csvStream = S3Service.streamFromS3(stage, state.filename)
    val csvReader = csvStream.asCsvReader[SupporterRatePlanItem](rfc.withHeader)
    val dynamoDBService = DynamoDBService(stage)
    val alarmService = AlarmService(stage)

    val unProcessed = getUnprocessedItems(csvReader, state.processedCount)

    val validUnprocessed = unProcessed.collect { case (Right(item), index) => (item, index) }
    val invalidUnprocessedIndexes = unProcessed.collect { case (Left(_), index) => index }

    if (invalidUnprocessedIndexes.nonEmpty && state.processedCount == 0) {
      logger.error(
        s"There were ${invalidUnprocessedIndexes.length} CSV read failures from file ${state.filename} with line numbers ${invalidUnprocessedIndexes.mkString(",")}"
      )
      alarmService.triggerCsvReadAlarm
    }

    val batches = batchItemsWhichCanUpdateConcurrently(validUnprocessed)

    val processedCount = writeBatchesUntilTimeout(
      state.processedCount,
      batches,
      timeOutCheck,
      dynamoDBService,
      alarmService
    )

    val maybeSaveSuccessTime = if (processedCount == state.recordCount)
      ConfigService(stage).putLastSuccessfulQueryTime(state.attemptedQueryTime)
    else Future.successful(())

    maybeSaveSuccessTime.map(_ => state.copy(processedCount = processedCount))
  }

  def getUnprocessedItems(csvReader: CsvReader[ReadResult[SupporterRatePlanItem]], processedCount: Int) =
    csvReader.zipWithIndex.drop(processedCount).toList

  def writeBatchesUntilTimeout(
    processedCount: Int,
    batches: List[List[(SupporterRatePlanItem, Int)]],
    timeOutCheck: TimeOutCheck,
    dynamoDBService: DynamoDBService,
    alarmService: AlarmService
  ): Int =
    batches.foldLeft(processedCount) {
      (processedCount, batch) =>
        if (timeOutCheck.timeRemainingMillis < timeoutBufferInMillis) {
          logger.info(
            s"Aborting processing - time remaining: ${timeOutCheck.timeRemainingMillis / 1000} seconds, buffer: ${timeoutBufferInMillis / 1000} seconds"
          )
          return processedCount
        }
        logger.info(
          s"Continuing processing with batch of ${batch.length} - time remaining: ${timeOutCheck.timeRemainingMillis / 1000} seconds, buffer: ${timeoutBufferInMillis / 1000} seconds"
        )

        Await.result(writeBatch(batch, dynamoDBService, alarmService), 120.seconds)

        val (_, highestProcessedIndex) = batch.last
        val newProcessedCount = highestProcessedIndex + 1
        logger.info(s"$newProcessedCount items processed")
        newProcessedCount
    }

  def writeBatch(list: List[(SupporterRatePlanItem, Int)], dynamoDBService: DynamoDBService, alarmService: AlarmService) = {
    val futures = list.map {
      case (supporterRatePlanItem, index) =>
        logger.info(
          s"Attempting to write item index $index - ${supporterRatePlanItem.productRatePlanName} to Dynamo - ${supporterRatePlanItem.asJson.noSpaces}")

        dynamoDBService
          .writeItem(supporterRatePlanItem)
      //          .recover {
      //            // let's alarm and keep going if one insert fails
      //            case error: Throwable =>
      //              logger.error(s"An error occurred trying to write item $supporterRatePlanItem, at index $index", error)
      //              alarmService.triggerDynamoWriteAlarm
      //          }

    }
    Future.sequence(futures)
  }

  def batchItemsWhichCanUpdateConcurrently(items: List[(SupporterRatePlanItem, Int)]): List[List[(SupporterRatePlanItem, Int)]] = {
    // 'Batch' supporterRatePlanItems up into groups which we can update in Dynamo concurrently.
    // For this to be safe we need to make sure that no group has more than one item for the same user in it because if it does
    // then order of execution is important and we can't guarantee this with parallel executions.
    // It actually would be ok to have multiple records for the same user as long as none of them were cancellations but this code
    // is complex enough without adding that logic in and we will still get most of the benefit

    def batchAlreadyHasAnItemForThisUser(batch: ListBuffer[(SupporterRatePlanItem, Int)], identityId: String) =
      batch.exists {
        case (item, _) => item.identityId == identityId
      }

    // Using mutable state for performance reasons, it is many times faster than the immutable version
    val result = ListBuffer(ListBuffer.empty[(SupporterRatePlanItem, Int)])

    for ((item, index) <- items) {
      val currentBatch = result.last
      if (batchAlreadyHasAnItemForThisUser(currentBatch, item.identityId) || currentBatch.length == maxBatchSize)
        result += ListBuffer((item, index))
      else
        currentBatch += ((item, index))
    }
    result.map(_.toList).toList
  }


}
