package com.gu.lambdas

import com.gu.Fixtures
import com.gu.lambdas.UpdateDynamoLambda.maxBatchSize
import com.gu.model.Stage.PROD
import com.gu.model.dynamo.SupporterRatePlanItem
import com.gu.model.states.UpdateDynamoState
import kantan.csv.ops.toCsvInputOps
import kantan.csv.rfc
import org.joda.time.DateTime
import org.scalatest.flatspec.AsyncFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.ZonedDateTime
import scala.collection.mutable.ListBuffer

class UpdateDynamoSpec extends AsyncFlatSpec with Matchers {

  "getUnprocessedItems" should "return the correct items" in {
    val results = Fixtures.loadQueryResults

    val csvReader = results.asCsvReader[SupporterRatePlanItem](rfc.withHeader)

    UpdateDynamoLambda.getUnprocessedItems(csvReader, 2).length shouldBe 8
  }

  "batchItemsWhichCanUpdateConcurrently" should "return the correct items" in {
    val results = Fixtures.loadQueryResults
    val csvReader = results.asCsvReader[SupporterRatePlanItem](rfc.withHeader)
    val items = csvReader.zipWithIndex.toList.collect { case (Right(item), index) => (item, index) }

    val batchedItems = UpdateDynamoLambda.batchItemsWhichCanUpdateConcurrently(items)

    // The test rows should batch up into 3 separate lists - there are two rows which are not
    // suitable to run concurrently because they belong to the same user at index 6 & 7
    // so the pattern is
    // - items 0 - 4 can all run concurrently and so are allocated to the same batch (up to max batch size of 5)
    // - items 5 & 6 are unrelated and so go in a batch
    // - then we get to index 7 which cannot go into the same batch as 6 so a new batch is started with this and the final 2 items
    batchedItems.map(_.map(_._2)) shouldBe List(List(0,1,2,3,4), List(5,6), List(7,8,9))
  }


  //  "Run the job" should "work" in {
  //    UpdateDynamoLambda.writeToDynamo(
  //      PROD, UpdateDynamoState(
  //        "select-active-rate-plans-2021-03-22T17:29:31.039.csv",
  //        1285440,
  //        0,
  //        ZonedDateTime.parse("2021-03-22T10:29:31.039-07:00[America/Los_Angeles]")
  //      ), new TimeOutCheck {
  //        override def timeRemainingMillis = Int.MaxValue
  //      }).map( state =>
  //      succeed
  //    )
  //  }
}
