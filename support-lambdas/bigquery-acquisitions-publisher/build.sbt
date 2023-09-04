import LibraryVersions.circeVersion
import LibraryVersions._

name := "bigquery-acquisitions-publisher"
description := "A lambda for publishing acquisitions events to BigQuery"

libraryDependencies ++= Seq(
  "com.amazonaws" % "aws-lambda-java-core" % "1.2.0",
  "com.amazonaws" % "aws-lambda-java-events" % "3.11.1",
  "com.amazonaws" % "aws-java-sdk-ssm" % awsClientVersion,
  "ch.qos.logback" % "logback-classic" % "1.1.11",
  "com.typesafe.scala-logging" %% "scala-logging" % "3.9.5",
  "io.circe" %% "circe-core" % circeVersion,
  "io.circe" %% "circe-generic" % circeVersion
)

assemblyJarName := s"${name.value}.jar"
riffRaffPackageType := assembly.value
riffRaffUploadArtifactBucket := Option("riffraff-artifact")
riffRaffUploadManifestBucket := Option("riffraff-builds")
riffRaffManifestProjectName := s"support:lambdas:${name.value}"
riffRaffArtifactResources += (file(
  "cdk/cdk.out/BigqueryAcquisitionsPublisher-PROD.template.json"
), "cfn/BigqueryAcquisitionsPublisher-PROD.template.json")
riffRaffArtifactResources += (file(
  "cdk/cdk.out/BigqueryAcquisitionsPublisher-CODE.template.json"
), "cfn/BigqueryAcquisitionsPublisher-CODE.template.json")
