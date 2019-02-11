package com.gu.config.loaders

import com.amazonaws.regions.Regions
import com.amazonaws.services.s3.model.S3Object
import com.amazonaws.services.s3.{AmazonS3ClientBuilder, AmazonS3URI}
import com.gu.aws.CredentialsProvider
import com.gu.monitoring.SafeLogger
import com.gu.support.config.Stage
import com.typesafe.config.{Config, ConfigFactory}

import scala.io.{BufferedSource, Source}

class S3Loader extends PrivateConfigLoader {
  override def load(stage: Stage, public: Config): Config = {
    val uri: AmazonS3URI = new AmazonS3URI(public.getString(s"config.private.s3.$stage"))
    SafeLogger.info(s"Loading config from S3 for stage: $stage from $uri")
    val s3Client = AmazonS3ClientBuilder
      .standard()
      .withCredentials(CredentialsProvider)
      .withRegion(Regions.EU_WEST_1)
      .build()

    val s3Object: S3Object = s3Client.getObject(uri.getBucket, uri.getKey)

    val source: BufferedSource = Source.fromInputStream(s3Object.getObjectContent)
    try {
      val conf = source.mkString
      ConfigFactory.parseString(conf).withFallback(public)
    } finally {
      source.close()
    }
  }
}
