import LibraryVersions.{awsClientVersion, catsVersion, circeVersion}

name := "support-services"

description := "Scala library to provide shared services to Guardian Support projects."

libraryDependencies ++= Seq(
  "com.typesafe.scala-logging" %% "scala-logging" % "3.7.2",
  "com.amazonaws" % "aws-java-sdk-dynamodb" % awsClientVersion,
  "org.typelevel" %% "cats-core" % catsVersion,
  "io.circe" %% "circe-core" % circeVersion,
  "io.circe" %% "circe-generic" % circeVersion,
  "io.circe" %% "circe-generic-extras" % circeVersion,
  "io.circe" %% "circe-parser" % circeVersion,
  "com.gu" %% "support-config" % "0.19",
  "com.gu" %% "support-models" % "0.56",
  "com.gu" %% "support-internationalisation" % "0.12",
)
