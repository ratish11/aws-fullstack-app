// var config = {};
// config.region = "us-east-2"
// config.startUpPort = 3001
// config.labmdaPackageFile = "lambdaCode.zip"
// config.lambdaFuncName = "lambdaBridge"
// config.labmdaRoleArn = "arn:aws:iam::490489140525:role/service-role/lambdaBridge-role-yszvp6rm"
// config.s3BucketName = "ContentStorage"
// export default config;


const config = {
    region: "us-east-2",
    accountID: "490489140525", 
    startUpPort: 3001,
    labmdaPackageFile: "./lambdaCode/lambdaCode.zip",
    lambdaFuncName: "lambdaBridge",
    labmdaRoleArn: "arn:aws:iam::490489140525:role/lambda-bridge-role",
    s3BucketName: "fovus-content-storage",
    apiUrl: "https://qn71wg4i4c.execute-api.us-east-2.amazonaws.com/upload",
    dynamoDBTable : "fovus-content-idx-table",
    dynamoDBStreamARN: "arn:aws:dynamodb:us-east-2:490489140525:table/fovus-content-idx-table/stream/2024-07-20T21:05:30.234",
    dyanomoLambdaStreamPolicy: "dyanomoLambdaStreamPolicy",
    trustPolicyPath : "configs/trust-policy.json",
    rolePolicyPath : "configs/role-policy.json",
    dyanomoLambdaStreamRole: "dyanomoLambdaStreamExecutionRole",
    lambdaForDynamoStreamEventPath : "lambdaDynamoEvent/lambdaCode.zip"


    

};

module.exports = config;