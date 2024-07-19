import { DynamoDBClient, PutItemCommand  } from "@aws-sdk/client-dynamodb";
import { nanoid } from "nanoid";
// import Busboy from "busboy";

const client = new DynamoDBClient({region: "us-east-2"});
const dynamoDBTable = "fovus-content-idx-table";

export const handler = async (event) => {
    // console.info('Received event:', JSON.stringify(event, null, 2));
    const id = nanoid();
    const requestBody = JSON.parse(event.body);
    const { textInput, fileName } = requestBody;
    console.info(id, textInput, fileName, typeof requestBody);
    const params = {
        TableName: dynamoDBTable,
        Item: {
          id: { S: id },
          input_text: { S: textInput },
          input_file_path: { S: fileName },
        },
      };
    try {
    //   await dynamoDB.put(params).promise();
      await client.send(new PutItemCommand(params));
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
  