import SeleniumTestConfig._
import LibraryVersions._

version := "1.0-SNAPSHOT"

packageSummary := "Support Play APP"

testOptions in SeleniumTest := Seq(Tests.Filter(seleniumTestFilter))

testOptions in Test := Seq(Tests.Filter(unitTestFilter))

libraryDependencies ++= Seq(
  "com.typesafe" % "config" % "1.3.2",
  "com.gu" %% "simple-configuration-ssm" % "1.5.6",
  "org.scalatestplus.play" %% "scalatestplus-play" % "5.1.0" % Test,
  "org.mockito" % "mockito-core" % "2.28.2" % Test,
  "io.sentry" % "sentry-logback" % "1.7.5",
  "com.amazonaws" % "aws-java-sdk-stepfunctions" % awsClientVersion,
  "com.amazonaws" % "aws-java-sdk-sts" % awsClientVersion,
  "com.amazonaws" % "aws-java-sdk-s3" % awsClientVersion,
  "com.amazonaws" % "aws-java-sdk-lambda" % awsClientVersion,
  "org.typelevel" %% "cats-core" % catsVersion,
  "com.dripower" %% "play-circe" % playCirceVersion,
  "com.gu" %% "fezziwig" % "1.4",
  "io.circe" %% "circe-core" % circeVersion,
  "io.circe" %% "circe-generic" % circeVersion,
  "io.circe" %% "circe-generic-extras" % circeVersion,
  "io.circe" %% "circe-parser" % circeVersion,
  "joda-time" % "joda-time" % "2.9.9",
  "com.gu.identity" %% "identity-auth-play" % "3.248",
  "com.gu" %% "identity-test-users" % "0.8",
  "com.google.guava" % "guava" % "29.0-jre",
  "io.lemonlabs" %% "scala-uri" % scalaUriVersion,
  "com.gu.play-googleauth" %% "play-v27" % "2.1.0",
  "io.github.bonigarcia" % "webdrivermanager" % "3.3.0" % "test",
  "org.seleniumhq.selenium" % "selenium-java" % "3.8.1" % "test",
  "org.scalatestplus" %% "scalatestplus-mockito" % "1.0.0-M2" % Test,
  "org.scalatestplus" %% "scalatestplus-selenium" % "1.0.0-M2" % Test,
  "com.squareup.okhttp3" % "okhttp" % "3.10.0",
  "com.gocardless" % "gocardless-pro" % "2.8.0",
  "com.googlecode.libphonenumber" % "libphonenumber" % "8.10.4",
  // This is required to force aws libraries to use the latest version of jackson
  "com.fasterxml.jackson.core" % "jackson-databind" % jacksonDatabindVersion,
  "com.fasterxml.jackson.core" % "jackson-annotations" % jacksonVersion,
  filters,
  ws
)
dependencyOverrides += "com.fasterxml.jackson.core" % "jackson-databind" % jacksonDatabindVersion

sources in(Compile, doc) := Seq.empty

publishArtifact in(Compile, packageDoc) := false

enablePlugins(SystemdPlugin)

debianPackageDependencies := Seq("openjdk-8-jre-headless")

packageSummary := "Support Frontend Play App"
packageDescription := """Frontend for the new supporter platform"""
maintainer := "Membership <membership.dev@theguardian.com>"

riffRaffPackageType := (packageBin in Debian).value
riffRaffManifestProjectName := "support:frontend-mono"
riffRaffPackageName := "frontend"
riffRaffUploadArtifactBucket := Option("riffraff-artifact")
riffRaffUploadManifestBucket := Option("riffraff-builds")
riffRaffArtifactResources += (file("support-frontend/cloud-formation/cfn.yaml"), "cfn/cfn.yaml")
riffRaffArtifactResources ++= getFiles(file("support-frontend/public/compiled-assets"), "assets-static")

def getFiles(rootFile: File, deployName: String): Seq[(File, String)] = {
  def getFiles0(f: File): Seq[(File, String)] = {
    f match {
      case file if file.isFile => Seq((file, file.toString.replace(rootFile.getPath, deployName)))
      case dir if dir.isDirectory => dir.listFiles.toSeq.flatMap(getFiles0)
    }
  }
  getFiles0(rootFile)
}

riffRaffArtifactResources ++= getFiles(file("support-frontend/storybook-static"), "storybook-static")

javaOptions in Universal ++= Seq(
  "-Dpidfile.path=/dev/null",
  "-J-XX:MaxMetaspaceSize=256m",
  "-J-XX:+PrintGCDetails",
  "-J-XX:+PrintGCDateStamps",
  s"-J-Xloggc:/var/log/${packageName.value}/gc.log"
)

javaOptions in Test += "-Dconfig.file=test/selenium/conf/selenium-test.conf"

addCommandAlias("devrun", "run 9210") // Chosen to not clash with other Guardian projects - we can't all use the Play default of 9000!
