const { startUpPort, region, s3BucketName, apiUrl } = require("./config");
const express = require("express");
const multer = require("multer");
const { memoryStorage } = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const FormData = require('form-data');
// const  { readFile } = require("fs/promises");
const fetch = require('node-fetch');
const app = express();
const port = startUpPort;


  const s3Client = new S3Client({ region: region });
  const storage = memoryStorage();
  const upload = multer({ storage });

  async function registerToDynammo(apiUrl, inputText, bucketName, key) {

    // const formdata = new FormData();
    // formdata.append("textInput", inputText);
    // formdata.append("fileName", `${bucketName}/${key}`);
    // const requestOptions = {
    //   method: "POST",
    //   body: formdata,
    //   redirect: "follow"
    // };
    const body = {
      "textInput" : inputText,
      "fileName" : `${bucketName}/${key}`
    }
    try {
      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      // fetch(apiUrl, requestOptions);
      if (!resp.status==="200") {
        console.log(`HTTP error! status: ${resp.status}`);
        // throw resp;
        return resp.status

      }
      const data = await resp.json();
      console.log('API response:', data);
      return resp.status;
    } catch (error) {
      console.error('Error calling API Gateway:', error);
      throw error;
    }
  }

  async function uploadFileToS3(bucketName, key, fileBuffer, mimetype) {
    try {
  
      const params = {
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype
      };
  
      const command = new PutObjectCommand(params);
      const result = await s3Client.send(command);
  
      console.log(`File uploaded successfully. ETag: for key= ${key}  ${result.ETag}`);
      // return result;
    } catch (err) {
      console.error("Error uploading file:", err);
      throw err;
    }
  }
  
  app.post('/uploadFile', upload.single('file'), async (req, res) => { 
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const textInput = req.body.textInput;
    const mimetype = req.file.mimetype;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const key = `${fileName}.InputFile`;
    await uploadFileToS3(s3BucketName, key, fileBuffer, mimetype);
    //now call api gateway to write to DynammoDB it needs inputText and s3BucketName/key
    const dyresp = await registerToDynammo(apiUrl, textInput, s3BucketName, key);
    if(dyresp!==200) {
      return res.status(500).json({ error: 'Error Failed to write to DynamoDB' });
    }
    res.json({ message: 'File uploaded successfully', filename: req.file.originalname });
  });


  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.listen(port, function (err) {
    if (err) console.log(err);
      console.log(`Server is running on http://localhost:${port}`);
  });