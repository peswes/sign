import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

/* =========================
   DB CACHE (VERCEL OPTIMIZED)
========================= */
let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

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
   ANSWER VALIDATION ENGINE
   This checks if the user's answer is correct against database
========================= */
function validateAnswers(answers, course, topicIndex) {
  // Define correct answers for each course and topic
  const correctAnswersDB = {
    // Game Development Course
    "game-development": {
      0: {  // Game Loop topic
        keywords: ["requestAnimationFrame", "update", "render", "deltaTime", "game loop", "animation"],
        requiredConcepts: ["animation frame", "update logic", "render loop"],
        minCodeLength: 100,
        sampleKeywords: ["function", "loop", "frame"]
      },
      1: {  // Input Handling topic
        keywords: ["addEventListener", "keydown", "keyup", "mousemove", "input", "controls", "keyboard"],
        requiredConcepts: ["event listeners", "keyboard input", "mouse input"],
        minCodeLength: 80,
      },
      2: {  // Sprite Animation topic
        keywords: ["sprite", "animation", "frame", "canvas", "drawImage", "animate"],
        requiredConcepts: ["sprite sheets", "animation frames", "canvas drawing"],
        minCodeLength: 100,
      },
      3: {  // Collision Detection topic
        keywords: ["collision", "detect", "AABB", "bounding", "hit", "overlap", "intersect"],
        requiredConcepts: ["collision detection", "bounding boxes", "hit detection"],
        minCodeLength: 80,
      }
    },
    // Frontend Development Course
    "frontend-development": {
      0: {  // HTML Fundamentals
        keywords: ["semantic", "header", "nav", "main", "article", "section", "footer", "html"],
        requiredConcepts: ["semantic HTML", "document structure"],
        minCodeLength: 80,
      },
      1: {  // CSS Styling
        keywords: ["flexbox", "grid", "responsive", "media query", "@media", "display", "css"],
        requiredConcepts: ["flexbox", "CSS Grid", "responsive design"],
        minCodeLength: 80,
      },
      2: {  // JavaScript Basics
        keywords: ["function", "variable", "eventListener", "DOM", "addEventListener", "javascript"],
        requiredConcepts: ["functions", "variables", "event handling", "DOM manipulation"],
        minCodeLength: 100,
      }
    },
    // Backend Development Course
    "backend-development": {
      0: {  // Server Architecture
        keywords: ["express", "server", "route", "api", "endpoint", "listen"],
        requiredConcepts: ["express server", "API routes", "HTTP methods"],
        minCodeLength: 80,
      },
      1: {  // Node.js Event Loop
        keywords: ["async", "await", "promise", "callback", "event loop", "non-blocking"],
        requiredConcepts: ["asynchronous", "event loop", "callbacks"],
        minCodeLength: 80,
      },
      2: {  // Express API
        keywords: ["express", "app.get", "app.post", "middleware", "route", "json"],
        requiredConcepts: ["express routes", "middleware", "REST API"],
        minCodeLength: 100,
      }
    }
  };

  // Get validation rules for this course and topic
  const validation = correctAnswersDB[course]?.[topicIndex];
  if (!validation) {
    // If no specific validation, use default scoring based on length
    const answerText = Array.isArray(answers) ? answers.join(" ") : answers;
    const length = answerText?.length || 0;
    return {
      score: Math.min(100, Math.floor(length / 10) + 20),
      feedback: "Submission received. Keep improving your answers!"
    };
  }

  let totalPoints = 0;
  let maxPoints = 0;
  let feedback = [];

  // Combine all answers into one text for analysis
  const answerText = Array.isArray(answers) ? answers.join(" ").toLowerCase() : (answers || "").toLowerCase();
  
  // Check for keywords (40% of score)
  const keywordMatches = validation.keywords.filter(keyword => 
    answerText.includes(keyword.toLowerCase())
  );
  const keywordScore = (keywordMatches.length / validation.keywords.length) * 40;
  totalPoints += keywordScore;
  maxPoints += 40;
  if (keywordMatches.length > 0) {
    feedback.push(`✓ Found ${keywordMatches.length}/${validation.keywords.length} key concepts`);
  } else {
    feedback.push(`✗ Missing key concepts: ${validation.keywords.slice(0, 3).join(", ")}`);
  }

  // Check for required concepts (30% of score)
  if (validation.requiredConcepts) {
    const conceptMatches = validation.requiredConcepts.filter(concept => 
      answerText.includes(concept.toLowerCase())
    );
    const conceptScore = (conceptMatches.length / validation.requiredConcepts.length) * 30;
    totalPoints += conceptScore;
    maxPoints += 30;
    if (conceptMatches.length > 0) {
      feedback.push(`✓ Covered ${conceptMatches.length}/${validation.requiredConcepts.length} core concepts`);
    }
  }

  // Check code length quality (30% of score)
  const codeLength = answerText.length;
  let lengthScore = 0;
  if (codeLength >= validation.minCodeLength) {
    lengthScore = 30;
    feedback.push(`✓ Good code length (${codeLength} characters)`);
  } else if (codeLength >= validation.minCodeLength * 0.5) {
    lengthScore = 15;
    feedback.push(`⚠️ Could be more detailed (${codeLength}/${validation.minCodeLength} chars)`);
  } else {
    feedback.push(`✗ Too short (${codeLength}/${validation.minCodeLength} chars needed)`);
  }
  totalPoints += lengthScore;
  maxPoints += 30;

  // Calculate final percentage (capped at 100)
  let percentage = (totalPoints / maxPoints) * 100;
  percentage = Math.min(percentage, 100);
  
  // Add bonus for excellent answers
  let bonusPoints = 0;
  if (percentage >= 85 && codeLength > validation.minCodeLength * 2) {
    bonusPoints = 5;
    feedback.push("🌟 Excellent detail! +5% bonus");
  }
  
  let finalPercentage = Math.min(percentage + bonusPoints, 100);

  // Determine letter grade
  let letterGrade = "F";
  if (finalPercentage >= 90) letterGrade = "A";
  else if (finalPercentage >= 80) letterGrade = "B";
  else if (finalPercentage >= 70) letterGrade = "C";
  else if (finalPercentage >= 60) letterGrade = "D";

  return {
    score: Math.round(finalPercentage),
    percent: Math.round(finalPercentage),
    letterGrade,
    passed: finalPercentage >= 70,
    feedback: feedback.join(". "),
    details: {
      keywordMatches: keywordMatches.length,
      totalKeywords: validation.keywords.length,
      answerLength: codeLength,
      minRequired: validation.minCodeLength
    }
  };
}

/* =========================
   XP CALCULATION ENGINE
========================= */
function calculateXP(score, totalQuestions, percent, assignmentQuality = 0, isFirstAttempt = false, timeSpent = 0) {
  let xpEarned = 0;
  
  // Ensure percent is capped at 100
  const cappedPercent = Math.min(percent, 100);
  
  // Base XP from quiz score (max 50 XP)
  const quizXP = Math.floor((score / totalQuestions) * 50);
  xpEarned += quizXP;
  
  // Bonus XP for passing (50% or higher)
  if (cappedPercent >= 50) {
    xpEarned += 10; // Passing bonus
  }
  
  // Bonus XP for excellent performance (80% or higher)
  if (cappedPercent >= 80) {
    xpEarned += 15; // Excellence bonus
  }
  
  // Perfect score bonus (100%)
  if (cappedPercent >= 99) {
    xpEarned += 25; // Perfect score bonus
  }
  
  // Assignment quality bonus (for open-ended assignments)
  if (assignmentQuality > 0) {
    xpEarned += Math.floor(Math.min(assignmentQuality, 100) * 0.5);
  }
  
  // First attempt bonus
  if (isFirstAttempt === true) {
    xpEarned += 20;
  }
  
  // Time bonus for completing quickly (under 5 minutes)
  if (timeSpent > 0 && timeSpent < 300 && cappedPercent >= 70) {
    xpEarned += 10;
  }
  
  return Math.min(xpEarned, 150);
}

/* =========================
   GRADE CALCULATION
========================= */
function calculateGrade(score, totalQuestions, reflections = [], followups = []) {
  // Calculate base percentage (capped at 100)
  let percentage = (score / totalQuestions) * 100;
  percentage = Math.min(percentage, 100);
  
  let letterGrade = "F";
  let gradePoint = 0.0;
  
  if (percentage >= 90) {
    letterGrade = "A";
    gradePoint = 4.0;
  } else if (percentage >= 80) {
    letterGrade = "B";
    gradePoint = 3.0;
  } else if (percentage >= 70) {
    letterGrade = "C";
    gradePoint = 2.0;
  } else if (percentage >= 60) {
    letterGrade = "D";
    gradePoint = 1.0;
  }
  
  // Adjust for reflection quality
  let reflectionBonus = 0;
  if (reflections && reflections.length > 0) {
    const avgReflectionLength = reflections.reduce((sum, r) => sum + (r?.length || 0), 0) / reflections.length;
    if (avgReflectionLength > 100) reflectionBonus = 5;
    else if (avgReflectionLength > 50) reflectionBonus = 3;
  }
  
  // Adjust for follow-up quality
  let followupBonus = 0;
  if (followups && followups.length > 0) {
    const avgFollowupLength = followups.reduce((sum, f) => sum + (f?.length || 0), 0) / followups.length;
    if (avgFollowupLength > 75) followupBonus = 5;
    else if (avgFollowupLength > 40) followupBonus = 3;
  }
  
  // Apply bonuses but DO NOT exceed 100%
  let finalPercentage = percentage + reflectionBonus + followupBonus;
  finalPercentage = Math.min(finalPercentage, 100);
  
  // Recalculate letter grade with final percentage
  let finalLetterGrade = "F";
  if (finalPercentage >= 90) finalLetterGrade = "A";
  else if (finalPercentage >= 80) finalLetterGrade = "B";
  else if (finalPercentage >= 70) finalLetterGrade = "C";
  else if (finalPercentage >= 60) finalLetterGrade = "D";
  
  return {
    percentage: Math.round(finalPercentage),
    letterGrade: finalLetterGrade,
    gradePoint,
    passed: finalPercentage >= 70,
    reflectionBonus,
    followupBonus
  };
}

/* =========================
   UPDATE USER LEVEL
========================= */
async function updateUserLevel(db, userId) {
  const user = await db.collection("users").findOne({ _id: userId });
  
  if (!user) return { level: 1, xp: 0, xpForNextLevel: 100 };
  
  const xp = user.xp || 0;
  
  // Level calculation: level = floor(xp / 100) + 1
  const newLevel = Math.floor(xp / 100) + 1;
  const xpForNextLevel = (newLevel * 100) - xp;
  
  if (user.level !== newLevel) {
    await db.collection("users").updateOne(
      { _id: userId },
      { 
        $set: { 
          level: newLevel,
          xpForNextLevel: xpForNextLevel
        }
      }
    );
  }
  
  return {
    level: newLevel,
    xp: xp,
    xpForNextLevel: xpForNextLevel
  };
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

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
        error: jwtError.message
      });
    }

    const userId = decoded?.user?.id || decoded?.id || decoded?.userId || decoded?._id;
    const email = decoded?.user?.email || decoded?.email;

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
        message: "Invalid user identification"
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
       GET REQUESTS - Check topic status
    ========================= */
    if (req.method === "GET") {
      const { mode, course, topic } = req.query;

      if (mode === "status" && course && topic !== undefined) {
        const existing = await db.collection("quiz_results").findOne({
          userId: user._id,
          course: course,
          topicIndex: Number(topic)
        });

        // Ensure returned percent doesn't exceed 100
        const percent = existing?.percent || 0;
        const cappedPercent = Math.min(percent, 100);

        return res.json({
          success: true,
          completed: !!existing,
          score: existing?.score || 0,
          percent: cappedPercent,
          xpEarned: existing?.xpEarned || 0,
          grade: existing?.grade || null,
          completedAt: existing?.createdAt || null
        });
      }

      // Get all results for analytics
      const results = await db.collection("quiz_results")
        .find({ userId: user._id })
        .sort({ createdAt: -1 })
        .toArray();

      const totalQuizzes = results.length;
      const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0);
      const totalQuestions = results.reduce((sum, r) => sum + (r.totalQuestions || 0), 0);
      const totalXP = results.reduce((sum, r) => sum + (r.xpEarned || 0), 0);
      
      let percent = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
      percent = Math.min(percent, 100);
      
      const levelInfo = await updateUserLevel(db, user._id);

      return res.json({
        success: true,
        totalQuizzes,
        score: totalScore,
        total: totalQuestions,
        percent,
        totalXP,
        levelInfo,
        recentResults: results.slice(0, 10).map(r => ({
          ...r,
          percent: Math.min(r.percent || 0, 100)
        }))
      });
    }

    /* =========================
       POST - SAVE QUIZ WITH VALIDATION
    ========================= */
    if (req.method === "POST") {
      const {
        course,
        topicIndex,
        totalQuestions = 10,
        answers = [],
        reflections = [],
        followUpAnswers = [],
        assignmentCode = "",
        isFirstAttempt = false,
        timeSpent = 0,
        allowResubmit = false,
        autoSubmitted = false,
        score: providedScore,
        percent: providedPercent,
        xpEarned: providedXpEarned
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

      if (existing && !allowResubmit) {
        return res.status(403).json({
          success: false,
          message: "Quiz already submitted. XP locked for this topic.",
          existingScore: Math.min(existing.percent, 100),
          existingXP: existing.xpEarned,
          completedAt: existing.createdAt
        });
      }

      /* =========================
         PROCESS ANSWERS AND SCORE
      ========================= */
      let finalScore = providedScore;
      let finalPercent = providedPercent;
      let validationResult = null;
      let gradeInfo = null;
      let xpEarned = providedXpEarned;

      // If score is provided (frontend already calculated), use it
      if (providedScore !== undefined && providedPercent !== undefined) {
        validationResult = {
          score: providedScore,
          percent: providedPercent,
          feedback: "Quiz completed successfully!",
          details: { source: "frontend" }
        };
        gradeInfo = calculateGrade(providedScore, totalQuestions, reflections, followUpAnswers);
      } else {
        // Validate answers against database
        const allAnswers = [
          ...answers,
          assignmentCode,
          ...reflections,
          ...followUpAnswers
        ].filter(a => a && a.trim().length > 0);
        
        validationResult = validateAnswers(allAnswers, course, Number(topicIndex));
        
        // Calculate grade using validation score
        gradeInfo = calculateGrade(
          validationResult.score, 
          totalQuestions, 
          reflections, 
          followUpAnswers
        );
        
        finalScore = validationResult.score;
        finalPercent = gradeInfo.percentage;
        
        // Calculate XP based on performance
        if (xpEarned === undefined) {
          xpEarned = calculateXP(
            validationResult.score,
            totalQuestions,
            gradeInfo.percentage,
            gradeInfo.percentage,
            isFirstAttempt,
            timeSpent
          );
          
          // Add reflection quality bonus
          if (reflections && reflections.length > 0) {
            const hasQualityReflections = reflections.some(r => r && r.length > 50);
            if (hasQualityReflections) xpEarned += 5;
          }
          
          // Add code quality bonus
          if (assignmentCode && assignmentCode.length > 200) {
            xpEarned += 10;
          }
          
          xpEarned = Math.min(xpEarned, 150);
          xpEarned = Math.max(xpEarned, 5);
        }
      }

      /* =========================
         SAVE QUIZ RESULT
      ========================= */
      const quizData = {
        userId: user._id,
        course: course,
        topicIndex: Number(topicIndex),
        score: finalScore,
        totalQuestions: Number(totalQuestions),
        percent: finalPercent,
        answers: answers || [],
        reflections: reflections || [],
        followUpAnswers: followUpAnswers || [],
        assignmentCode: assignmentCode || "",
        xpEarned: xpEarned,
        grade: gradeInfo?.letterGrade || "C",
        gradePoint: gradeInfo?.gradePoint || 2.0,
        passed: gradeInfo?.passed || finalPercent >= 70,
        status: "completed",
        timeSpent: timeSpent,
        isRetry: !!existing,
        autoSubmitted: autoSubmitted || false,
        retryCount: existing ? (existing.retryCount || 0) + 1 : 0,
        validationDetails: validationResult?.details || null,
        feedback: validationResult?.feedback || "Quiz completed",
        createdAt: existing ? existing.createdAt : new Date(),
        updatedAt: new Date()
      };
      
      let savedId;
      if (existing && allowResubmit) {
        await db.collection("quiz_results").updateOne(
          { _id: existing._id },
          { $set: quizData }
        );
        savedId = existing._id;
      } else if (!existing) {
        const insertResult = await db.collection("quiz_results").insertOne(quizData);
        savedId = insertResult.insertedId;
      } else {
        savedId = existing._id;
      }

      /* =========================
         UPDATE USER XP
      ========================= */
      let xpToAdd = xpEarned;
      if (existing && existing.xpEarned >= xpEarned && !allowResubmit) {
        xpToAdd = 0;
      } else if (existing && allowResubmit) {
        xpToAdd = Math.max(0, xpEarned - (existing.xpEarned || 0));
      }
      
      let finalTotalXP = (user.xp || 0);
      
      if (xpToAdd > 0) {
        await db.collection("users").updateOne(
          { _id: user._id },
          {
            $inc: {
              xp: xpToAdd,
              totalScore: finalScore,
              totalQuestions: Number(totalQuestions),
              totalQuizzesCompleted: existing ? 0 : 1
            },
            $set: {
              lastActive: new Date(),
              lastCourse: course,
              lastTopicIndex: topicIndex
            },
            $push: {
              quizHistory: {
                course,
                topicIndex,
                score: finalScore,
                percent: finalPercent,
                xpEarned: xpToAdd,
                timestamp: new Date()
              }
            }
          }
        );
        finalTotalXP = (user.xp || 0) + xpToAdd;
      }

      const levelInfo = await updateUserLevel(db, user._id);

      /* =========================
         RESPONSE WITH VALIDATION FEEDBACK
      ========================= */
      return res.json({
        success: true,
        message: existing ? "Quiz updated successfully" : "Quiz saved successfully",
        xpAdded: xpToAdd > 0,
        xpEarned: xpToAdd,
        totalXP: finalTotalXP,
        grade: {
          score: finalScore,
          total: totalQuestions,
          percent: finalPercent,
          letterGrade: gradeInfo?.letterGrade || "C",
          passed: gradeInfo?.passed || finalPercent >= 70,
          feedback: validationResult?.feedback || "Quiz completed"
        },
        levelInfo: levelInfo,
        validation: validationResult ? {
          score: validationResult.score,
          feedback: validationResult.feedback,
          details: validationResult.details
        } : null,
        quizData: {
          id: savedId?.toString() || null,
          isRetry: !!existing,
          retryCount: existing ? (existing.retryCount || 0) + 1 : 0
        }
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (err) {
    console.error("❌ QUIZ API ERROR:", err);

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : "Internal server error"
    });
  }
}