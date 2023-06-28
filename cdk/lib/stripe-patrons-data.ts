import { GuApiGatewayWithLambdaByPath, GuScheduledLambda } from "@guardian/cdk";
import type {
  GuLambdaErrorPercentageMonitoringProps,
} from "@guardian/cdk/lib/constructs/cloudwatch";
import type { GuStackProps } from "@guardian/cdk/lib/constructs/core";
import { GuStack } from "@guardian/cdk/lib/constructs/core";
import { GuLambdaFunction } from "@guardian/cdk/lib/constructs/lambda";
import type { App } from "aws-cdk-lib";
import { Duration } from "aws-cdk-lib";
import { Schedule } from "aws-cdk-lib/aws-events";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import type { CfnFunction} from "aws-cdk-lib/aws-lambda";
import {Alias, Runtime} from "aws-cdk-lib/aws-lambda";


function dynamoPolicy(stage: string) {
  return new PolicyStatement({
    actions: [
      "dynamodb:GetItem",
      "dynamodb:Scan",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query",
      "dynamodb:DescribeTable",
    ],
    resources: [
      `arn:aws:dynamodb:*:*:table/SupporterProductData-${stage}`,
    ],
  });
}

function parameterStorePolicy(scope: GuStack, appName: string) {
  return new PolicyStatement({
    actions: ["ssm:GetParametersByPath"],
    resources: [
      `arn:aws:ssm:${scope.region}:${scope.account}:parameter/${scope.stage}/support/${appName}/*`,
    ],
  });
}

class StripePatronsDataLambda extends GuLambdaFunction {
  constructor(scope: GuStack, id: string, appName: string, buildNumber: string) {
    super(scope, id, {
      app: appName,
      fileName: `${buildNumber}.jar`,
      functionName: `${appName}-${scope.stage}`,
      handler:
        "com.gu.patrons.lambdas.ProcessStripeSubscriptionsLambda::handleRequest",
      errorPercentageMonitoring: monitoringForEnvironment(scope.stage),
      // rules: [{ schedule: scheduleRateForEnvironment(scope.stage) }],
      runtime: Runtime.JAVA_11,
      memorySize: 1536,
      timeout: Duration.minutes(15),
    });

    // Create a new lambda version, alias it, and enable Snapstart for faster lambda starts
    const version = this.currentVersion;
    new Alias(this, 'Alias', {
      aliasName: scope.stage,
      version,
    });
    (this.node.defaultChild as CfnFunction).snapStart = { applyOn: "PublishedVersions" };

    function monitoringForEnvironment(
      stage: string
    ): GuLambdaErrorPercentageMonitoringProps | undefined {
      if (stage == "PROD") {
        return {
          alarmName: `${appName}-${stage}-ErrorAlarm`,
          alarmDescription: `Triggers if there are errors from ${appName} on ${stage}`,
          snsTopicName: "reader-revenue-dev",
          toleratedErrorPercentage: 1,
          numberOfMinutesAboveThresholdBeforeAlarm: 46,
        };
      }
      return;
    }

    function scheduleRateForEnvironment(stage: string) {
      return Schedule.rate(Duration.minutes(stage == "PROD" ? 30 : 24 * 60));
    }

    this.addToRolePolicy(parameterStorePolicy(scope, appName));
    this.addToRolePolicy(dynamoPolicy(scope.stage));
  }
}

class PatronSignUpLambda extends GuLambdaFunction {
  constructor(scope: GuStack, id: string, appName: string) {
    super(scope, `${appName}-sign-up`, {
      app: appName,
      fileName: `${appName}.jar`,
      functionName: `${appName}-sign-up-${scope.stage}`,
      handler:
        "com.gu.patrons.lambdas.PatronSignUpEventLambda::handleRequest",
      runtime: Runtime.JAVA_11,
      memorySize: 1536,
      timeout: Duration.minutes(15),
    });

    this.addToRolePolicy(parameterStorePolicy(scope, appName));
    this.addToRolePolicy(dynamoPolicy(scope.stage));
  }
}

class PatronCancelledLambda extends GuLambdaFunction {
  constructor(scope: GuStack, id: string, appName: string) {
    super(scope, `${appName}-cancelled`, {
      app: appName,
      fileName: `${appName}.jar`,
      functionName: `${appName}-cancelled-${scope.stage}`,
      handler:
        "com.gu.patrons.lambdas.PatronCancelledEventLambda::handleRequest",
      runtime: Runtime.JAVA_11,
      memorySize: 1536,
      timeout: Duration.minutes(15),
    });

    this.addToRolePolicy(parameterStorePolicy(scope, appName));
    this.addToRolePolicy(dynamoPolicy(scope.stage));
  }
}

export interface StripePatronsDataProps extends GuStackProps {
  buildNumber: string;
}

export class StripePatronsData extends GuStack {
  constructor(scope: App, id: string, props: StripePatronsDataProps) {
    super(scope, id, props);

    const appName = "stripe-patrons-data";

    new StripePatronsDataLambda(this, id, appName, props.buildNumber);

    const patronCancelledLambda = new PatronCancelledLambda(this, id, appName);
    const patronSignUpLambda = new PatronSignUpLambda(this, id, appName);

    // Wire up the API
    new GuApiGatewayWithLambdaByPath(this, {
      app: appName,
      targets: [
        {
          path: "patron/subscription/cancel/{countryId}",
          httpMethod: "POST",
          lambda: patronCancelledLambda,
        },
        {
          path: "patron/subscription/create/{countryId}",
          httpMethod: "POST",
          lambda: patronSignUpLambda,
        },
      ],
      // Create an alarm
      monitoringConfiguration: {
        snsTopicName: "reader-revenue-dev",
        http5xxAlarm: {
          tolerated5xxPercentage: 1,
        },
      },
    });
  }
}
