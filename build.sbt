import Dependencies._
import sbt.Keys.libraryDependencies

lazy val root =
  project.in(file("."))
    .aggregate(common, `monthly-contributions`)

lazy val common = project
  .settings(
    name := "guardian-support-common",
    description := "Common code for the support-workers project",
    libraryDependencies ++= commonDependencies
  )
  .settings(Settings.shared: _*)

lazy val `monthly-contributions` = project
  .in(file("monthly-contributions"))
  .enablePlugins(JavaAppPackaging, RiffRaffArtifact)
  .settings(
    name := "monthly-contributions",
    description := "AWS Lambdas providing implementations of the Monthly Contribution supporter flow for orchestration by step function",
    riffRaffPackageName := "monthly-contributions",
    riffRaffManifestProjectName := s"support::monthly-contributions",
    riffRaffPackageType := (packageBin in Universal).value,
    riffRaffArtifactResources += (file("cloud-formation/target/cfn.yaml"), "cfn/cfn.yaml"),
    assemblySettings,
    libraryDependencies ++= monthlyContributionsDependencies
  )
  .settings(Settings.shared: _*)
  .dependsOn(common)

