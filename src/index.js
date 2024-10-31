const serverless = require("serverless-http");
const express = require("express");
const app = express();
const { neon, neonConfig } = require("@neondatabase/serverless");

async function dbClient() {
  // for http connections
  // non-pooling
  neonConfig.fetchConnectionCache = true;
  const sql = neon(process.env.DATABASE_URL);
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
