import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

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

  let client;

  try {
    /* =========================
       AUTH
    ========================= */
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("JWT USER:", decoded);

    /* =========================
       SAFE USER ID
    ========================= */
    const userId =
      decoded?.user?.id ||
      decoded?.id ||
      decoded?._id;

    if (!userId) {
      return res.status(400).json({ error: "Invalid token structure" });
    }

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
    client = new MongoClient(uri);
    await client.connect();

    const db = client.db("lms");

    /* =========================
       SAVE QUIZ RESULT
    ========================= */
    await db.collection("quiz_results").insertOne({
      userId: userId,
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
       SAFE OBJECTID CHECK
    ========================= */
    let objectId;
    try {
      objectId = new ObjectId(userId);
    } catch (err) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    /* =========================
       UPDATE USER XP
    ========================= */
    const updateResult = await db.collection("users").updateOne(
      { _id: objectId },
      {
        $inc: {
          xp: xpEarned || 0,
          totalScore: score || 0
        },
        $set: {
          lastActive: new Date()
        }
      }
    );

    /* =========================
       CHECK UPDATE RESULT
    ========================= */
    if (updateResult.matchedCount === 0) {
      console.log("❌ USER NOT FOUND IN DB:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      success: true,
      message: "Quiz saved successfully"
    });

  } catch (err) {
    console.error("❌ Quiz API error:", err);

    return res.status(500).json({
      error: "Failed to save quiz result",
      details: err.message
    });

  } finally {
    if (client) {
      await client.close();
    }
  }
}