package com.gu.support.workers.exceptions

class SalesforceException(message: String = "", cause: Throwable = None.orNull) extends NonFatalException(message, cause)
