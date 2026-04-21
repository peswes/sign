import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

/* =========================
   DB CACHE (IMPORTANT FOR VERCEL)
========================= */
let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;

  const client = new MongoClient(uri);
  await client.connect();

  cachedDb = client.db("test"); // ✅ FIXED: YOUR REAL DATABASE

  console.log("✅ Connected to DB: test");

  return cachedDb;
}

/* =========================
   CORS
========================= */
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

/* =========================
   HANDLER
========================= */
export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let db;

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

    const userId =
      decoded?.user?.id ||
      decoded?.id ||
      decoded?._id;

    const email =
      decoded?.user?.email ||
      decoded?.email;

    if (!userId && !email) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    /* =========================
       REQUEST BODY
    ========================= */
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
    db = await connectDB();

    /* =========================
       BUILD USER QUERY (FIXED)
    ========================= */
    let query = null;

    if (userId && ObjectId.isValid(userId)) {
      query = { _id: new ObjectId(userId) };
    } else if (email) {
      query = { email: email.toLowerCase().trim() };
    }

    if (!query) {
      return res.status(400).json({ error: "Cannot build user query" });
    }

    console.log("🔎 USER QUERY:", query);

    /* =========================
       FIND USER
    ========================= */
    const user = await db.collection("users").findOne(query);

    if (!user) {
      console.log("❌ USER NOT FOUND:", query);
      return res.status(404).json({
        error: "User not found",
        debug: query
      });
    }

    /* =========================
       SAVE QUIZ RESULT
    ========================= */
    await db.collection("quiz_results").insertOne({
      userId: user._id,
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
      { _id: user._id },
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
      xpEarned,
      message: "Quiz saved successfully"
    });

  } catch (err) {
    console.error("❌ QUIZ API ERROR:", err);

    return res.status(500).json({
      error: "Server error",
      details: err.message
    });

  }
}