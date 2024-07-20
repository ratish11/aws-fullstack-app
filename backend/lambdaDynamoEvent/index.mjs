import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { EC2Client, RunInstancesCommand, DescribeInstancesCommand, TerminateInstancesCommand  } from "@aws-sdk/client-ec2";
import { SSMClient, SendCommandCommand, GetCommandInvocationCommand  } from "@aws-sdk/client-ssm";

import {
    region,
    imageId,
    instanceType,
    keyNameName,
    sgIds,
    subnetId,
    instanceProfile,
    dynamoDBTable,
    s3BucketID
} from './config.js';

const ec2Client = new EC2Client({ region });
const ssmClient = new SSMClient({ region });
const dynamoDBClient = new DynamoDB({region});

export const handler = async (event) => {
    console.info("DBClient ", dynamoDBClient)
    console.info('Received event:', JSON.stringify(event, null, 2), typeof event);
    try {
        const data = event.Records.dynamodb.NewImage;
        const id =  data.id;
        const textInput = data.input_text;
        const inputFile = data.input_file_path;

        // create ec2 instance in default VPC
        const createInstancesCommand = new RunInstancesCommand({
            ImageId: imageId, 
            InstanceType: instanceType, 
            MinCount: 1,
            MaxCount: 1,
            KeyName: keyNameName,
            SecurityGroupIds: sgIds, 
            SubnetId: subnetId,
            IamInstanceProfile: {
                Name: instanceProfile
              }
          });

        const runInstancesResponse = await ec2Client.send(createInstancesCommand);
        const instanceId = runInstancesResponse.Instances[0].InstanceId;
        console.log(`Created EC2 instance with ID: ${instanceId}`);
        let instanceState = 'pending';
        while (instanceState !== 'running') {
          const describeInstancesCommand = new DescribeInstancesCommand({
            InstanceIds: [instanceId],
          });
          const describeInstancesResponse = await ec2Client.send(describeInstancesCommand);
          instanceState = describeInstancesResponse.Reservations[0].Instances[0].State.Name;
          console.log(`Instance state: ${instanceState}`);
          if (instanceState === 'running') break;
          await new Promise(resolve => setTimeout(resolve, 5000)); 
        }

        const runEC2Script = new SendCommandCommand({
            InstanceIds: [instanceId],
            DocumentName: 'AWS-RunShellScript',
            Parameters: {
              commands: [`aws s3 cp s3://${s3BucketID}/vm_script.py vm_script.py && python vm_script.py && python --version`]
            }
        });
        const runScript = await ssmClient.send(runEC2Script);
        const commandId = runScript.Command.CommandId;
        console.log(`Sent command to EC2 instance: ${runScript}`);

        let commandStatus = 'Pending';
        while (commandStatus === 'Pending' || commandStatus === 'InProgress') {
          const getCommandInvocationCommand = new GetCommandInvocationCommand({
            CommandId: commandId,
            InstanceId: instanceId,
          });
          const commandInvocationResponse = await ssmClient.send(getCommandInvocationCommand);
          commandStatus = commandInvocationResponse.Status;
          console.log(`Command completed with status: ${commandStatus}`);
          if (commandStatus === 'Success' || commandStatus === 'Failed' || commandStatus === 'TimedOut') break;
          await new Promise(resolve => setTimeout(resolve, 5000)); 
        }

        const terminateInstancesCommand = new TerminateInstancesCommand({ InstanceIds: [instanceId] });

        const terminateInstancesResponse = await ec2Client.send(terminateInstancesCommand);
        console.log(`Terminated EC2 instance: ${terminateInstancesResponse}`);
      
        const response = {
            statusCode: 200,
            body: JSON.stringify({ message: 'Info: DynamoDB update after file processing'}),
          };
          return response;
    } catch (error) {
        console.error('Error in the process', error);
        const response = {
          statusCode: 500,
          body: JSON.stringify({ message: 'Failed in the process', error }),
        }
        return response;
    }
};
  
// const processEvent = async (record) => {
//     try {
//         // Parse the record data
//         const data = record.dynamodb.NewImage;
//         const params = {
//             TableName: dynamoDBTable,
//             Item: {
//                 'id': { S: data.id },  
//                 'content': { S: data.content },  
//                 'timestamp': { N: Date.now().toString() } 
//             }
//         };

//         // // Insert the item into DynamoDB
//         // await dynamoDBClient.putItem(params).promise();
//         // console.log(`Successfully processed record ${data.id}`);
//     } catch (error) {
//         console.error(`Error processing record: ${error}`);
//         throw error;  // Re-throw the error to mark the Lambda execution as failed
//     }
//     // }
// }