import LibraryVersions._

name := "payment-api"

version := "0.1"
scalacOptions ++= Seq(
  "-Ywarn-unused:imports",
  "-Ymacro-annotations",
)

addCompilerPlugin("org.typelevel" % "kind-projector_2.13.4" % "0.13.2")

libraryDependencies ++= Seq(
  "ch.qos.logback" % "logback-classic" % "1.2.11",
  "com.amazonaws" % "aws-java-sdk-ssm" % awsClientVersion,
  "com.amazonaws" % "aws-java-sdk-sqs" % awsClientVersion,
  "com.amazonaws" % "aws-java-sdk-s3" % awsClientVersion,
  "com.amazonaws" % "aws-java-sdk-ec2" % awsClientVersion,
  "com.amazonaws" % "aws-java-sdk-cloudwatch" % awsClientVersion,
  "com.amazonaws" % "aws-java-sdk-sqs" % awsClientVersion,
  "com.amazon.pay" % "amazon-pay-java-sdk" % "3.6.5",
  "com.beachape" %% "enumeratum" % "1.7.2",
  "com.beachape" %% "enumeratum-circe" % "1.7.2",
  "com.dripower" %% "play-circe" % playCirceVersion,
  "org.typelevel" %% "simulacrum" % "1.0.1",
  "com.stripe" % "stripe-java" % stripeVersion,
  "com.gocardless" % "gocardless-pro" % "5.14.1",
  "io.circe" %% "circe-core" % circeVersion,
  "io.circe" %% "circe-generic" % circeVersion,
  "io.circe" %% "circe-parser" % circeVersion,
  "org.playframework.anorm" %% "anorm" % "2.7.0",
  "org.scalatest" %% "scalatest" % "3.0.9" % "test",
  "org.scalatestplus" %% "mockito-3-4" % "3.2.10.0" % "test",
  "org.mockito" % "mockito-core" % "5.1.1",
  "org.typelevel" %% "cats-core" % catsVersion,
  "com.github.blemale" %% "scaffeine" % "5.2.1",
  // This is required to force aws libraries to use the latest version of jackson
  "com.fasterxml.jackson.core" % "jackson-databind" % jacksonDatabindVersion,
  "com.fasterxml.jackson.core" % "jackson-annotations" % jacksonVersion,
  "com.fasterxml.jackson.core" % "jackson-core" % jacksonVersion,
  "com.fasterxml.jackson.dataformat" % "jackson-dataformat-cbor" % jacksonVersion,
  "com.fasterxml.jackson.datatype" % "jackson-datatype-jdk8" % jacksonVersion,
  "com.fasterxml.jackson.datatype" % "jackson-datatype-jsr310" % jacksonVersion,
  "com.fasterxml.jackson.module" %% "jackson-module-scala" % jacksonVersion,
  "com.google.guava" % "guava" % "25.1-jre", // -- added explicitly - snyk report avoid logback vulnerability
  "com.paypal.sdk" % "rest-api-sdk" % "1.14.0" exclude ("org.apache.logging.log4j", "log4j-slf4j-impl"),
  akkaHttpServer, // or use nettyServer for Netty
  logback, // add Play logging support
  jdbc,
  ws,
  "com.lihaoyi" %% "pprint" % "0.8.1",
  "com.github.blemale" %% "scaffeine" % "3.1.0",
  "org.scala-lang.modules" %% "scala-xml" % "2.1.0",
)

dependencyOverrides += "com.fasterxml.jackson.core" % "jackson-databind" % jacksonDatabindVersion

resolvers += Resolver.sonatypeRepo("releases")

debianPackageDependencies := Seq("openjdk-8-jre-headless")
Debian / packageName := name.value
packageSummary := "Payment API Play App"
packageDescription := """API for reader revenue payments"""
maintainer := "Reader Revenue <reader.revenue.dev@theguardian.com>"

riffRaffUploadArtifactBucket := Option("riffraff-artifact")
riffRaffUploadManifestBucket := Option("riffraff-builds")
riffRaffManifestProjectName := "support:payment-api-mono"
riffRaffPackageType := (Debian / packageBin).value
riffRaffArtifactResources += (file("cdk/cdk.out/Payment-API-PROD.template.json"), "cfn/Payment-API-PROD.template.json")
riffRaffArtifactResources += (file("cdk/cdk.out/Payment-API-CODE.template.json"), "cfn/Payment-API-CODE.template.json")
