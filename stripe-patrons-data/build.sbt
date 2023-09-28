import LibraryVersions.{awsClientVersion, awsClientVersion2, circeVersion}
import com.gu.riffraff.artifact.RiffRaffArtifact.autoImport.riffRaffManifestProjectName
import sbt.Keys.libraryDependencies

version := "0.1-SNAPSHOT"

scalacOptions ++= Seq(
  "-Ymacro-annotations",
)

libraryDependencies ++= Seq(
  "ch.qos.logback" % "logback-classic" % "1.4.7",
  "software.amazon.awssdk" % "dynamodb" % awsClientVersion2,
  "com.amazonaws" % "aws-java-sdk-ssm" % awsClientVersion,
  "com.amazonaws" % "aws-lambda-java-core" % "1.2.2",
  "com.amazonaws" % "aws-lambda-java-events" % "3.11.2",
  "com.stripe" % "stripe-java" % "20.136.0",
  "io.circe" %% "circe-core" % circeVersion,
  "io.circe" %% "circe-generic" % circeVersion,
  "io.circe" %% "circe-parser" % circeVersion,
)

riffRaffPackageType := assembly.value
riffRaffManifestProjectName := s"support:stripe-patrons-data"
riffRaffUploadArtifactBucket := Option("riffraff-artifact")
riffRaffUploadManifestBucket := Option("riffraff-builds")
riffRaffArtifactResources += (
  file("cdk/cdk.out/StripePatronsData-PROD.template.json"), "cfn/StripePatronsData-PROD.template.json"
)
riffRaffArtifactResources += (
  file("cdk/cdk.out/StripePatronsData-CODE.template.json"), "cfn/StripePatronsData-CODE.template.json"
)
// We use the buildNumber to set the lambda fileName, because lambda versioning requires a new fileName each time
val buildNumber = sys.env.getOrElse("GITHUB_RUN_NUMBER", "DEV")
assemblyJarName := s"${name.value}-$buildNumber.jar"
assembly / assemblyMergeStrategy := {
  case PathList("models", xs @ _*) => MergeStrategy.discard
  case x if x.endsWith("io.netty.versions.properties") => MergeStrategy.first
  case x if x.endsWith("module-info.class") => MergeStrategy.discard
  case "mime.types" => MergeStrategy.first
  case name if name.endsWith("execution.interceptors") => MergeStrategy.filterDistinctLines
  case y =>
    val oldStrategy = (assembly / assemblyMergeStrategy).value
    oldStrategy(y)
}

// We also have to put the build number in the .jar, because AWS refuses to create a new lambda version if the jar is the same!
resourceGenerators in Compile += Def.task {
  val file = (resourceManaged ).value / "build.number"
  IO.write(file, buildNumber)
  Seq(file)
}.taskValue

lazy val deployToCode =
  inputKey[Unit]("Directly update AWS lambda code from local instead of via RiffRaff for faster feedback loop")

deployToCode := {
  import scala.sys.process._
  val s3Bucket = "membership-dist"
  val s3Path = "support/CODE/stripe-patrons-data/stripe-patrons-data.jar"
  (s"aws s3 cp ${assembly.value} s3://" + s3Bucket + "/" + s3Path + " --profile membership --region eu-west-1").!!
  List(
    "stripe-patrons-data-CODE",
    "stripe-patrons-data-cancelled-CODE",
    "stripe-patrons-data-sign-up-CODE",
  ).foreach(functionPartial => {
    System.out.println(s"Updating function $functionPartial")
    s"aws lambda update-function-code --function-name $functionPartial --s3-bucket $s3Bucket --s3-key $s3Path --profile membership --region eu-west-1".!!
  })
}
