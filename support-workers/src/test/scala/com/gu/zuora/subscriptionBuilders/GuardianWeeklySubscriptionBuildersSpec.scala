package com.gu.zuora.subscriptionBuilders

import java.util.UUID

import com.gu.i18n.Country
import com.gu.i18n.Currency.GBP
import com.gu.support.catalog.Domestic
import com.gu.support.config.TouchPointEnvironments.SANDBOX
import com.gu.support.promotions.PromotionService
import com.gu.support.workers.{GuardianWeekly, Quarterly}
import com.gu.support.zuora.api.{Day, Month, ReaderType, SubscriptionData}
import com.gu.zuora.subscriptionBuilders.GuardianWeeklySubscriptionBuilder.initialTermInDays
import com.gu.zuora.subscriptionBuilders.ProductSubscriptionBuilders._
import org.joda.time.LocalDate
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar._

class GuardianWeeklySubscriptionBuildersSpec extends AnyFlatSpec with Matchers {

  "InitialTermLength" should "be correct" in {
    val termStart = new LocalDate(2019, 2, 3)
    val firstPaperDate = termStart.plusDays(3)
    val termLength = initialTermInDays(termStart, firstPaperDate, 3)
    termLength shouldBe 92
  }

  "SubscriptionData for a gift subscription" should "have autoRenew set to false" in (
    gift.subscription.autoRenew shouldBe false
  )

  it should "have the contractAcceptanceDate set to the first delivery date" in (
    gift.subscription.contractAcceptanceDate shouldBe firstDeliveryDate
  )

  it should "have the contractEffectiveDate and the termStartDate set to the date it was sold" in {
    gift.subscription.contractEffectiveDate shouldBe saleDate
    gift.subscription.termStartDate shouldBe saleDate
  }

  it should "have an initial term of 95 days" in {
    gift.subscription.initialTerm shouldBe 95
    gift.subscription.initialTermPeriodType shouldBe Day
  }

  it should "have the correct productRatePlanId" in (
    gift.ratePlanData.head.ratePlan.productRatePlanId shouldBe "2c92c0f96ded216a016df491134d4091"
  )

  "SubscriptionData for a non-gift subscription" should "have autoRenew set to true" in {
    nonGift.subscription.autoRenew shouldBe true
  }
  it should "have the contractAcceptanceDate set to the first delivery date" in {
    nonGift.subscription.contractAcceptanceDate shouldBe firstDeliveryDate
  }

  it should "have the contractEffectiveDate and the termStartDate set to the date it was sold" in {
    nonGift.subscription.contractEffectiveDate shouldBe saleDate
    nonGift.subscription.termStartDate shouldBe saleDate
  }

  it should "have an initial term of 12 months" in {
    nonGift.subscription.initialTerm shouldBe 12
    nonGift.subscription.initialTermPeriodType shouldBe Month
  }

  it should "have the correct productRatePlanId" in {
    nonGift.ratePlanData.head.ratePlan.productRatePlanId shouldBe "2c92c0f965dc30640165f150c0956859"
  }

  lazy val weekly = GuardianWeekly(GBP, Quarterly, Domestic)
  lazy val promotionService = mock[PromotionService]
  lazy val saleDate = new LocalDate(2019, 10, 24)
  lazy val firstDeliveryDate = saleDate.plusDays(3)

  lazy val gift: SubscriptionData =
    GuardianWeeklySubscriptionBuilder.build(
      weekly,
      UUID.randomUUID(),
      Country.UK, None,
      Some(firstDeliveryDate),
      promotionService,
      ReaderType.Gift,
      SANDBOX,
      contractEffectiveDate = saleDate).toOption.get

  lazy val nonGift = GuardianWeeklySubscriptionBuilder.build(
    weekly,
    UUID.randomUUID(),
    Country.UK, None,
    Some(firstDeliveryDate),
    promotionService,
    ReaderType.Direct,
    SANDBOX,
    contractEffectiveDate = saleDate).toOption.get

}
