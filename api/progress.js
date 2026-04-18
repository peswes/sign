import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;

/* =========================
   ENV SAFETY CHECK
========================= */
if (!uri) {
  throw new Error("❌ MONGODB_URI is missing in environment variables");
}

if (!jwtSecret) {
  throw new Error("❌ JWT_SECRET is missing in environment variables");
}

/* =========================
   GLOBAL CACHE (IMPORTANT FOR VERCEL)
========================= */
let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

/* =========================
   CONNECT DB
========================= */
async function getDB() {
  const client = await clientPromise;
  return client.db("edtech");
}

/* =========================
   HANDLER
========================= */
export default async function handler(req, res) {

  // 🔥 allow frontend calls
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    const db = await getDB();
    const collection = db.collection("progress");

    /* =========================
       AUTH
    ========================= */
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    let user;
    try {
      user = jwt.verify(token, jwtSecret);
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = user.id;

    /* =========================
       GET PROGRESS
    ========================= */
    if (req.method === "GET") {

      const data = await collection.find({ userId }).toArray();

      return res.status(200).json({
        success: true,
        data
      });
    }

    /* =========================
       SAVE PROGRESS
    ========================= */
    if (req.method === "POST") {

      let body = req.body;

      // 🔥 safety parse (Vercel sometimes sends string)
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch (e) {
          return res.status(400).json({ error: "Invalid JSON body" });
        }
      }

      const { courseId, completedLessons = [], progress = 0 } = body;

      if (!courseId) {
        return res.status(400).json({ error: "courseId is required" });
      }

      await collection.updateOne(
        { userId, courseId },
        {
          $set: {
            userId,
            courseId,
            completedLessons,
            progress,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

      return res.status(200).json({
        success: true,
        message: "Progress saved"
      });
    }

    /* =========================
       METHOD NOT ALLOWED
    ========================= */
    return res.status(405).json({ error: "Method not allowed" });

  } catch (error) {

    console.error("🔥 Progress API crash:", error);

    return res.status(500).json({
      error: "Server error"
    });
  }
}