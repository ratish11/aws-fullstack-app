const { DynamoDBClient, CreateTableCommand } = require("@aws-sdk/client-dynamodb");
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

// Usage
const tableName = dynamoDBTable;
createDynamoDBTable(tableName)
  .then(() => console.log("Table creation initiated"))
  .catch(err => console.error("Failed to initiate table creation:", err));