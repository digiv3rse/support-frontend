package com.gu.services

import com.gu.model.Stage.DEV
import com.gu.model.dynamo.SupporterRatePlanItem
import com.gu.test.tags.annotations.IntegrationTest
import org.scalatest.flatspec.AsyncFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDate

@IntegrationTest
class DynamoDBServiceSpec  extends AsyncFlatSpec with Matchers {

  DynamoDBService.getClass.getSimpleName should "be able to insert an item" in {
    val service = DynamoDBService(DEV)
    val item = SupporterRatePlanItem(
      identityId = "999999",
      gifteeIdentityId = None,
      subscriptionName = "test-sub-name",
      productRatePlanId = "2c92a0fb4edd70c8014edeaa4e972204",
      productRatePlanName = "Digital Pack Annual",
      termEndDate = LocalDate.parse("2021-03-20"),
      contractEffectiveDate = LocalDate.parse("2020-03-20")
    )
    service
      .writeItem(item)
      .map(_.sdkHttpResponse.statusCode shouldBe 200)
  }
}
