import LibraryVersions.circeVersion
import LibraryVersions._

name := "acquisition-events-api"
description := "A lambda for acquisitions events api"

libraryDependencies ++= Seq(
  "com.amazonaws" % "aws-lambda-java-events" % "3.11.0",
  "software.amazon.awssdk" % "lambda" % awsClientVersion2,
  "software.amazon.awssdk" % "core" % awsClientVersion2,
  "software.amazon.awssdk" % "ssm" % awsClientVersion2,
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
riffRaffArtifactResources += (file(s"support-lambdas/${name.value}/cfn.yaml"), "cfn/cfn.yaml")
