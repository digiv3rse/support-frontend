package com.gu.emailservices

import com.gu.i18n.Currency
import com.gu.support.workers.model._
import org.joda.time.DateTime
import com.gu.salesforce.Salesforce.SfContactId

case class ContributionEmailFields(
    email: String,
    created: DateTime,
    amount: BigDecimal,
    currency: Currency,
    edition: String,
    name: String,
    billingPeriod: BillingPeriod,
    sfContactId: SfContactId,
    paymentMethod: PaymentMethod,
    directDebitMandateId: Option[String] = None
) extends EmailFields {

  val paymentFields = paymentMethod match {
    case dd: DirectDebitPaymentMethod => List(
      "account name" -> dd.bankTransferAccountName,
      "account number" -> mask(dd.bankTransferAccountNumber),
      "sort code" -> hyphenate(dd.bankCode),
      "Mandate ID" -> directDebitMandateId.getOrElse(""),
      "first payment date" -> formatDate(created.plusDays(10)),
      "payment method" -> "Direct Debit"
    )
    case _: PayPalReferenceTransaction => List("payment method" -> "paypal")
    case _: CreditCardReferenceTransaction => List("payment method" -> "card")
  }

  override val fields = List(
    "EmailAddress" -> email,
    "created" -> created.toString,
    "amount" -> amount.toString,
    "currency" -> currency.glyph,
    "edition" -> edition,
    "name" -> name,
    "product" -> s"${billingPeriod.toString.toLowerCase}-contribution"
  ) ++ paymentFields

  override def payload: String = super.payload(email, "regular-contribution-thank-you")

  override def userId: Either[SfContactId, IdentityUserId] = Left(sfContactId)
}
