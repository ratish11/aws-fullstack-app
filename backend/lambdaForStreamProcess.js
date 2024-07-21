const { IAMClient, CreateRoleCommand, PutRolePolicyCommand  } = require("@aws-sdk/client-iam");
const { LambdaClient, CreateEventSourceMappingCommand } = require("@aws-sdk/client-lambda");
const fs = require('fs');
const path = require('path');
const { 
    dyanomoLambdaStreamRole,
    region,
    trustPolicyPath, 
    rolePolicyPath, 
    accountID, 
    dyanomoLambdaStreamPolicy, 
    dynamoDBStreamARN, 
    lambdaForDynamoStreamEventPath ,
 } = require("./config");
const { createLambdaFunction } = require("./createLabmdaAPIGW");

const client = new IAMClient({ region: region });
const lambdaClient = new LambdaClient({ region: region });

const trustRelationshipPolicyForDBStream = JSON.parse(fs.readFileSync(trustPolicyPath, 'utf8'));
const rolePolicyForDBStream = JSON.parse(fs.readFileSync(rolePolicyPath, 'utf8'));

const replaceInPolicy = (policy, region, accountId, dynamoDBStreamARN) => {
    return JSON.parse(
      JSON.stringify(policy)
        .replace(/region/g, region)
        .replace(/accountID/g, accountId)
        .replace(/resourceARN/g, dynamoDBStreamARN)
    );
  };



async function createDyanomoLambdaStreamTrustPolicy() {
  try {
    const params = {
        RoleName: dyanomoLambdaStreamRole,
        AssumeRolePolicyDocument: JSON.stringify(trustRelationshipPolicyForDBStream),
        Description: "Trust Relationship for Lambda functions to process DynamoDB Streams"
      };
    const command = new CreateRoleCommand(params);
    const response = await client.send(command);
    console.log("Trust Policy created:", response);
    return response.Role.Arn;
  } catch (error) {
    console.error("Trust Policy Error:", error);
  }
}

async function createDyanomoLambdaStreamExecutionRole() {
    try {
      const rolePolicyForDBStreamParsed = replaceInPolicy(rolePolicyForDBStream, region, accountID, dynamoDBStreamARN)
      const params = {
          RoleName: dyanomoLambdaStreamRole,
          PolicyName: dyanomoLambdaStreamPolicy,
          PolicyDocument: JSON.stringify(rolePolicyForDBStreamParsed)
        };
      const command = new PutRolePolicyCommand(params);
      const response = await client.send(command);
      console.log("Policy created:", response);
      return response;
    } catch (error) {
      console.error("Error creating IAM Role:", error);
    }
  }

async function createEventSourceMapping(lambdaFuncName) {
    try {
        const params = {
            FunctionName: lambdaFuncName,
            BatchSize: 2,
            FilterCriteria: {
                Filters: [
                    {
                        Pattern: `{"dynamodb": { "NewImage": { "input_file_path": { "S": [{ "suffix": ".InputFile" }] }}}}`
                    }
                ]
            },
              StartingPosition: "LATEST",
              EventSourceArn: dynamoDBStreamARN,
        }
        const command = new CreateEventSourceMappingCommand(params);
        const response = await lambdaClient.send(command);
        console.info("Event source created:", response);
    } catch (error) {
        console.error("Error event source mapping not created:", error);
    }

}
async function main() {
    const roleARN = await createDyanomoLambdaStreamTrustPolicy();
    console.log("Role ARN = ", roleARN);
    await createDyanomoLambdaStreamExecutionRole()
    .then(() => console.log("Execution Role created"))
    .catch(err => console.error("Failed Execution Role creation:", err));
    try {
        const response = await createLambdaFunction("lambdaForDynamoStreamProcessing", roleARN, lambdaForDynamoStreamEventPath);
        console.log("Function created successfully:", response.FunctionName);
        const resp = await createEventSourceMapping(response.FunctionName);

    } catch (error) {
        console.error("Error creating function:", error);
    }
}

main();
