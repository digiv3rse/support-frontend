import LibraryVersions.{jacksonDatabindVersion, jacksonVersion, circeVersion}

name := "module-acquisition-events"

description := "Module for sending acquisition events"

libraryDependencies ++= Seq(
  "com.google.cloud" % "google-cloud-bigquery" % "1.126.0",
  "io.circe" %% "circe-core" % circeVersion,
  "io.circe" %% "circe-generic" % circeVersion,
  "com.amazonaws" % "aws-java-sdk-kinesis" % "1.12.10",

  // This is required to force aws libraries to use the latest version of jackson
  "com.fasterxml.jackson.core" % "jackson-databind" % jacksonDatabindVersion,
  "com.fasterxml.jackson.core" % "jackson-annotations" % jacksonVersion,
  "com.fasterxml.jackson.dataformat" % "jackson-dataformat-cbor" % jacksonVersion,
)
