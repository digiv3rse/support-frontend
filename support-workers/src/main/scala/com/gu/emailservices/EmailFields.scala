package com.gu.emailservices

import com.gu.i18n.Currency
import com.gu.salesforce.Salesforce.SfContactId
import com.gu.support.promotions.Promotion
import com.gu.support.workers.{BillingPeriod, User}
import io.circe.{Encoder, JsonObject, Printer}
import io.circe.generic.semiauto._
import io.circe.syntax._
import org.joda.time.{DateTime, DateTimeZone, LocalDate, LocalTime}
import com.gu.support.encoding.CustomCodecs._
import org.joda.time.format.ISODateTimeFormat

case class EmailPayloadContactAttributes(SubscriberAttributes: Map[String, String])
case class EmailPayloadTo(Address: String, ContactAttributes: EmailPayloadContactAttributes)
case class EmailPayload(
  To: EmailPayloadTo,
  DataExtensionName: String,
  SfContactId: Option[String], // TODO delete this and make IdentityId non Option
  IdentityUserId: Option[String],
  ScheduledTime: Option[DateTime], // None means immediate
  UserAttributes: Option[JsonObject],
)

object EmailPayload {
  import com.gu.support.encoding.CustomCodecs.ISODate.encodeDateTime

  implicit val e1: Encoder[EmailPayload] = deriveEncoder
  implicit val e2: Encoder[EmailPayloadTo] = deriveEncoder
  implicit val e3: Encoder[EmailPayloadContactAttributes] = deriveEncoder
}

case class IdentityUserId(id: String)

case class EmailFields(
  fields: List[(String, String)],
  userId: Either[SfContactId, IdentityUserId],
  email: String,
  dataExtensionName: String,
  deliveryDate: Option[LocalDate] = None,
  userAttributes: Option[JsonObject] = None,
) {

  def payload: String =
    EmailPayload(
      To = EmailPayloadTo(
        Address = email,
        ContactAttributes = EmailPayloadContactAttributes(SubscriberAttributes = fields.toMap)
      ),
      DataExtensionName = dataExtensionName,
      SfContactId = userId.left.toOption.map(_.id),
      IdentityUserId = userId.right.toOption.map(_.id),
      deliveryDate.map(_.toDateTime(new LocalTime(8, 0), DateTimeZone.UTC)),
      userAttributes
    ).asJson.printWith(Printer.spaces2.copy(dropNullValues = true))

}
