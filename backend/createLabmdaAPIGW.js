const { LambdaClient, CreateFunctionCommand } = require("@aws-sdk/client-lambda");
// const { IAMClient, CreateRoleCommand, AttachRolePolicyCommand } = require("@aws-sdk/client-iam");
const { fromIni } = require("@aws-sdk/credential-provider-ini");
const { readFileSync } = require("fs");
const { labmdaPackageFile, labmdaRoleArn, lambdaFuncName, region } = require('./config');


const client = new LambdaClient({ 
  region: region
 });

const createLambdaFunction = async (funcName, roleArn, labmdaPackageFile) => {
    
  const code = readFileSync(labmdaPackageFile);  
    const command = new CreateFunctionCommand({
      Code: { ZipFile: code },
      FunctionName: funcName,
      Role: roleArn,
      Architectures: ["arm64"],
      Handler: "index.handler", 
      PackageType: "Zip", 
      Runtime: "nodejs20.x",
    });
  
    return client.send(command);
  };
  
  
  const main = async () => {
    try {
        const response = await createLambdaFunction(lambdaFuncName, labmdaRoleArn, labmdaPackageFile);
        console.log("Function created successfully:", response);
    } catch (error) {
        console.error("Error creating function:", error);
    }
  };

main();
module.exports = { createLambdaFunction };