# #!/bin/bash

# if [ "$#" -ne 2 ]; then
#     echo "No arguments provided, 
#     ID : required
#     Table Name : required"
#     exit 1
# fi
# itemID=$1
# tableName=$2
# echo "Running getting item from DynamoDB"
# aws dynamodb get-item \
#     --table-name $tableName \
#     --key "{\"id\": {\"N\": \"$itemID\"}}"


import sys
import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
if len(sys.argv) != 5:
    print("Error: Exactly 4 arguments are required.")
    print("Usage: python get_item.py <itemID> <tableName> <s3BucketName> <region>")
    sys.exit(1)


itemID = sys.argv[1]
tableName = sys.argv[2]
s3BucketName = sys.argv[3]
region = sys.argv[4]
dynamodb_client = boto3.resource('dynamodb', region_name=region)
s3_client = boto3.client('s3')
print(f"received agrs: {itemID}, {tableName}")
try:
    table = dynamodb_client.Table(tableName)
    response = table.get_item(
        Key={
            'id': itemID, 
        }
    )
    textInput = response['Item']['input_text']
    inputFile = response['Item']['input_file_path']
    print(f"response = {textInput} {inputFile}")
    saveAs = inputFile.split('/')[-1].split('.InputFile')[0]
    s3_client.download_file(s3BucketName, inputFile.split('/')[-1], saveAs)
    length = len(textInput)
    with open(saveAs, 'r') as file:
        content = file.read()
    content += f"\n: {length} : {textInput}"
    uploadAs = f"{saveAs}.OutputFile"
    with open(uploadAs, 'w') as file:
        file.write(content)
    s3_client.upload_file(uploadAs, s3BucketName, uploadAs)
    response = table.put_item(
            Item={
                'id': itemID,
                'input_text' : textInput,
                'input_file_path' : inputFile,
                'output_file_path': f"s3://{s3BucketName}/{uploadAs}"
            }
        )
    print(response)

except FileNotFoundError:
    print(f"The file {inputFile} was not found")
except NoCredentialsError:
    print("Credentials not available")
except PartialCredentialsError:
    print("Incomplete credentials provided")
except Exception as e:
    print(f"Error! {e}")
