const { DynamoDBClient, CreateTableCommand, UpdateTableCommand } = require("@aws-sdk/client-dynamodb");
const { region, dynamoDBTable } = require('./config');

// Configure the DynamoDB client
const dynamodbClient = new DynamoDBClient({ region: region }); // Replace with your desired region

async function createDynamoDBTable(tableName) {
    console.log("TableName", tableName);
  const params = {
    TableName: tableName,
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" }, // Partition key
      { AttributeName: "input_file_path", KeyType: "RANGE" } // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "input_file_path", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  };

  try {
    const data = await dynamodbClient.send(new CreateTableCommand(params));
    console.log("Table created successfully:", data);
    return data;
  } catch (err) {
    console.error("Error creating table:", err);
    throw err;
  }
}

async function addDynamoDBStream(tableName) {
  try {
    const updateTableParams = {
      TableName: dynamoDBTable,
      StreamSpecification: {
        StreamEnabled: true,
        StreamViewType: "NEW_IMAGE"
      }
    };
    const command = new UpdateTableCommand(updateTableParams);
    const response = await dynamodbClient.send(command);
    console.log("Table updated successfully:", response);
  } catch (error) {
    console.error("Error updating table:", error);
  }
}

// Usage
const tableName = dynamoDBTable;
createDynamoDBTable(tableName); //table already created
addDynamoDBStream(tableName);