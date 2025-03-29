import express from "express";

import { v4 as uuidv4 } from "uuid";
import client from "./config/redis.js";

export async function startServer() {
  const app = express();
  app.use(express.json());

  const redisClient = client;

  const port = process.env.PORT || 3000;

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.post("/submit-code", async (req, res) => {
    const { language, code } = req.body;
    const job = { language, code: Buffer.from(code, "utf-8"), id: uuidv4() };
    try {
      await redisClient.lPush("codeQueue", JSON.stringify(job));
      res.json({ message: "Code submitted successfully", job });
    } catch (err) {
      console.error("Redis Error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
