package com.gu.support.pricing

import com.gu.i18n.CountryGroup.UK
import com.gu.i18n.Currency.GBP
import com.gu.support.catalog._
import com.gu.support.encoding.CustomCodecs._
import com.gu.support.pricing.PriceSummaryService.getNumberOfDiscountedPeriods
import com.gu.support.promotions.{DiscountBenefit, PromotionServiceSpec}
import com.gu.support.workers.{Annual, BillingPeriod, Monthly, Quarterly}
import org.joda.time.Months
import org.scalatest.{FlatSpec, Matchers}

class PriceSummaryServiceSpec extends FlatSpec with Matchers {

  "PriceSummaryService" should "return prices" in {

    val service = new PriceSummaryService(PromotionServiceSpec.serviceWithFixtures, CatalogServiceSpec.serviceWithFixtures)

    val paper = service.getPrices(Paper, Some("DISCOUNT_CODE"))
    paper(UK)(HomeDelivery)(Sixday)(Monthly)(GBP).price shouldBe 54.12
    paper(UK)(HomeDelivery)(Sixday)(Monthly)(GBP).promotion.flatMap(_.discountedPrice) shouldBe Some(37.88)
    paper(UK)(Collection)(EverydayPlus)(Monthly)(GBP).price shouldBe 51.96
    paper(UK)(Collection)(EverydayPlus)(Monthly)(GBP).promotion.flatMap(_.discountedPrice) shouldBe Some(36.37)

    val guardianWeekly = service.getPrices(GuardianWeekly, Some("DISCOUNT_CODE"))
    guardianWeekly(UK)(Domestic)(NoProductOptions)(Quarterly)(GBP).price shouldBe 37.50
    guardianWeekly(UK)(Domestic)(NoProductOptions)(Quarterly)(GBP).promotion.flatMap(_.discountedPrice) shouldBe Some(26.25)
    guardianWeekly(UK)(Domestic)(NoProductOptions)(Annual)(GBP).price shouldBe 150
    guardianWeekly(UK)(Domestic)(NoProductOptions)(Annual)(GBP).promotion.flatMap(_.discountedPrice) shouldBe Some(138.75)

    val digitalPack = service.getPrices(DigitalPack, Some("DISCOUNT_CODE"))
    digitalPack(UK)(NoFulfilmentOptions)(NoProductOptions)(Monthly)(GBP).price shouldBe 11.99
    digitalPack(UK)(NoFulfilmentOptions)(NoProductOptions)(Monthly)(GBP).promotion.get.discountedPrice shouldBe Some(8.39)
    digitalPack(UK)(NoFulfilmentOptions)(NoProductOptions)(Annual)(GBP).price shouldBe 119.90
    digitalPack(UK)(NoFulfilmentOptions)(NoProductOptions)(Annual)(GBP).promotion.get.discountedPrice shouldBe Some(110.91)
  }

  it should "work out a discount correctly" in {
    val discountBenefit = DiscountBenefit(25, Some(Months.THREE))
    // TODO: It seems that Paper & Paper+ round discounts differently on the
    // current subscribe site. For instance Everyday and Sixday+ have the same
    // original price but different discounted values - £35.71 & £35.72.
    // We need to work out what they will actually get charged by Zuora

    checkPrice(discountBenefit, 47.62, 35.71, Monthly) //Everyday
    checkPrice(discountBenefit, 51.96, 38.97, Monthly) //Everyday+
    checkPrice(discountBenefit, 41.12, 30.84, Monthly) //Sixday
    //checkPrice(discountBenefit, 47.62, 35.72) //Sixday+
    checkPrice(discountBenefit, 20.76, 15.57, Monthly) //Weekend
    //checkPrice(discountBenefit, 29.42, 22.07) //Weekend+
    checkPrice(discountBenefit, 10.79, 8.09, Monthly) //Sunday
    //checkPrice(discountBenefit, 22.06, 16.55) //Sunday+
    checkPrice(discountBenefit, 10.79, 8.09, Monthly) //Sunday

    //Digital Pack
    checkPrice(discountBenefit, 11.99, 8.99, Monthly)
    checkPrice(discountBenefit, 119.90, 112.41, Annual)
    checkPrice(DiscountBenefit(25, Some(Months.FIVE)), 35.95, 28.46, Quarterly)

    //Guardian Weekly domestic
    checkPrice(DiscountBenefit(25, Some(Months.TWO)), 37.50, 31.25, Quarterly)


  }

  it should "work out the number of discounted billing periods correctly" in {
    getNumberOfDiscountedPeriods(Months.ONE, Monthly) shouldBe 1
    getNumberOfDiscountedPeriods(Months.ONE, Quarterly) shouldBe 1
    getNumberOfDiscountedPeriods(Months.ONE, Annual) shouldBe 1

    getNumberOfDiscountedPeriods(Months.THREE, Monthly) shouldBe 3
    getNumberOfDiscountedPeriods(Months.THREE, Quarterly) shouldBe 1
    getNumberOfDiscountedPeriods(Months.THREE, Annual) shouldBe 1

    getNumberOfDiscountedPeriods(Months.FOUR, Monthly) shouldBe 4
    getNumberOfDiscountedPeriods(Months.FOUR, Quarterly) shouldBe 2
    getNumberOfDiscountedPeriods(Months.FOUR, Annual) shouldBe 1

    getNumberOfDiscountedPeriods(Months.TWELVE, Monthly) shouldBe 12
    getNumberOfDiscountedPeriods(Months.TWELVE, Quarterly) shouldBe 4
    getNumberOfDiscountedPeriods(Months.TWELVE, Annual) shouldBe 1

    getNumberOfDiscountedPeriods(Months.months(13), Monthly) shouldBe 13
    getNumberOfDiscountedPeriods(Months.months(13), Quarterly) shouldBe 5
    getNumberOfDiscountedPeriods(Months.months(13), Annual) shouldBe 2
  }

  def checkPrice(discount: DiscountBenefit, original: BigDecimal, expected: BigDecimal, billingPeriod: BillingPeriod) =
    PriceSummaryService.getDiscountedPrice(Price(original, GBP), discount, billingPeriod).value shouldBe expected
}
