import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

/* =========================
   GLOBAL DB CACHE (FASTER)
========================= */
let cachedClient = null;
let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db("lms");

  cachedClient = client;
  cachedDb = db;

  console.log("✅ MongoDB connected");

  return db;
}

/* =========================
   CORS SETUP
========================= */
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    /* =========================
       AUTH
    ========================= */
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("🔐 JWT:", decoded);

    /* =========================
       EXTRACT USER DATA
    ========================= */
    const userId =
      decoded?.user?.id ||
      decoded?.id ||
      decoded?._id ||
      null;

    const email =
      decoded?.user?.email ||
      decoded?.email ||
      null;

    if (!userId && !email) {
      return res.status(400).json({
        error: "Invalid token: no user identifier"
      });
    }

    const {
      course,
      topicIndex,
      score = 0,
      totalQuestions = 0,
      percent = 0,
      answers = [],
      xpEarned = 0
    } = req.body;

    /* =========================
       CONNECT DB
    ========================= */
    const db = await connectDB();

    /* =========================
       BUILD USER QUERY
    ========================= */
    let query = null;

    if (userId && ObjectId.isValid(userId)) {
      query = { _id: new ObjectId(userId) };
    }

    if (!query && email) {
      query = { email: email.toLowerCase() };
    }

    if (!query) {
      return res.status(400).json({
        error: "Could not build user query"
      });
    }

    console.log("🔎 USER QUERY:", query);

    /* =========================
       FIND USER FIRST
    ========================= */
    const userData = await db.collection("users").findOne(query);

    if (!userData) {
      console.log("❌ USER NOT FOUND:", query);
      return res.status(404).json({ error: "User not found" });
    }

    /* =========================
       SAVE QUIZ RESULT
    ========================= */
    await db.collection("quiz_results").insertOne({
      userId: userData._id,
      course,
      topicIndex,
      score,
      totalQuestions,
      percent,
      answers,
      xpEarned,
      passed: percent >= 50,
      createdAt: new Date()
    });

    /* =========================
       UPDATE USER XP
    ========================= */
    await db.collection("users").updateOne(
      { _id: userData._id },
      {
        $inc: {
          xp: xpEarned,
          totalScore: score
        },
        $set: {
          lastActive: new Date()
        }
      }
    );

    console.log("✅ QUIZ SAVED + XP UPDATED");

    return res.json({
      success: true,
      message: "Quiz saved successfully",
      xpEarned
    });

  } catch (err) {
    console.error("❌ QUIZ API ERROR:", err);

    return res.status(500).json({
      error: "Failed to save quiz result",
      details: err.message
    });
  }
}