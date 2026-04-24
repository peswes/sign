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
   ASSIGNMENT XP CALCULATION (HIGHER REWARD)
========================= */
function calculateAssignmentXP(assignmentCode, answers = [], quality = "good") {
  let xpEarned = 0;
  
  // Base XP for completing any assignment (starts higher than quiz max)
  xpEarned += 150;
  
  // Quality bonus based on assignment complexity/difficulty
  const codeLength = assignmentCode?.length || 0;
  const answerCount = answers.length;
  
  // Bonus for detailed answers (max +50 XP)
  if (answerCount >= 5) {
    xpEarned += 50;
  } else if (answerCount >= 3) {
    xpEarned += 30;
  } else if (answerCount >= 1) {
    xpEarned += 15;
  }
  
  // Bonus for substantial code submission (max +100 XP)
  if (codeLength > 500) {
    xpEarned += 100;
  } else if (codeLength > 200) {
    xpEarned += 60;
  } else if (codeLength > 50) {
    xpEarned += 30;
  }
  
  // Quality multiplier (if quality tracking is implemented)
  if (quality === "excellent") {
    xpEarned = Math.floor(xpEarned * 1.5);
  } else if (quality === "good") {
    xpEarned = Math.floor(xpEarned * 1.2);
  }
  
  // Cap assignment XP higher than quizzes (max 350 XP per assignment)
  return Math.min(xpEarned, 350);
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
       POST - SAVE QUIZ/ASSIGNMENT
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
      timeSpent = 0,
      isAssignment = false,  // New flag to identify assignment submissions
      assignmentQuality = "good"  // Quality rating for assignment
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
        message: "Quiz/Assignment already submitted. XP locked for this topic.",
        existingScore: existing.percent,
        existingXP: existing.xpEarned
      });
    }

    /* =========================
       CALCULATE GRADE, XP, AND TYPE
    ========================= */
    let finalPercent, finalScore, xpEarned, letterGrade, passed;
    let submissionType = isAssignment ? "assignment" : "quiz";
    
    if (isAssignment) {
      // ASSIGNMENT: Higher XP reward
      finalPercent = 100; // Assignments are considered complete
      finalScore = 100;
      passed = true;
      letterGrade = "A";
      
      // Calculate higher XP for assignment
      xpEarned = calculateAssignmentXP(assignmentCode, answers, assignmentQuality);
      
      // If client provided XP, use max of client or calculated (but ensure it's higher than quiz)
      if (clientXPEarned && clientXPEarned > xpEarned) {
        xpEarned = clientXPEarned;
      }
      
      // Ensure assignment XP is at least 50% higher than max quiz XP
      const minAssignmentXP = 150; // 50% higher than quiz max (100)
      if (xpEarned < minAssignmentXP) {
        xpEarned = minAssignmentXP;
      }
      
    } else {
      // QUIZ: Standard calculation
      finalPercent = percent || Math.min(100, Math.max(0, score));
      finalScore = score || Math.floor(finalPercent * totalQuestions / 100);
      
      xpEarned = clientXPEarned || 0;
      if (!clientXPEarned) {
        xpEarned = calculateXP(finalPercent, finalScore, totalQuestions);
      }
      
      // Determine letter grade
      if (finalPercent >= 90) letterGrade = "A";
      else if (finalPercent >= 80) letterGrade = "B";
      else if (finalPercent >= 70) letterGrade = "C";
      else if (finalPercent >= 60) letterGrade = "D";
      else letterGrade = "F";
      
      passed = finalPercent >= 70;
    }

    /* =========================
       SAVE QUIZ/ASSIGNMENT RESULT
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
      submissionType: submissionType,  // Track if it's quiz or assignment
      assignmentQuality: isAssignment ? assignmentQuality : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection("quiz_results").insertOne(quizData);

    /* =========================
       UPDATE USER XP (Higher for assignments)
    ========================= */
    const newTotalXP = (user.xp || 0) + xpEarned;
    const newLevel = Math.floor(newTotalXP / 100) + 1;
    
    const updateFields = {
      $inc: {
        xp: xpEarned,
        totalScore: finalScore,
        totalQuizzesCompleted: isAssignment ? 0 : 1,
        totalAssignmentsCompleted: isAssignment ? 1 : 0
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
          type: submissionType,
          timestamp: new Date()
        }
      }
    };
    
    // Add bonus XP for streaks if it's an assignment
    if (isAssignment) {
      // Check for consecutive assignments
      const lastAssignment = await db.collection("quiz_results")
        .findOne({ 
          userId: user._id, 
          submissionType: "assignment",
          course: course 
        }, 
        { sort: { createdAt: -1 } });
      
      if (lastAssignment) {
        const daysSinceLast = (new Date() - lastAssignment.createdAt) / (1000 * 60 * 60 * 24);
        if (daysSinceLast <= 2) {
          const streakBonus = 50;
          updateFields.$inc.xp += streakBonus;
          updateFields.$push.streakBonus = {
            amount: streakBonus,
            reason: "Assignment streak bonus",
            timestamp: new Date()
          };
        }
      }
    }
    
    await db.collection("users").updateOne(
      { _id: user._id },
      updateFields
    );

    /* =========================
       GET COURSE PROGRESS
    ========================= */
    const courseResults = await db.collection("quiz_results")
      .find({ userId: user._id, course: course })
      .toArray();
    
    const completedTopics = courseResults.length;
    const totalTopicsForCourse = 12; // Default for frontend
    
    const assignmentsCompleted = courseResults.filter(r => r.submissionType === "assignment").length;
    const quizzesCompleted = courseResults.filter(r => r.submissionType === "quiz").length;
    
    /* =========================
       RESPONSE
    ========================= */
    return res.json({
      success: true,
      message: isAssignment ? "Assignment saved successfully!" : "Quiz saved successfully",
      submissionType: submissionType,
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
        percentage: Math.round((completedTopics / totalTopicsForCourse) * 100),
        assignmentsCompleted: assignmentsCompleted,
        quizzesCompleted: quizzesCompleted
      }
    });

  } catch (err) {
    console.error("❌ SAVE ERROR:", err);

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