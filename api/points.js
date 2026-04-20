import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

/* =========================
   CORS HEADERS
========================= */
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
  setCors(res);

  /* =========================
     HANDLE PRE-FLIGHT REQUEST
  ========================= */
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let client;

  try {
    /* =========================
       AUTH CHECK
    ========================= */
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);

    const {
      course,
      topicIndex,
      score,
      totalQuestions,
      percent,
      answers,
      xpEarned
    } = req.body;

    /* =========================
       CONNECT DB
    ========================= */
    client = await MongoClient.connect(uri);
    const db = client.db("lms");

    /* =========================
       1. SAVE QUIZ HISTORY
    ========================= */
    await db.collection("quiz_results").insertOne({
      userId: user.id,
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
       2. UPDATE USER XP
    ========================= */
    await db.collection("users").updateOne(
      { _id: new ObjectId(user.id) },
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

    return res.json({ success: true });

  } catch (err) {
    console.error("Quiz save error:", err);
    return res.status(500).json({ error: "Failed to save quiz result" });

  } finally {
    /* =========================
       CLOSE CONNECTION
    ========================= */
    if (client) {
      await client.close();
    }
  }
}