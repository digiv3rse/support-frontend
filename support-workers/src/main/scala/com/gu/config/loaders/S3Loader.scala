package com.gu.config.loaders

import com.gu.aws.AwsS3Client
import com.gu.monitoring.SafeLogging
import com.gu.support.config.Stage
import com.typesafe.config.{Config, ConfigFactory}

class S3Loader extends PrivateConfigLoader with SafeLogging {
  override def load(stage: Stage, public: Config): Config = {
    val uri: AwsS3Client.S3Location = AwsS3Client.parseUri(public.getString(s"config.private.s3.$stage"))
    logger.info(s"Loading config from S3 for stage: $stage from $uri")
    AwsS3Client
      .fetchAsString(uri)
      .map(
        ConfigFactory.parseString(_).withFallback(ConfigFactory.load()),
      )
      .get
  }
}
