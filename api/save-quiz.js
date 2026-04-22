import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

/* =========================
   DB CACHE (VERCEL OPTIMIZED)
========================= */
let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;

  const client = new MongoClient(uri);
  await client.connect();

  cachedDb = client.db("test");

  console.log("✅ Connected to DB");
  return cachedDb;
}

/* =========================
   CORS
========================= */
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

/* =========================
   MAIN HANDLER
========================= */
export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    /* =========================
       AUTH
    ========================= */
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId =
      decoded?.user?.id ||
      decoded?.id ||
      decoded?._id;

    const email =
      decoded?.user?.email ||
      decoded?.email;

    const db = await connectDB();

    /* =========================
       USER QUERY
    ========================= */
    let query = null;

    if (userId && ObjectId.isValid(userId)) {
      query = { _id: new ObjectId(userId) };
    } else if (email) {
      query = { email: email.toLowerCase().trim() };
    }

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Invalid user"
      });
    }

    const user = await db.collection("users").findOne(query);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    /* =========================
       GET REQUESTS
    ========================= */
    if (req.method === "GET") {
      const { mode, course, topic } = req.query;

      /* =========================
         CHECK STATUS
      ========================= */
      if (mode === "status") {
        const existing = await db.collection("quiz_results").findOne({
          userId: user._id,
          course,
          topicIndex: Number(topic)
        });

        return res.json({
          success: true,
          completed: !!existing
        });
      }

      /* =========================
         ANALYTICS
      ========================= */
      const results = await db.collection("quiz_results")
        .find({ userId: user._id })
        .toArray();

      const totalQuizzes = results.length;

      const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0);
      const totalQuestions = results.reduce((sum, r) => sum + (r.totalQuestions || 0), 0);

      const percent =
        totalQuestions > 0
          ? Math.round((totalScore / totalQuestions) * 100)
          : 0;

      return res.json({
        success: true,
        totalQuizzes,
        score: totalScore,
        total: totalQuestions,
        percent
      });
    }

    /* =========================
       SAVE QUIZ (POST)
    ========================= */
    const {
      course,
      topicIndex,
      score = 0,
      totalQuestions = 0,
      percent = 0,
      answers = [],
      xpEarned = 0,
      sessionId,
      status = "completed" // completed or abandoned
    } = req.body;

    if (!course || topicIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing course or topicIndex"
      });
    }

    /* =========================
       🔒 STRONG ANTI-CHEAT CHECK
    ========================= */
    const existing = await db.collection("quiz_results").findOne({
      userId: user._id,
      course,
      topicIndex: Number(topicIndex)
    });

    if (existing) {
      return res.status(403).json({
        success: false,
        message: "Quiz already submitted. XP locked."
      });
    }

    /* =========================
       SAVE QUIZ RESULT
    ========================= */
    await db.collection("quiz_results").insertOne({
      userId: user._id,
      course,
      topicIndex: Number(topicIndex),
      sessionId: sessionId || null,
      score,
      totalQuestions,
      percent,
      answers,
      xpEarned,
      status,
      passed: percent >= 50,
      createdAt: new Date()
    });

    /* =========================
       ATOMIC XP UPDATE (NO CHEAT)
    ========================= */
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $inc: {
          xp: Number(xpEarned),
          totalScore: Number(score)
        },
        $set: {
          lastActive: new Date(),
          lastQuizSession: sessionId
        }
      }
    );

    return res.json({
      success: true,
      message: "Quiz saved successfully",
      xpEarned
    });

  } catch (err) {
    console.error("❌ QUIZ API ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
}