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
   XP CALCULATION
========================= */
function calculateXP(percent, score, totalQuestions) {
  let xpEarned = 0;
  
  // Base XP from percentage (max 50 XP)
  const baseXP = Math.floor(percent * 0.5);
  xpEarned += Math.min(baseXP, 50);
  
  // Passing bonus (50% or higher)
  if (percent >= 50) {
    xpEarned += 10;
  }
  
  // Excellence bonus (80% or higher)
  if (percent >= 80) {
    xpEarned += 15;
  }
  
  // Perfect score bonus
  if (percent === 100) {
    xpEarned += 25;
  }
  
  // Cap at 100 XP per quiz
  return Math.min(xpEarned, 100);
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

    const userId = decoded?.user?.id || decoded?.id || decoded?.userId;
    const email = decoded?.user?.email || decoded?.email;

    const db = await connectDB();

    /* =========================
       USER QUERY
    ========================= */
    let query = null;
    let user = null;

    if (userId && ObjectId.isValid(userId)) {
      query = { _id: new ObjectId(userId) };
    } else if (email) {
      query = { email: email.toLowerCase().trim() };
    }

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Invalid user identification"
      });
    }

    user = await db.collection("users").findOne(query);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    /* =========================
       GET REQUESTS (Check Status)
    ========================= */
    if (req.method === "GET") {
      const { mode, course, topic } = req.query;

      if (mode === "status") {
        const existing = await db.collection("quiz_results").findOne({
          userId: user._id,
          course: course,
          topicIndex: Number(topic)
        });

        return res.json({
          success: true,
          completed: !!existing,
          score: existing?.score || 0,
          percent: existing?.percent || 0,
          xpEarned: existing?.xpEarned || 0
        });
      }

      // Get all results
      const results = await db.collection("quiz_results")
        .find({ userId: user._id })
        .sort({ createdAt: -1 })
        .toArray();

      return res.json({
        success: true,
        results: results
      });
    }

    /* =========================
       POST - SAVE QUIZ
    ========================= */
    const {
      course,
      topicIndex,
      score = 0,
      totalQuestions = 0,
      percent = 0,
      xpEarned: clientXPEarned,
      status = "completed",
      answers = [],
      reflections = [],
      followUpAnswers = [],
      assignmentCode = "",
      timeSpent = 0
    } = req.body;

    if (!course || topicIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing course or topicIndex"
      });
    }

    /* =========================
       CHECK FOR EXISTING SUBMISSION
    ========================= */
    const existing = await db.collection("quiz_results").findOne({
      userId: user._id,
      course: course,
      topicIndex: Number(topicIndex)
    });

    if (existing) {
      return res.status(403).json({
        success: false,
        message: "Quiz already submitted. XP locked for this topic.",
        existingScore: existing.percent,
        existingXP: existing.xpEarned
      });
    }

    /* =========================
       CALCULATE GRADE AND XP
    ========================= */
    const finalPercent = percent || Math.min(100, Math.max(0, score));
    const finalScore = score || Math.floor(finalPercent * totalQuestions / 100);
    
    let xpEarned = clientXPEarned || 0;
    if (!clientXPEarned) {
      xpEarned = calculateXP(finalPercent, finalScore, totalQuestions);
    }
    
    // Determine letter grade
    let letterGrade = "F";
    if (finalPercent >= 90) letterGrade = "A";
    else if (finalPercent >= 80) letterGrade = "B";
    else if (finalPercent >= 70) letterGrade = "C";
    else if (finalPercent >= 60) letterGrade = "D";
    
    const passed = finalPercent >= 70;

    /* =========================
       SAVE QUIZ RESULT
    ========================= */
    const quizData = {
      userId: user._id,
      course: course,
      topicIndex: Number(topicIndex),
      score: finalScore,
      totalQuestions: totalQuestions || 10,
      percent: finalPercent,
      letterGrade: letterGrade,
      passed: passed,
      xpEarned: xpEarned,
      answers: answers || [],
      reflections: reflections || [],
      followUpAnswers: followUpAnswers || [],
      assignmentCode: assignmentCode || "",
      status: status,
      timeSpent: timeSpent,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection("quiz_results").insertOne(quizData);

    /* =========================
       UPDATE USER XP
    ========================= */
    const newTotalXP = (user.xp || 0) + xpEarned;
    const newLevel = Math.floor(newTotalXP / 100) + 1;
    
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $inc: {
          xp: xpEarned,
          totalScore: finalScore,
          totalQuizzesCompleted: 1
        },
        $set: {
          lastActive: new Date(),
          level: newLevel
        },
        $push: {
          quizHistory: {
            course,
            topicIndex,
            score: finalScore,
            percent: finalPercent,
            xpEarned: xpEarned,
            timestamp: new Date()
          }
        }
      }
    );

    /* =========================
       GET COURSE PROGRESS
    ========================= */
    const courseResults = await db.collection("quiz_results")
      .find({ userId: user._id, course: course })
      .toArray();
    
    const completedTopics = courseResults.length;
    const totalTopicsForCourse = 12; // Default for frontend
    
    /* =========================
       RESPONSE
    ========================= */
    return res.json({
      success: true,
      message: "Quiz saved successfully",
      xpEarned: xpEarned,
      totalXP: newTotalXP,
      grade: {
        score: finalScore,
        total: totalQuestions || 10,
        percent: finalPercent,
        letterGrade: letterGrade,
        passed: passed
      },
      levelInfo: {
        level: newLevel,
        xp: newTotalXP,
        xpForNextLevel: (newLevel * 100) - newTotalXP
      },
      courseProgress: {
        completedTopics: completedTopics,
        totalTopics: totalTopicsForCourse,
        percentage: Math.round((completedTopics / totalTopicsForCourse) * 100)
      }
    });

  } catch (err) {
    console.error("❌ SAVE QUIZ ERROR:", err);

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
}