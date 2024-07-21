# aws-fullstack-app

Have to hardcode some variables in Lambda code since they are standalone codes and I don't have any middleware where I can fetch these details which would be a good practise in the production environment. 

NanoID package is bound with node_modules for LambdaBridge since it is not available on Lambda's inbuilt layers.
Rest packages have been imported into env from the layers of lambda as per the documents for v3 sdk

Note: I am trying to upgrade the application a bit as mentioned in the `Bonus` Section of the Coding Challenge

In this project I am using AWS Access key to make api service calls, this can be easily done through AWS IAM Role as a best practice and attach the role to appropriate hosting frontend and backend serices.

Individual ReadMe docs are included inside frontend and backend dirs. 

References included in the `reference.txt`, and many more is missing.

Some Screenshots of the logs on lambda, dynamodb screenshot are included in the `ScreenShots` dir

To start the frontend do the following:
`cd frontend`
`npm start`

To start the backend do the following:
`cd backend`
`node index.js`