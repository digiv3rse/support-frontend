package model.acquisition

import com.gu.acquisition.model.{GAData, OphanIds}
import com.gu.acquisition.typeclasses.AcquisitionSubmissionBuilder
import model.ClientBrowserInfo
import model.subscribewithgoogle.GoogleRecordPayment
import ophan.thrift.componentEvent.ComponentType.AcquisitionsHeader
import ophan.thrift.event.Platform.Amp
import ophan.thrift.event.{Acquisition, PaymentFrequency, Product}

case class SubscribeWithGoogleAcquisition(googleRecordPayment: GoogleRecordPayment,
                                          identityId: Option[Long],
                                          clientBrowserInfo: ClientBrowserInfo) {
}

object SubscribeWithGoogleAcquisition {
  implicit val submissionBuilder: AcquisitionSubmissionBuilder[SubscribeWithGoogleAcquisition] =
    new AcquisitionSubmissionBuilder[SubscribeWithGoogleAcquisition] {
      override def buildOphanIds(a: SubscribeWithGoogleAcquisition): Either[String, OphanIds] = Right(OphanIds(None, None, None))

      override def buildAcquisition(a: SubscribeWithGoogleAcquisition): Either[String, Acquisition] = Right(Acquisition(
        product = Product.Contribution,
        paymentFrequency = PaymentFrequency.OneOff,
        currency = a.googleRecordPayment.currency,
        amount = a.googleRecordPayment.amount.toDouble,
        identityId = a.identityId.map(_.toString()),
        paymentProvider = Some(ophan.thrift.event.PaymentProvider.SubscribeWithGoogle),
        // The following 3 fields are valid because SwG is currently only implemented on AMP pages.
        // These would need to become dynamic if we were to add SwG elsewhere. i.e. The Guardian Support page
        platform = Some(Amp),
        componentTypeV2 = Some(AcquisitionsHeader),
        componentId = Some("swg_amp_header")
      ))

      override def buildGAData(a: SubscribeWithGoogleAcquisition): Either[String, GAData] = Right(ClientBrowserInfo.toGAData(a.clientBrowserInfo))
    }
}
