package com.gu.support.workers.exceptions

import com.gu.acquisition.model.errors.AnalyticsServiceError
import com.gu.monitoring.SafeLogger
import com.gu.monitoring.SafeLogger._
import com.gu.salesforce.Salesforce.SalesforceErrorResponse
import com.gu.stripe.StripeError
import com.gu.support.workers.exceptions.RetryImplicits._
import com.gu.support.zuora.api.response.ZuoraErrorResponse
/**
 * Maps exceptions from the application to either fatal or non fatal exceptions
 * based on whether we think retrying them has a chance of succeeding
 * see support-workers/docs/error-handling.md
 */
object ErrorHandler {
  val handleException: Throwable => Nothing = {
    //Stripe
    case e: StripeError => logAndRethrow(e.asRetryException)
    //Zuora
    case e: ZuoraErrorResponse => logAndRethrow(e.asRetryException)
    //Salesforce
    case e: SalesforceErrorResponse => logAndRethrow(e.asRetryException)
    // Ophan
    case e: AnalyticsServiceError => logAndRethrow(e.asRetryException)
    //Any Exception that we haven't specifically handled
    case e: Throwable => logAndRethrow(e.asRetryException)
  }

  def logAndRethrow(t: RetryException): Nothing = {
    SafeLogger.error(scrub"${t.getMessage}", t)
    throw t
  }
}
