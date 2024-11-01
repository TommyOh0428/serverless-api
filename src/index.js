const serverless = require("serverless-http");
const express = require("express");
const app = express();
const AWS = require("aws-sdk");
const { neon, neonConfig } = require("@neondatabase/serverless");
const AWS_REGION = 'us-east-2';

const ssm = new AWS.SSM({ region: AWS_REGION });

const DATABASE_URL_SSM_PARAM = '/serverless-nodejs-api/prod/database_url';

// remove aws-sdk before deploying because it makes node_modules too big

async function dbClient() {
  // for http connections
  // non-pooling
  const paramStoreData = await ssm.getParameter({ 
    Name: DATABASE_URL_SSM_PARAM, 
    // because it is encrypted, we need to decrypt it
    WithDecryption: true
  }).promise();
  console.log(paramStoreData);
  neonConfig.fetchConnectionCache = true;
  const sql = neon(paramStoreData.Parameter.Value);
  return sql;
}

app.get("/", async (req, res, next) => {
  const sql = await dbClient();
  const result = await sql`select now();`;
  return res.status(200).json({
    message: "Hello from root!",
    result: result,
  });
});

app.get("/hello", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from path!",
  });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

// server-full version
// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });

exports.handler = serverless(app);
