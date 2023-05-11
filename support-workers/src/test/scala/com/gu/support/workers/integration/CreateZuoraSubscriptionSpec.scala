package com.gu.support.workers.integration

import com.gu.config.Configuration
import com.gu.i18n.CountryGroup
import com.gu.i18n.Currency.{EUR, GBP}
import com.gu.okhttp.RequestRunners.configurableFutureRunner
import com.gu.support.acquisitions.{AbTest, AcquisitionData, OphanIds, ReferrerAcquisitionData}
import com.gu.support.catalog.{CatalogService, Everyday, S3CatalogProvider}
import com.gu.support.config.{Stages, TouchPointEnvironments}
import com.gu.support.promotions.{DefaultPromotions, PromotionService}
import com.gu.support.redemption.CodeAlreadyUsed
import com.gu.support.redemption.gifting.generator.GiftCodeGeneratorService
import com.gu.support.redemptions.RedemptionCode
import com.gu.support.workers._
import com.gu.support.workers.JsonFixtures._
import com.gu.support.workers.encoding.Conversions.FromOutputStream
import com.gu.support.workers.encoding.Encoding
import com.gu.support.workers.errors.MockServicesCreator
import com.gu.support.workers.lambdas.CreateZuoraSubscription
import com.gu.support.workers.states.{SendAcquisitionEventState, SendThankYouEmailState}
import com.gu.support.workers.states.SendThankYouEmailState._
import com.gu.support.zuora.api.{PreviewSubscribeRequest, SubscribeRequest}
import com.gu.support.zuora.api.response.ZuoraAccountNumber
import com.gu.test.tags.annotations.IntegrationTest
import com.gu.zuora.{ZuoraGiftService, ZuoraService}
import org.joda.time.DateTime
import org.mockito.ArgumentMatchers.any
import org.mockito.invocation.InvocationOnMock

import java.io.ByteArrayOutputStream
import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._

@IntegrationTest
class CreateZuoraSubscriptionSpec extends AsyncLambdaSpec with MockServicesCreator with MockContext {
  val createZuoraHelper = new CreateZuoraSubscriptionHelper()

  "CreateZuoraSubscription lambda" should "create a monthly contribution" in {
    createZuoraHelper
      .createSubscription(createContributionZuoraSubscriptionJson(amount = 20, billingPeriod = Monthly))
      .map(_ should matchPattern { case s: SendThankYouEmailContributionState =>
      })
  }

  it should "create an annual contribution" in {
    createZuoraHelper
      .createSubscription(createContributionZuoraSubscriptionJson(billingPeriod = Annual))
      .map(_ should matchPattern { case s: SendThankYouEmailContributionState =>
      })
  }

  it should "create a Supporter Plus subscription" in {
    createZuoraHelper
      .createSubscription(createSupporterPlusZuoraSubscriptionJson(20, GBP))
      .map(_ should matchPattern { case _: SendThankYouEmailSupporterPlusState =>
      })
  }

  it should "create a Supporter Plus V2 subscription" in {
    val acquisitionData = Some(
      AcquisitionData(
        OphanIds(None, None),
        ReferrerAcquisitionData(None, None, None, None, None, None, None, None, None, None, None, None, None),
        Set(AbTest("supporterPlusV2", "variant")),
      ),
    )
    createZuoraHelper
      .createSubscription(createSupporterPlusZuoraSubscriptionJson(20, GBP, acquisitionData = acquisitionData))
      .map(_ should matchPattern { case _: SendThankYouEmailSupporterPlusState =>
      })
  }

  it should "create a Supporter Plus subscription in a country where it is taxed" in {
    val austria = CountryGroup.Europe.countries.find(_.alpha2 == "AT").get // Fail here if we can't find it
    createZuoraHelper
      .createSubscription(createSupporterPlusZuoraSubscriptionJson(10, EUR, austria))
      .map(_ should matchPattern { case _: SendThankYouEmailSupporterPlusState =>
      })
  }

  it should "create a Digital Pack subscription" in {
    createZuoraHelper
      .createSubscription(createDigiPackZuoraSubscriptionJson)
      .map(_ should matchPattern { case s: SendThankYouEmailDigitalSubscriptionDirectPurchaseState =>
      })
  }

  it should "create a Digital Pack subscription with a discount" in {
    createZuoraHelper
      .createSubscription(createDigiPackSubscriptionWithPromoJson)
      .map(_ should matchPattern { case s: SendThankYouEmailDigitalSubscriptionDirectPurchaseState =>
      })
  }

  it should "create a Digital Pack subscription with a discount and free trial" in {
    createZuoraHelper
      .createSubscription(digipackSubscriptionWithDiscountAndFreeTrialJson)
      .map(_ should matchPattern { case s: SendThankYouEmailDigitalSubscriptionDirectPurchaseState =>
      })
  }

  it should "create an everyday paper subscription" in {
    createZuoraHelper
      .createSubscription(createEverydayPaperSubscriptionJson)
      .map(_ should matchPattern {
        case s: SendThankYouEmailPaperState if s.product.productOptions == Everyday =>
      })
  }

  it should "create an Annual Guardian Weekly subscription" in {
    createZuoraHelper
      .createSubscription(createGuardianWeeklySubscriptionJson(Annual))
      .map(_ should matchPattern {
        case s: SendThankYouEmailGuardianWeeklyState if s.product.billingPeriod == Annual =>
      })
  }

  it should "create an Quarterly Guardian Weekly subscription" in {
    createZuoraHelper
      .createSubscription(createGuardianWeeklySubscriptionJson(Quarterly))
      .map(_ should matchPattern {
        case s: SendThankYouEmailGuardianWeeklyState if s.product.billingPeriod == Quarterly =>
      })
  }

  it should "create a 6 for 6 Guardian Weekly subscription" in {
    createZuoraHelper
      .createSubscription(
        createGuardianWeeklySubscriptionJson(SixWeekly, Some(DefaultPromotions.GuardianWeekly.NonGift.sixForSix)),
      )
      .map(_ should matchPattern {
        case s: SendThankYouEmailGuardianWeeklyState
            if s.paymentSchedule.payments.headOption.map(_.amount).contains(6) =>
      })
  }

  it should "create an Guardian Weekly gift subscription" in {
    createZuoraHelper
      .createSubscription(guardianWeeklyGiftJson)
      .map(_ should matchPattern {
        case s: SendThankYouEmailGuardianWeeklyState if s.giftRecipient.isDefined =>
      })
  }

}

class CreateZuoraSubscriptionHelper(implicit executionContext: ExecutionContext)
    extends MockServicesCreator
    with MockContext {

  def createSubscription(
      json: String,
      giftCodeGenerator: GiftCodeGeneratorService = new GiftCodeGeneratorService,
  )(implicit executionContext: ExecutionContext): Future[SendThankYouEmailState] = {
    val createZuora = new CreateZuoraSubscription(mockServiceProvider(giftCodeGenerator))

    val outStream = new ByteArrayOutputStream()

    createZuora.handleRequestFuture(wrapFixture(json), outStream, context).map { _ =>
      Encoding.in[SendAcquisitionEventState](outStream.toInputStream).get._1.sendThankYouEmailState
    }
  }

  def createSubscriptionError(
      json: String,
      giftCodeGenerator: GiftCodeGeneratorService = new GiftCodeGeneratorService,
  )(implicit executionContext: ExecutionContext): Future[Option[ExecutionError]] = {
    val createZuora = new CreateZuoraSubscription(mockServiceProvider(giftCodeGenerator))

    val outStream = new ByteArrayOutputStream()

    createZuora.handleRequestFuture(wrapFixture(json), outStream, context).map { _ =>
      Encoding.in[SendAcquisitionEventState](outStream.toInputStream).get._2
    }
  }

  val realConfig = Configuration.load()

  val realZuoraService = new ZuoraService(realConfig.zuoraConfigProvider.get(), configurableFutureRunner(60.seconds))

  val realZuoraGiftService =
    new ZuoraGiftService(realConfig.zuoraConfigProvider.get(), Stages.DEV, configurableFutureRunner(60.seconds))

  val realPromotionService = new PromotionService(realConfig.promotionsConfigProvider.get())

  private val jsonProvider = new S3CatalogProvider(TouchPointEnvironments.CODE)
  lazy val realCatalogService = new CatalogService(TouchPointEnvironments.CODE, jsonProvider)

  lazy val mockZuoraService = {
    val mockZuora = mock[ZuoraService]
    // Need to return None from the Zuora service `getRecurringSubscription`
    // method or the subscribe step gets skipped
    // if these methods weren't coupled into one class then we could pass them separately and avoid reflection
    when(mockZuora.getAccountFields(any[IdentityId], any[DateTime]))
      .thenReturn(Future.successful(Nil))
    when(mockZuora.getSubscriptions(any[ZuoraAccountNumber]))
      .thenReturn(Future.successful(Nil))
    when(mockZuora.previewSubscribe(any[PreviewSubscribeRequest]))
      .thenAnswer((invocation: InvocationOnMock) =>
        realZuoraService.previewSubscribe(invocation.getArguments.head.asInstanceOf[PreviewSubscribeRequest]),
      )
    when(mockZuora.subscribe(any[SubscribeRequest]))
      .thenAnswer((invocation: InvocationOnMock) =>
        realZuoraService.subscribe(invocation.getArguments.head.asInstanceOf[SubscribeRequest]),
      )

    when(mockZuora.config).thenReturn(realZuoraService.config)
    mockZuora
  }

  def mockServiceProvider(giftCodeGenerator: GiftCodeGeneratorService) = mockServices[Any](
    (s => s.zuoraService, mockZuoraService),
    (s => s.zuoraGiftService, realZuoraGiftService),
    (s => s.promotionService, realPromotionService),
    (s => s.config, realConfig),
    (s => s.giftCodeGenerator, giftCodeGenerator),
    (s => s.catalogService, realCatalogService),
  )
}
