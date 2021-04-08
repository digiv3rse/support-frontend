package com.gu.zuora.subscriptionBuilders

import java.util.UUID

import com.gu.i18n.Country
import com.gu.i18n.Currency.GBP
import com.gu.salesforce.Salesforce.SalesforceContactRecords
import com.gu.support.config.TouchPointEnvironments.SANDBOX
import com.gu.support.config.{ZuoraContributionConfig, ZuoraDigitalPackConfig}
import com.gu.support.promotions.{PromoError, PromotionService}
import com.gu.support.redemption.corporate.{CorporateCodeValidator, DynamoLookup}
import com.gu.support.redemption.gifting.GiftCodeValidator
import com.gu.support.redemption.gifting.generator.GiftCodeGeneratorService
import com.gu.support.redemption.{InvalidCode, InvalidReaderType}
import com.gu.support.redemptions.{RedemptionCode, RedemptionData}
import com.gu.support.workers.states.{AnalyticsInfo, CreateZuoraSubscriptionState}
import com.gu.support.workers.{Address, DigitalPack, GeneratedGiftCode, Monthly, PaymentProvider, Quarterly, RedemptionNoProvider, SalesforceContactRecord, User}
import com.gu.support.zuora.api.ReaderType.{Corporate, Gift}
import com.gu.support.zuora.api._
import org.joda.time.LocalDate
import org.scalatest.EitherValues._
import org.scalatest.flatspec.AsyncFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar._

import scala.concurrent.Future

//noinspection RedundantDefaultArgument
class DigitalSubscriptionBuilderSpec extends AsyncFlatSpec with Matchers {

  "SubscriptionData for a corporate subscription redemption" should "be correct" in
    corporate.map { subData =>
      subData shouldBe SubscriptionData(
        List(RatePlanData(RatePlan("2c92c0f971c65dfe0171c6c1f86e603c"), List(), List())),
        Subscription(
          contractAcceptanceDate = saleDate,
          contractEffectiveDate = saleDate,
          termStartDate = saleDate,
          createdRequestId = "f7651338-5d94-4f57-85fd-262030de9ad5",
          autoRenew = true,
          initialTermPeriodType = Month,
          initialTerm = 12,
          renewalTerm = 12,
          termType = "TERMED",
          readerType = ReaderType.Corporate,
          promoCode = None,
          redemptionCode = Some(testCode),
          corporateAccountId = Some("1")
        )
      )
    }

  "SubscriptionData for a monthly subscription" should "be correct" in {
    monthly shouldBe SubscriptionData(
      List(RatePlanData(RatePlan("2c92c0f84bbfec8b014bc655f4852d9d"), List(), List())),
      Subscription(
        contractAcceptanceDate = saleDate.plusDays(16),
        contractEffectiveDate = saleDate,
        termStartDate = saleDate,
        createdRequestId = "f7651338-5d94-4f57-85fd-262030de9ad5",
        autoRenew = true,
        initialTermPeriodType = Month,
        initialTerm = 12,
        renewalTerm = 12,
        termType = "TERMED",
        readerType = ReaderType.Direct,
        promoCode = None,
        redemptionCode = None,
        corporateAccountId = None
      )
    )
  }

  "SubscriptionData for a 3 monthly gift subscription purchase" should "be correct" in {
    threeMonthGiftPurchase.ratePlanData shouldBe List(RatePlanData(RatePlan("2c92c0f8778bf8f60177915b477714aa"), List(), List()))
      import threeMonthGiftPurchase.subscription._
      autoRenew shouldBe false
      contractAcceptanceDate shouldBe saleDate
      readerType shouldBe Gift
      redemptionCode.isDefined shouldBe true
      redemptionCode.get.substring(0, 4) shouldBe "gd03"
      initialTerm shouldBe GiftCodeValidator.expirationTimeInMonths + 1
      initialTermPeriodType shouldBe Month
      promoCode shouldBe None
      corporateAccountId shouldBe None
      giftNotificationEmailDate shouldBe Some(new LocalDate(2020, 12, 1))
    }

  "Attempting to build a subscribe request for a gift redemptions" should "return an error" in {
    threeMonthGiftRedemption.map(_ shouldBe BuildSubscribeRedemptionError(InvalidReaderType))
  }

  lazy val promotionService = mock[PromotionService]
  lazy val saleDate = new LocalDate(2020, 6, 5)
  lazy val giftCodeGeneratorService = new GiftCodeGeneratorService

  val testCode = "test-code-123"

  lazy val corporateRedemptionBuilder = new DigitalSubscriptionCorporateRedemptionBuilder(
    new CorporateCodeValidator({
      case `testCode` => Future.successful(Some(Map(
        "available" -> DynamoLookup.DynamoBoolean(true),
        "corporateId" -> DynamoLookup.DynamoString("1")
      )))
    }),
    () => saleDate
  )

  lazy val corporate =
    corporateRedemptionBuilder.build(
      RedemptionData(RedemptionCode(testCode).toOption.get),
      DigitalPack(GBP, null /* FIXME should be Option-al for a corp sub */ , Corporate), // scalastyle:ignore null
      UUID.fromString("f7651338-5d94-4f57-85fd-262030de9ad5"),
      SANDBOX
    ).value.map(_.toOption.get)

  lazy val subscriptionPurchaseBuilder = new DigitalSubscriptionPurchaseBuilder(
    ZuoraDigitalPackConfig(14, 2),
    promotionService,
    () => saleDate
  )

  lazy val monthly =
    subscriptionPurchaseBuilder.build(
      None,
      Country.UK,
      DigitalPack(GBP, Monthly),
      UUID.fromString("f7651338-5d94-4f57-85fd-262030de9ad5"),
      SANDBOX,
      None,
      None,
    ).toOption.get

  lazy val threeMonthGiftPurchase =
    subscriptionPurchaseBuilder.build(
      None, Country.UK,
      DigitalPack(GBP, Quarterly, Gift),
      UUID.fromString("f7651338-5d94-4f57-85fd-262030de9ad5"),
      SANDBOX,
      Some(GeneratedGiftCode("gd03-23456789").get),// code for Quarterly ie Gift3Month
      Some(new LocalDate(2020, 12, 1)),
    ).toOption.get

  lazy val threeMonthGiftRedemption: Future[Throwable] =
    new SubscriptionDataBuilder(
      subscriptionPurchaseBuilder,
      corporateRedemptionBuilder,
      promotionService,
      _ => ZuoraContributionConfig("", ""),
      SANDBOX,
    ).build(
      CreateZuoraSubscriptionState(
        UUID.fromString("f7651338-5d94-4f57-85fd-262030de9ad5"),
        User("", "", None, "", "", Address(None, None, None, None, None, Country.Australia)), //user
        None,
        DigitalPack(GBP, Quarterly, Gift),
        AnalyticsInfo(isGiftPurchase = false, RedemptionNoProvider),
        Right(RedemptionData(RedemptionCode(testCode).toOption.get)),
        None,
        None,
        SalesforceContactRecords(SalesforceContactRecord("", ""), None),
        None
      ),
      None
    ).value.map(_.left.toOption.get)

}
