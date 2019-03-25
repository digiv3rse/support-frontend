package services.stepfunctions

import services.aws.AwsAsync
import StateMachineContainer.{Response, convertErrors}
import akka.actor.ActorSystem
import cats.data.EitherT
import cats.implicits._
import com.amazonaws.regions.Regions
import services.aws.CredentialsProvider
import com.amazonaws.services.stepfunctions.model._
import com.amazonaws.services.stepfunctions.{AWSStepFunctionsAsync, AWSStepFunctionsAsyncClientBuilder}
import io.circe.Encoder
import cats.implicits._
import services.stepfunctions.StateMachineErrors.Fail

import scala.collection.JavaConversions._
import scala.concurrent.Future
import scala.concurrent.ExecutionContext

object Client {

  def apply(arn: StateMachineArn)(implicit system: ActorSystem): Client = {
    implicit val ec = system.dispatcher

    val client = AWSStepFunctionsAsyncClientBuilder.standard
      .withCredentials(CredentialsProvider)
      .withRegion(Regions.EU_WEST_1)
      .build()

    new Client(client, arn)
  }
}

class Client(client: AWSStepFunctionsAsync, arn: StateMachineArn) {

  private def startExecution(arn: String, input: String)(implicit ec: ExecutionContext): Response[StartExecutionResult] = convertErrors {
    AwsAsync(client.startExecutionAsync, new StartExecutionRequest().withStateMachineArn(arn).withInput(input))
  }

  def triggerExecution[T](input: T, isTestUser: Boolean, isExistingAccount: Boolean = false)(
    implicit
    ec: ExecutionContext,
    encoder: Encoder[T],
    stateWrapper: StateWrapper
  ): Response[StateMachineExecution] = {
    startExecution(arn.asString, stateWrapper.wrap(input, isTestUser, isExistingAccount))
      .map(StateMachineExecution.fromStartExecution)
  }

  def jobIdFromArn(executionArn: String): Option[String] = {
    val region = arn.region
    val accountId = arn.accountId
    val stateMachineId = arn.id

    PartialFunction.condOpt(executionArn.split(':').toList) {
      case "arn" :: "aws" :: "states" :: `region` :: `accountId` :: "execution" :: `stateMachineId` :: executionId :: Nil =>
        executionId
    }
  }

  def arnFromJobId(jobId: String): String =
    s"arn:aws:states:${arn.region}:${arn.accountId}:execution:${arn.id}:${convertLegacyJobId(jobId)}"

  private def convertLegacyJobId(legacyJobId: String): String = legacyJobId.split(':').toList match {
    case _ :: id :: Nil => id
    case _ => legacyJobId
  }

  def statusFromEvents(events: List[HistoryEvent]): Option[ExecutionStatus] =
    events.view.map(_.getType).collectFirst(ExecutionStatus.all)

  def history(jobId: String)(implicit ec: ExecutionContext, stateWrapper: StateWrapper): Response[List[HistoryEvent]] = {
    toEither(
      AwsAsync(client.getExecutionHistoryAsync, new GetExecutionHistoryRequest().withExecutionArn(arnFromJobId(jobId)).withReverseOrder(true))
    ).map(_.getEvents.toList)
  }

  private def toEither[T](result: Future[T])(implicit ec: ExecutionContext): Response[T] = EitherT {
    result.map(_.asRight[StateMachineError]).recover {
      case _: AWSStepFunctionsException => Fail.asLeft
    }
  }

  def status()(implicit ec: ExecutionContext): Response[DescribeStateMachineResult] = convertErrors {
    AwsAsync(client.describeStateMachineAsync, new DescribeStateMachineRequest().withStateMachineArn(arn.asString))
  }
}
