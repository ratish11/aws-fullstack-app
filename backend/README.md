# NodeJS Backend for s3 File Upload and Indexing in Dynamo
Let's walkthrough each components of this application:
Node stand alone scripts are executed as `node <path to scripf file>`
- createLambdaAPIGW.js:
    This script will create the Lambdabridge Function, with it's code residing inside `lambdaCode` dir.
    The lambdabridge function is to receive the API request from API gateway called from the application.
    This request is then parsed for inputText and fileName for the uploaded file.
    The details are then written in DynamoDB Table

- createDynamoDB.js:
    This script creates a DynamoDB Table 
    Enables a DBStream for the `lambdaForStreamProcessing` Lambda function with only `newImage` as `StreamViewType`

- lambdaForStreamProcessing.js
    This code for the lambda function is placed inside the `lambdaDynamoEvent` dir
    This script creates a `lambdaForDynamoStreamProcessing` lambda function along with the required Role for execution and it's associated policy
    Eventually it creates `EventSourceMapping` for capturing and processing the new `EventStreams` coming from the DynamoDB table.
    Note: The EventSourceMapping is filtered for Filename ending with `.InputFile` to avoid processing/invocation for `.OutputFile` write on DynamoDB
    For the IAM Role and assicated policy creation the required json files are placed inside `configs` dir

### Note: Some IAM Roles and Policy changes are done manually to avoid recreation/replacement of roles/service. Handling recreation edition of the IAM roles/policies was getting time consuming.
