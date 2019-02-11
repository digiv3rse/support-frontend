import sbt.Keys.{publishTo, resolvers, scalaVersion}
import sbtrelease.ReleasePlugin.autoImport.releaseUseGlobalVersion
import sbtrelease.ReleaseStateTransformations._

skip in publish := true

val release = Seq[ReleaseStep](
  checkSnapshotDependencies,
  inquireVersions,
  runClean,
  runTest,
  setReleaseVersion,
  commitReleaseVersion,
  tagRelease,
  ReleaseStep(action = Command.process("publishSigned", _)),
  setNextVersion,
  commitNextVersion,
  ReleaseStep(action = Command.process("sonatypeReleaseAll", _)),
  pushChanges
)

lazy val testSettings: Seq[Def.Setting[_]] = Defaults.itSettings ++ Seq(
  scalaSource in IntegrationTest := baseDirectory.value / "src" / "test" / "scala",
  javaSource in IntegrationTest := baseDirectory.value / "src" / "test" / "java",
  testOptions in Test := Seq(Tests.Argument(TestFrameworks.ScalaTest, "-l", "com.gu.test.tags.annotations.IntegrationTest"))
)

lazy val commonSettings = Seq(
  organization := "com.gu",
  scalaVersion := "2.12.7",
  resolvers ++= Seq(Resolver.sonatypeRepo("releases"), Resolver.bintrayRepo("guardian", "ophan")),
  publishTo := {
    val nexus = "https://oss.sonatype.org/"
    if (isSnapshot.value)
      Some("snapshots" at nexus + "content/repositories/snapshots")
    else
      Some("releases" at nexus + "service/local/staging/deploy/maven2")
  },
  licenses := Seq("Apache V2" -> url("http://www.apache.org/licenses/LICENSE-2.0.html")),

  releaseProcess := release,
  releaseUseGlobalVersion := false,
  releaseVersionFile := file(name.value + "/version.sbt"),
  scmInfo := Some(ScmInfo(
    url("https://github.com/guardian/support-libraries"),
    "scm:git:git@github.com:guardian/support-libraries.git"
  )),
  releaseTagName := {
    val versionInThisBuild = (version in ThisBuild).value
    val versionValue = version.value
    s"${name.value}-v${if (releaseUseGlobalVersion.value) versionInThisBuild else versionValue}"
  }
)

lazy val commonDependencies = Seq(
  "com.typesafe" % "config" % "1.3.2",
  "org.scalatest" %% "scalatest" % "3.0.5" % "it, test"
)

lazy val supportModels = (project in file("support-models"))
  .configs(IntegrationTest)
  .settings(
    commonSettings,
    testSettings,
    libraryDependencies ++= commonDependencies
  )
lazy val supportConfig = (project in file("support-config"))
  .configs(IntegrationTest)
  .settings(
    commonSettings,
    testSettings,
    libraryDependencies ++= commonDependencies
  )
lazy val supportServices = (project in file("support-services"))
  .configs(IntegrationTest)
  .settings(
    commonSettings,
    testSettings,
    libraryDependencies ++= commonDependencies
  )
lazy val supportInternationalisation = (project in file("support-internationalisation"))
  .configs(IntegrationTest)
  .settings(
    commonSettings,
    testSettings,
    libraryDependencies ++= commonDependencies
  )
