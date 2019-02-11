package com.gu.support.zuora.api.response

import com.gu.support.encoding.Codec
import io.circe.parser._
import io.circe.syntax._
import com.gu.support.encoding.Codec._
import com.gu.support.encoding.CustomCodecs.{decodeLocalTime, encodeLocalTime}
import com.gu.support.encoding.ErrorJson
import com.gu.support.workers.exceptions.{RetryException, RetryNone, RetryUnlimited}
import org.joda.time.LocalDate

sealed trait ZuoraResponse {
  def success: Boolean
}

object ZuoraError {
  implicit val codec: Codec[ZuoraError] = deriveCodec
}

case class ZuoraError(Code: String, Message: String)

object ZuoraErrorResponse {
  implicit val codec: Codec[ZuoraErrorResponse] = capitalizingCodec

  def fromErrorJson(error: ErrorJson): Option[ZuoraErrorResponse] = {
    if (error.errorType ==  ZuoraErrorResponse.getClass.getCanonicalName) {
      decode[List[ZuoraError]](error.errorMessage).map { errors =>
        ZuoraErrorResponse(success = false, errors)
      }.toOption
    } else {
      None
    }
  }
}

case class ZuoraErrorResponse(success: Boolean, errors: List[ZuoraError])
    extends Throwable(errors.asJson.spaces2) with ZuoraResponse {

  override def toString: String = this.errors.toString

  def toRetryNone: RetryNone = new RetryNone(message = this.asJson.noSpaces, cause = this)

  def toRetryUnlimited: RetryUnlimited = new RetryUnlimited(this.asJson.noSpaces, cause = this)

  // Based on https://knowledgecenter.zuora.com/DC_Developers/G_SOAP_API/L_Error_Handling/Errors#ErrorCode_Object
  def asRetryException: RetryException = errors match {
    case List(ZuoraError("API_DISABLED", _)) => toRetryUnlimited
    case List(ZuoraError("LOCK_COMPETITION", _)) => toRetryUnlimited
    case List(ZuoraError("REQUEST_EXCEEDED_LIMIT", _)) => toRetryUnlimited
    case List(ZuoraError("REQUEST_EXCEEDED_RATE", _)) => toRetryUnlimited
    case List(ZuoraError("SERVER_UNAVAILABLE", _)) => toRetryUnlimited
    case List(ZuoraError("UNKNOWN_ERROR", _)) => toRetryUnlimited
    case _ => toRetryNone
  }
}

object BasicInfo {
  implicit val codec: Codec[BasicInfo] = deriveCodec
}

case class BasicInfo(
  id: String,
  name: String,
  accountNumber: String,
  notes: Option[String],
  status: String,
  crmId: String,
  batch: String,
  invoiceTemplateId: String,
  communicationProfileId: Option[String]
)

object GetAccountResponse {
  implicit val codec: Codec[GetAccountResponse] = deriveCodec
}

case class GetAccountResponse(success: Boolean, basicInfo: BasicInfo) extends ZuoraResponse

object SubscribeResponseAccount {
  implicit val codec: Codec[SubscribeResponseAccount] = capitalizingCodec
}

case class ZuoraAccountNumber(value: String)
case class ZuoraSubscriptionNumber(value: String)

case class SubscribeResponseAccount(
    accountNumber: String,
    subscriptionNumber: String,
    totalTcv: Float,
    subscriptionId: String,
    totalMrr: Float,
    accountId: String,
    success: Boolean
) extends ZuoraResponse {
  def domainAccountNumber: ZuoraAccountNumber = ZuoraAccountNumber(accountNumber)
  def domainSubscriptionNumber: ZuoraSubscriptionNumber = ZuoraSubscriptionNumber(subscriptionNumber)
}

object InvoiceResult {
  implicit val codec: Codec[InvoiceResult] = capitalizingCodec
}

case class InvoiceResult(invoice: List[Invoice])

object Invoice {
  implicit val codec: Codec[Invoice] = capitalizingCodec
}

case class Invoice(invoiceNumber: String, id: String)

object InvoiceDataItem {
  implicit val codec: Codec[InvoiceDataItem] = capitalizingCodec
}

case class InvoiceDataItem(invoiceItem: List[Charge])

object Charge {
  implicit val codec: Codec[Charge] = capitalizingCodec
}

case class Charge(serviceStartDate: LocalDate, serviceEndDate: LocalDate, taxAmount: Double, chargeAmount: Double)

object PreviewSubscribeResponse {
  implicit val codec: Codec[PreviewSubscribeResponse] = capitalizingCodec
}

case class PreviewSubscribeResponse(invoiceData: List[InvoiceDataItem], success: Boolean) extends ZuoraResponse
