package com.gu.paypal

import com.gu.support.workers.exceptions.{RetryException, RetryNone, RetryUnlimited}

case class PayPalError(httpCode: Int, message: String) extends Throwable {
  def asRetryException: RetryException =
    if (httpCode == 500)
      new RetryUnlimited(cause = this)
    else
      new RetryNone(cause = this)
}
