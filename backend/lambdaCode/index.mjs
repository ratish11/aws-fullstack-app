import { DynamoDB, PutItemCommand } from "@aws-sdk/client-dynamodb";
// import { DynamoDBClient, PutItemCommand  } from "@aws-sdk/client-dynamodb";
import { nanoid } from "nanoid";

const client = new DynamoDB({region: "us-east-2"});
const dynamoDBTable = "fovus-content-idx-table";

export const handler = async (event) => {
    // console.info('Received event:', JSON.stringify(event, null, 2));
    const id = nanoid();
    // const decodedBody = Buffer.from(event.body, 'base64').toString('utf-8');
    // console.info(decodedBody);
    const requestBody = JSON.parse(event.body)
    
    const { textInput, fileName } = requestBody;
    console.info(id, textInput, fileName, typeof requestBody, requestBody);
    const params = {
        TableName: dynamoDBTable,
        Item: {
          id: { S: id },
          input_text: { S: textInput },
          input_file_path: { S: fileName },
        },
      };
    try {
      const result = await client.send(new PutItemCommand(params));
      console.info("dynamo put result", result);
      if(!result.statusCode==="200") {
        throw result;
      }
      const response = {
        statusCode: 200,
        body: JSON.stringify({ message: 'Item successfully written to DynamoDB'}),
      };
      return response;
    } catch (error) {
      console.error('Error writing to DynamoDB', error);
      const response = {
        statusCode: 500,
        body: JSON.stringify({ message: 'Failed to write to DynamoDB', error }),
      }
      return response;
    }
};
  