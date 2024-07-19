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
    startUpPort: 3001,
    labmdaPackageFile: "./lambdaCode/lambdaCode.zip",
    lambdaFuncName: "lambdaBridge",
    labmdaRoleArn: "arn:aws:iam::490489140525:role/service-role/lambdaBridge-role-yszvp6rm",
    s3BucketName: "fovus-content-storage",
    apiUrl: "https://g3hnzy55m0.execute-api.us-east-2.amazonaws.com/lambdaBridge",
    dynamoDBTable : "fovus-content-idx-table",
};

module.exports = config;