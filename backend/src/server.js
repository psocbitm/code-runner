import express from "express";

import { v4 as uuidv4 } from "uuid";
import client from "./config/redis.js";
import cors from "cors";
export async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cors())
  const redisClient = client;

  const port = process.env.PORT || 3000;

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.post("/submit-code", async (req, res) => {
    const { language, code } = req.body;
    const job = { language, code, id: uuidv4() };
    console.log("Job:", job);

    try {
      await redisClient.lPush("tasks", JSON.stringify(job));
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
