# aws-fullstack-app

Have to hardcode some variables in Lambda code since they are standalone codes and I don't have any middleware where I can fetch these details which would be a good practise in the production environment. 

NanoID package is bound with node_modules for LambdaBridge since it is not available on Lambda's inbuilt layers.
Rest packages have been imported into env from the layers of lambda as per the documents for v3 sdk