import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;

  const client = new MongoClient(uri);
  await client.connect();

  cachedDb = client.db("test");
  console.log("✅ Connected to DB");

  return cachedDb;
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded?.user?.id || decoded?.id || decoded?._id;
    const email = decoded?.user?.email || decoded?.email;

    const db = await connectDB();

    let query = null;

    if (userId && ObjectId.isValid(userId)) {
      query = { _id: new ObjectId(userId) };
    } else if (email) {
      query = { email: email.toLowerCase().trim() };
    }

    if (!query) {
      return res.status(400).json({ success: false, message: "Invalid user" });
    }

    const user = await db.collection("users").findOne(query);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    /* =========================
       GET (LOAD / STATUS / ANALYTICS)
    ========================= */
    if (req.method === "GET") {
      const { mode, course, topic } = req.query;

      /* 🔁 LOAD EXISTING SESSION */
      if (mode === "resume") {
        const session = await db.collection("quiz_results").findOne({
          userId: user._id,
          course,
          topicIndex: Number(topic),
          status: { $in: ["in_progress", "abandoned"] }
        });

        return res.json({
          success: true,
          session: session || null
        });
      }

      /* ✅ CHECK COMPLETED */
      if (mode === "status") {
        const existing = await db.collection("quiz_results").findOne({
          userId: user._id,
          course,
          topicIndex: Number(topic),
          status: "completed"
        });

        return res.json({
          success: true,
          completed: !!existing
        });
      }

      /* 📊 ANALYTICS */
      const results = await db.collection("quiz_results")
        .find({ userId: user._id, status: "completed" })
        .toArray();

      const totalQuizzes = results.length;
      const totalScore = results.reduce((s, r) => s + (r.score || 0), 0);
      const totalQuestions = results.reduce((s, r) => s + (r.totalQuestions || 0), 0);

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
       POST (SAVE / UPDATE PROGRESS)
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
      currentIndex = 0,
      status = "in_progress" // in_progress | completed | abandoned
    } = req.body;

    if (!course || topicIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing course or topicIndex"
      });
    }

    const existing = await db.collection("quiz_results").findOne({
      userId: user._id,
      course,
      topicIndex: Number(topicIndex)
    });

    /* =========================
       🚫 BLOCK IF COMPLETED
    ========================= */
    if (existing && existing.status === "completed") {
      return res.status(403).json({
        success: false,
        message: "Quiz already completed"
      });
    }

    /* =========================
       🔄 UPDATE EXISTING SESSION
    ========================= */
    if (existing) {
      await db.collection("quiz_results").updateOne(
        { _id: existing._id },
        {
          $set: {
            answers,
            currentIndex,
            score,
            percent,
            totalQuestions,
            status,
            updatedAt: new Date()
          }
        }
      );
    } else {
      /* 🆕 CREATE NEW SESSION */
      await db.collection("quiz_results").insertOne({
        userId: user._id,
        course,
        topicIndex: Number(topicIndex),
        sessionId: sessionId || new Date().getTime().toString(),
        answers,
        currentIndex,
        score,
        totalQuestions,
        percent,
        xpEarned: 0,
        status,
        createdAt: new Date()
      });
    }

    /* =========================
       🎁 GIVE XP ONLY ON COMPLETION
    ========================= */
    if (status === "completed") {
      await db.collection("users").updateOne(
        { _id: user._id },
        {
          $inc: {
            xp: Number(xpEarned),
            totalScore: Number(score)
          },
          $set: {
            lastActive: new Date()
          }
        }
      );

      await db.collection("quiz_results").updateOne(
        {
          userId: user._id,
          course,
          topicIndex: Number(topicIndex)
        },
        {
          $set: {
            xpEarned,
            passed: percent >= 50
          }
        }
      );
    }

    return res.json({
      success: true,
      message: "Progress saved",
      status
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