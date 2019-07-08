MAX_EXECUTIONS=${1:-1}   
aws stepfunctions list-executions --status-filter FAILED --state-machine-arn arn:aws:states:eu-west-1:865473395570:stateMachine:support-workers-PROD --max-items $MAX_EXECUTIONS --profile membership --region eu-west-1 | \
grep executionArn | \
awk '{print $2;}' | \
sed 's=^"\(.*\)",$=\1=' | \
xargs -n1 aws stepfunctions get-execution-history --profile membership --region eu-west-1 --execution-arn | \
jq '[.events[] | select(.type == "LambdaFunctionFailed")] | .[0]' | \
jq '{ timestamp: (.timestamp | todate), cause: (.lambdaFunctionFailedEventDetails.cause | fromjson) }'
