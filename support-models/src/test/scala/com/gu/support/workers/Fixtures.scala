package com.gu.support.workers

import com.gu.i18n.Currency
import com.gu.i18n.Currency.GBP

//noinspection TypeAnnotation
object Fixtures {
  val idId = "12345"
  val email = "test@gu.com"
  val userJson =
    s"""
      "user":{
          "id": "$idId",
          "primaryEmailAddress": "$email",
          "firstName": "test",
          "lastName": "user",
          "country": "GB",
          "billingAddress": {
            "country": "GB"
          },
          "allowMembershipMail": false,
          "allowThirdPartyMail": false,
          "allowGURelatedMail": false,
          "isTestUser": false
        }
    """
  val requestIdJson = "\"requestId\": \"e18f6418-45f2-11e7-8bfa-8faac2182601\""
  val validBaid = "B-23637766K5365543J"
  val payPalEmail = "test@paypal.com"
  val payPalPaymentMethod =
    s"""
        {
              "PaypalBaid": "$validBaid",
              "PaypalEmail": "$payPalEmail",
              "PaypalType": "ExpressCheckout",
              "Type": "PayPal",
              "paymentGateway": "PayPal Express"
         }
       """

  val stripePaymentMethod = // test env card and cus token, not prod ones
    s"""
        {
           "TokenId": "card_E0zitFfsO2wTEn",
           "SecondTokenId": "cus_E0zic0cedDT5MZ",
           "CreditCardNumber": "4242",
           "CreditCardCountry": "US",
           "CreditCardExpirationMonth": 2,
           "CreditCardExpirationYear": 2022,
           "CreditCardType": "Visa",
           "Type": "CreditCardReferenceTransaction",
           "paymentGateway": "Stripe Gateway 1"
         }
       """

  def contribution(amount: BigDecimal = 5, currency: Currency = GBP, billingPeriod: BillingPeriod = Monthly): String =
    s"""
      {
        "amount": $amount,
        "currency": "$currency",
        "billingPeriod": "$billingPeriod"
      }
    """

  val digitalPackJson =
    """
      {
        "currency": "GBP",
        "billingPeriod" : "Annual"
      }
    """

  val digitalPackProductJson =
    s"""
      "product": $digitalPackJson
    """

  val guardianWeeklyJson =
    s"""
       "product": {
        "currency": "GBP",
        "billingPeriod" : "Annual",
        "fulfilmentOptions": "RestOfWorld"
      }
     """
  val payPalJson =
    s"""
      {
        "baid": "$validBaid"
      }
    """

  val acquisitionData =
    s"""
      {
        "ophanIds":{
          "pageviewId":"jkcg440imu1c0m8pxpxe",
          "visitId":null,
          "browserId":null
        },
        "referrerAcquisitionData":{
          "campaignCode":null,
          "referrerPageviewId":null,
          "referrerUrl":null,
          "componentId":null,
          "componentType":null,
          "source":null,
          "abTests":[{
            "name":"fakeTest",
            "variant":"fakeVariant"
          }],
          "queryParameters":null,
          "hostname":"support.thegulocal.com"
        },
        "supportAbTests":[{
          "name":"fakeSupportTest",
          "variant":"fakeVariant"
        }]
      }
    """

  val mickeyMouse = "Mickey Mouse"
  val directDebitJson =
    s"""
      {
        "accountHolderName": "$mickeyMouse",
        "sortCode": "111111",
        "accountNumber": "99999999"
      }
    """

  val stripeToken = "tok_AXY4M16p60c2sg"
  val stripeJson =
    s"""
      {
        "userId": "12345",
        "stripeToken": "$stripeToken"
      }
    """

  def createPayPalPaymentMethodContributionJson(currency: Currency = GBP): String =
    s"""{
          $requestIdJson,
          $userJson,
          "product": ${contribution(currency = currency)},
          "paymentProvider": "PayPal",
          "paymentFields": $payPalJson,
          "acquisitionData": $acquisitionData
        }"""

  def createStripePaymentMethodContributionJson(billingPeriod: BillingPeriod = Monthly, amount: BigDecimal = 5): String =
    s"""{
          $requestIdJson,
          $userJson,
          "product": ${contribution(amount = amount, billingPeriod = billingPeriod)},
          "paymentProvider": "PayPal",
          "paymentFields": $stripeJson,
          "sessionId": "testingToken",
          "acquisitionData": $acquisitionData
        }"""

  val createPayPalPaymentMethodDigitalPackJson =
    s"""{
          $requestIdJson,
          $userJson,
          $digitalPackProductJson,
          "paymentProvider": "PayPal",
          "paymentFields": $payPalJson,
          "acquisitionData": $acquisitionData
        }"""

  val createDirectDebitDigitalPackJson =
    s"""{
          $requestIdJson,
          $userJson,
          $digitalPackProductJson,
          "paymentProvider": "PayPal",
          "paymentFields": $directDebitJson,
          "acquisitionData": $acquisitionData
        }"""

  val createDirectDebitGuardianWeeklyJson =
    s"""{
          $requestIdJson,
          $userJson,
          $guardianWeeklyJson,
          "paymentProvider": "PayPal",
          "paymentFields": $directDebitJson,
          "acquisitionData": $acquisitionData
        }"""

  val createSalesforceContactJson =
    s"""
          {
            $requestIdJson,
            $userJson,
            "product": ${contribution()},
            "paymentProvider": "PayPal",
            "paymentMethod": $payPalPaymentMethod,
            "acquisitionData": $acquisitionData
          }
        """

  def thankYouEmailJson(product: String = contribution()): String =
    s"""{
       |  $requestIdJson,
       |  $userJson,
       |  "product": $product,
       |  "paymentProvider": "PayPal",
       |  "salesForceContact": {
       |    "Id": "123",
       |    "AccountId": "123"
       |  },
       |  "accountNumber": "A-123",
       |  "subscriptionNumber": "A-S123",
       |  "paymentOrRedemptionData": {
       |    "paymentMethod": $stripePaymentMethod,
       |    "paymentSchedule": {
         |    "payments": [
         |      {
         |        "date": "2019-01-14",
         |        "amount": 11.99
         |      },
         |      {
         |        "date": "2019-02-14",
         |        "amount": 11.99
         |      },
         |      {
         |        "date": "2019-03-14",
         |        "amount": 11.99
         |      }
         |    ]
         |  }
       |  }
       |}
     """.stripMargin

  val salesforceContactJson =
    """
        {
          "Id": "0033E00001Cq8D2QAJ",
          "AccountId": "0013E00001AU6xcQAD"
        }
      """

  val salesforceContactsJson =
    """{
          "buyer": {
              "Id": "0033E00001Cq8D2QAJ",
              "AccountId": "0013E00001AU6xcQAD"
            },
          "giftRecipient": {
              "Id": "0033E00001Cq8D2QAJ",
              "AccountId": "0013E00001AU6xcQAD"
            }
       }
      """

  def createContributionZuoraSubscriptionJson(billingPeriod: BillingPeriod = Monthly): String =
    s"""
          {
            $requestIdJson,
            $userJson,
            "product": ${contribution(billingPeriod = billingPeriod)},
            "paymentProvider": "PayPal",
            "paymentMethod": $stripePaymentMethod,
            "salesForceContact": $salesforceContactJson,
            "salesforceContacts": $salesforceContactsJson
            }
        """
  def createDigiPackZuoraSubscriptionJson: String =
    s"""
          {
            $requestIdJson,
            $userJson,
            "product": $digitalPackJson,
            "paymentProvider": "PayPal",
            "paymentMethod": $stripePaymentMethod,
            "salesForceContact": $salesforceContactJson,
            "salesforceContacts": $salesforceContactsJson
            }
        """

  def createCorporateDigiPackZuoraSubscriptionJson: String =
    s"""
          {
            $requestIdJson,
            $userJson,
            "product": $digitalPackJson,
            "paymentProvider": "PayPal",
            "paymentMethod": {"redemptionCode": "FAKECODE"},
            "salesForceContact": $salesforceContactJson,
            "salesforceContacts": $salesforceContactsJson
            }
        """

  val zuoraErrorResponse =
    """[{"Code": "TRANSACTION_FAILED","Message": "Transaction declined.do_not_honor - Your card was declined."}]"""






}
