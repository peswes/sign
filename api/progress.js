import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

/* =========================
   SAFETY CHECK (IMPORTANT)
========================= */
if (!uri) {
  throw new Error("MONGODB_URI is missing in environment variables");
}

const client = new MongoClient(uri);

let db;

/* =========================
   CONNECT DB (cached)
========================= */
async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("edtech"); // database name
  }
  return db;
}

/* =========================
   MAIN HANDLER (VERCEL)
========================= */
export default async function handler(req, res) {

  try {

    const database = await connectDB();
    const collection = database.collection("progress");

    /* =========================
       AUTH CHECK
    ========================= */
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    let user;
    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = user.id;

    /* =========================
       SAVE PROGRESS (POST)
    ========================= */
    if (req.method === "POST") {

      const { courseId, completedLessons, progress } = req.body;

      if (!courseId) {
        return res.status(400).json({ error: "courseId is required" });
      }

      await collection.updateOne(
        { userId, courseId },
        {
          $set: {
            userId,
            courseId,
            completedLessons: completedLessons || [],
            progress: progress || 0,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

      return res.status(200).json({
        success: true,
        message: "Progress saved successfully"
      });
    }

    /* =========================
       GET PROGRESS (GET)
    ========================= */
    if (req.method === "GET") {

      const data = await collection.find({ userId }).toArray();

      return res.status(200).json({
        success: true,
        data
      });
    }

    /* =========================
       METHOD NOT ALLOWED
    ========================= */
    return res.status(405).json({ error: "Method not allowed" });

  } catch (error) {

    console.error("Progress API error:", error);

    return res.status(500).json({
      error: "Server error"
    });
  }
}