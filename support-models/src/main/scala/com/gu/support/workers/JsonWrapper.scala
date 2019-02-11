package com.gu.support.workers

/**
 * AWS Step Functions expect to be passed valid Json, as we want to encrypt the whole of the
 * state, we need to wrap it in a Json 'wrapper' object as a Base64 encoded String
 */
case class JsonWrapper(state: String, error: Option[ExecutionError], requestInfo: RequestInfo)

import com.gu.support.encoding.Codec
import com.gu.support.encoding.Codec._

object JsonWrapper {
  implicit val codec: Codec[JsonWrapper] = deriveCodec
}
