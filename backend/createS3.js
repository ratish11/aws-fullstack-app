const { S3Client, CreateBucketCommand } = require("@aws-sdk/client-s3");
const { region, s3BucketName } = require('./config');
// Configure the S3 client
const s3Client = new S3Client({ region: region }); // Replace with your desired region

// Function to create an S3 bucket
async function createS3Bucket(s3BucketName) {
  const params = {
    Bucket: s3BucketName,
    // ACL: "private", // Uncomment if you want to set a specific ACL
  };

  try {
    const data = await s3Client.send(new CreateBucketCommand(params));
    console.log("Success", data);
    return data;
  } catch (err) {
    console.error("Error", err);
    throw err;
  }
}

const bucketName = s3BucketName; 
createS3Bucket(bucketName);