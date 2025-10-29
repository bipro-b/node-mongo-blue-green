const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/bluegreen";

let db, mongoClient;

async function connectMongo() {
  try {
    mongoClient = new MongoClient(MONGO_URL, { connectTimeoutMS: 10000 });
    await mongoClient.connect();
    db = mongoClient.db(); // default from URL (bluegreen)
    console.log("[Mongo] Connected");
  } catch (err) {
    console.error("[Mongo] Connection error:", err.message);
    // Don't crash; app still responds for root; health shows failure
  }
}

app.get("/", (req, res) => {
  res.send("hello blue green");
});

app.get("/health", async (req, res) => {
  try {
    if (!db) throw new Error("DB not connected");
    await db.command({ ping: 1 });
    res.json({ status: "ok", mongo: "connected" });
  } catch (e) {
    res.status(500).json({ status: "degraded", mongo: e.message || "down" });
  }
});

app.listen(PORT, async () => {
  console.log(`[App] Listening on ${PORT}`);
  await connectMongo();
});

process.on("SIGINT", async () => {
  if (mongoClient) await mongoClient.close().catch(() => {});
  process.exit(0);
});
