import scala.sys.process._
import LibraryVersions._
import com.gu.riffraff.artifact.RiffRaffArtifact.autoImport.riffRaffManifestProjectName
import sbt.Keys.{libraryDependencies, resolvers}

version := "0.1-SNAPSHOT"
scalacOptions ++= Seq("-deprecation", "-feature", "-unchecked", "-target:jvm-1.8", "-Xfatal-warnings")

lazy val setupGitHook = taskKey[Unit]("Set up a pre-push git hook to run the integration tests")

setupGitHook := {
  "ln -s ../../scripts/pre-push .git/hooks/pre-push" !
}

libraryDependencies ++= Seq(
  "org.joda" % "joda-convert" % "2.0.1",
  "org.typelevel" %% "cats-core" % catsVersion,
  "com.typesafe.scala-logging" %% "scala-logging" % "3.9.0",
  "ch.qos.logback" % "logback-classic" % "1.2.3",
  "io.symphonia" % "lambda-logging" % "1.0.1",
  "com.squareup.okhttp3" % "okhttp" % okhttpVersion,
  "io.lemonlabs" %% "scala-uri" % scalaUriVersion,
  "com.amazonaws" % "aws-java-sdk-s3" % awsClientVersion,
  "com.amazonaws" % "aws-java-sdk-sqs" % awsClientVersion,
  "com.amazonaws" % "aws-java-sdk-stepfunctions" % awsClientVersion,
  // This is required to force aws libraries to use the latest version of jackson
  "com.fasterxml.jackson.core" % "jackson-databind" % jacksonVersion,
  "com.fasterxml.jackson.core" % "jackson-annotations" % jacksonVersion,
  "com.fasterxml.jackson.dataformat" % "jackson-dataformat-cbor" % jacksonVersion,
  "org.mockito" %% "mockito-scala" % "1.15.0" % "it,test",
  "org.mockito" %% "mockito-scala-scalatest" % "1.15.0" % "it,test",
  "org.scalatestplus" %% "scalatestplus-mockito" % "1.0.0-M2" % "it,test",
  "org.scalatestplus" %% "scalatestplus-selenium" % "1.0.0-M2" % "it,test",
  "com.squareup.okhttp3" % "mockwebserver" % okhttpVersion % "it,test",
  "io.circe" %% "circe-core" % circeVersion,
  "io.circe" %% "circe-generic" % circeVersion,
  "io.circe" %% "circe-generic-extras" % circeVersion,
  "io.circe" %% "circe-parser" % circeVersion,
  "org.scala-stm" %% "scala-stm" % "0.8",
  "io.sentry" % "sentry-logback" % "1.7.4",
  "com.google.code.findbugs" % "jsr305" % "3.0.2",
  "com.gocardless" % "gocardless-pro" % "2.8.0",
  "com.gu" %% "acquisition-event-client-play26" % "4.0.31"
)

riffRaffPackageType := assembly.value
riffRaffManifestProjectName := s"support:support-workers-mono"
riffRaffManifestBranch := Option(System.getenv("BRANCH_NAME")).getOrElse("unknown_branch")
riffRaffBuildIdentifier := Option(System.getenv("BUILD_NUMBER")).getOrElse("DEV")
riffRaffManifestVcsUrl := "git@github.com/guardian/support-frontend.git"
riffRaffUploadArtifactBucket := Option("riffraff-artifact")
riffRaffUploadManifestBucket := Option("riffraff-builds")
riffRaffArtifactResources += (file("support-workers/cloud-formation/target/cfn.yaml"), "cfn/cfn.yaml")
riffRaffArtifactResources += (file("support-workers/target/scala-2.12/support-workers-it.jar"), "it-tests/support-workers-it.jar")
assemblyJarName := s"${name.value}.jar"
assemblyMergeStrategy in assembly := {
  case PathList("models", xs@_*) => MergeStrategy.discard
  case x if x.endsWith("io.netty.versions.properties") => MergeStrategy.first
  case x if x.endsWith("module-info.class") => MergeStrategy.discard
  case "mime.types" => MergeStrategy.first
  case y =>
    val oldStrategy = (assemblyMergeStrategy in assembly).value
    oldStrategy(y)
}

Project.inConfig(IntegrationTest)(baseAssemblySettings)
assemblyJarName in (IntegrationTest, assembly) := s"${name.value}-it.jar"
assemblyMergeStrategy in (IntegrationTest, assembly) := {
  case PathList("models", xs@_*) => MergeStrategy.discard
  case x if x.endsWith("io.netty.versions.properties") => MergeStrategy.first
  case x if x.endsWith("logback.xml") => MergeStrategy.first
  case x if x.endsWith("module-info.class") => MergeStrategy.discard
  case "mime.types" => MergeStrategy.first
  case y =>
    val oldStrategy = (assemblyMergeStrategy in assembly).value
    oldStrategy(y)
}
IntegrationTest / assembly / test := {}
IntegrationTest / assembly / aggregate := false
