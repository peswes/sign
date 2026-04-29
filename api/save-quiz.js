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
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

/* =========================
   ASSIGNMENT VALIDATION ENGINE
   Enhanced for code, reflections, and follow-ups
========================= */
function validateAssignment(code, reflections, followups, course, topicIndex) {
  // Course-specific assignment validation rules
  const assignmentRules = {
    "frontend-development": {
      0: { // HTML Fundamentals
        codeKeywords: ["semantic", "header", "nav", "main", "article", "section", "footer", "html", "DOCTYPE"],
        minCodeLength: 100,
        reflectionMinWords: 20,
        followupMinWords: 15,
        requiredConcepts: ["semantic HTML", "document structure", "accessibility"]
      },
      1: { // CSS Styling
        codeKeywords: ["flexbox", "grid", "responsive", "media query", "@media", "display", "css", "margin", "padding"],
        minCodeLength: 100,
        reflectionMinWords: 20,
        followupMinWords: 15,
        requiredConcepts: ["flexbox", "CSS Grid", "responsive design"]
      },
      2: { // JavaScript Basics
        codeKeywords: ["function", "variable", "eventListener", "DOM", "addEventListener", "javascript", "let", "const"],
        minCodeLength: 100,
        reflectionMinWords: 20,
        followupMinWords: 15,
        requiredConcepts: ["functions", "variables", "event handling", "DOM manipulation"]
      }
    },
    "game-development": {
      0: { // Game Loop
        codeKeywords: ["requestAnimationFrame", "update", "render", "deltaTime", "game loop", "animation", "context"],
        minCodeLength: 120,
        reflectionMinWords: 25,
        followupMinWords: 20,
        requiredConcepts: ["animation frame", "update logic", "render loop"]
      },
      1: { // Input Handling
        codeKeywords: ["addEventListener", "keydown", "keyup", "mousemove", "input", "controls", "keyboard", "preventDefault"],
        minCodeLength: 100,
        reflectionMinWords: 20,
        followupMinWords: 15,
        requiredConcepts: ["event listeners", "keyboard input", "mouse input"]
      },
      2: { // Sprite Animation
        codeKeywords: ["sprite", "animation", "frame", "canvas", "drawImage", "animate", "requestAnimationFrame"],
        minCodeLength: 120,
        reflectionMinWords: 25,
        followupMinWords: 20,
        requiredConcepts: ["sprite sheets", "animation frames", "canvas drawing"]
      },
      3: { // Collision Detection
        codeKeywords: ["collision", "detect", "AABB", "bounding", "hit", "overlap", "intersect", "rectangle"],
        minCodeLength: 100,
        reflectionMinWords: 20,
        followupMinWords: 15,
        requiredConcepts: ["collision detection", "bounding boxes", "hit detection"]
      }
    },
    "backend-development": {
      0: { // Server Architecture
        codeKeywords: ["express", "server", "route", "api", "endpoint", "listen", "app.get", "app.post"],
        minCodeLength: 120,
        reflectionMinWords: 25,
        followupMinWords: 20,
        requiredConcepts: ["express server", "API routes", "HTTP methods"]
      },
      1: { // Node.js Event Loop
        codeKeywords: ["async", "await", "promise", "callback", "event loop", "non-blocking", "setTimeout"],
        minCodeLength: 100,
        reflectionMinWords: 20,
        followupMinWords: 15,
        requiredConcepts: ["asynchronous", "event loop", "callbacks"]
      },
      2: { // Express API
        codeKeywords: ["express", "app.get", "app.post", "middleware", "route", "json", "req", "res"],
        minCodeLength: 120,
        reflectionMinWords: 25,
        followupMinWords: 20,
        requiredConcepts: ["express routes", "middleware", "REST API"]
      }
    }
  };

  const rules = assignmentRules[course]?.[topicIndex];
  
  if (!rules) {
    // Default validation for unknown topics
    const codeScore = Math.min(100, 30 + Math.min(70, Math.floor(code?.length / 3) || 0));
    const reflectionScore = Math.min(100, (reflections?.reduce((sum, r) => sum + (r?.length || 0), 0) / 10) || 0);
    const followupScore = Math.min(100, (followups?.reduce((sum, f) => sum + (f?.length || 0), 0) / 10) || 0);
    const totalScore = Math.floor((codeScore + reflectionScore + followupScore) / 3);
    
    return {
      score: totalScore,
      percent: totalScore,
      passed: totalScore >= 70,
      feedback: "Assignment submitted successfully!",
      details: { codeScore, reflectionScore, followupScore }
    };
  }

  let totalPoints = 0;
  let maxPoints = 0;
  let feedback = [];

  // 1. CODE VALIDATION (40% of total)
  const codeText = (code || "").toLowerCase();
  const codeLength = codeText.length;
  
  // Code keywords check (20%)
  const keywordMatches = rules.codeKeywords.filter(keyword => 
    codeText.includes(keyword.toLowerCase())
  );
  const keywordScore = (keywordMatches.length / rules.codeKeywords.length) * 20;
  totalPoints += keywordScore;
  maxPoints += 20;
  
  // Code length quality (20%)
  let lengthScore = 0;
  if (codeLength >= rules.minCodeLength) {
    lengthScore = 20;
    feedback.push(`✓ Excellent code length (${codeLength} chars)`);
  } else if (codeLength >= rules.minCodeLength * 0.7) {
    lengthScore = 12;
    feedback.push(`⚠️ Good but could be more detailed (${codeLength}/${rules.minCodeLength} chars)`);
  } else {
    feedback.push(`✗ Code too short (${codeLength}/${rules.minCodeLength} chars needed)`);
  }
  totalPoints += lengthScore;
  maxPoints += 20;

  // 2. REFLECTION VALIDATION (30% of total)
  let reflectionScore = 0;
  let reflectionText = "";
  if (reflections && reflections.length > 0) {
    reflectionText = reflections.join(" ").toLowerCase();
    const reflectionWordCount = reflectionText.split(/\s+/).filter(w => w.length).length;
    
    // Reflection depth (15%)
    const hasDepth = reflectionWordCount >= rules.reflectionMinWords;
    reflectionScore += hasDepth ? 15 : (reflectionWordCount >= rules.reflectionMinWords * 0.5 ? 8 : 0);
    
    // Reflection quality - check for meaningful content (15%)
    const hasQuality = reflectionWordCount > 50 && 
      (reflectionText.includes("learn") || reflectionText.includes("understand") || 
       reflectionText.includes("challenge") || reflectionText.includes("solve"));
    reflectionScore += hasQuality ? 15 : (reflectionWordCount > 25 ? 8 : 0);
    
    totalPoints += reflectionScore;
    maxPoints += 30;
    
    if (reflectionWordCount >= rules.reflectionMinWords) {
      feedback.push(`✓ Quality reflections (${reflectionWordCount} words)`);
    } else {
      feedback.push(`✗ Reflections need more depth (${reflectionWordCount}/${rules.reflectionMinWords} words)`);
    }
  } else {
    feedback.push("✗ Missing reflection answers");
  }

  // 3. FOLLOW-UP VALIDATION (30% of total)
  let followupScore = 0;
  let followupText = "";
  if (followups && followups.length > 0) {
    followupText = followups.join(" ").toLowerCase();
    const followupWordCount = followupText.split(/\s+/).filter(w => w.length).length;
    
    // Follow-up completeness (15%)
    const hasComplete = followupWordCount >= rules.followupMinWords;
    followupScore += hasComplete ? 15 : (followupWordCount >= rules.followupMinWords * 0.5 ? 8 : 0);
    
    // Follow-up quality (15%)
    const hasQuality = followupWordCount > 40 && 
      (followupText.includes("improve") || followupText.includes("feature") || 
       followupText.includes("future") || followupText.includes("enhance"));
    followupScore += hasQuality ? 15 : (followupWordCount > 20 ? 8 : 0);
    
    totalPoints += followupScore;
    maxPoints += 30;
    
    if (followupWordCount >= rules.followupMinWords) {
      feedback.push(`✓ Good follow-up responses (${followupWordCount} words)`);
    } else {
      feedback.push(`✗ Follow-ups need more detail (${followupWordCount}/${rules.followupMinWords} words)`);
    }
  } else {
    feedback.push("✗ Missing follow-up answers");
  }

  // Calculate final percentage
  let percentage = (totalPoints / maxPoints) * 100;
  percentage = Math.min(percentage, 100);
  
  // Add bonus for exceptional work
  let bonusPoints = 0;
  if (percentage >= 85 && codeLength > rules.minCodeLength * 1.5) {
    bonusPoints = 8;
    feedback.push("🌟 Outstanding work! +8% bonus");
  } else if (percentage >= 70 && codeLength > rules.minCodeLength) {
    bonusPoints = 5;
    feedback.push("👍 Great effort! +5% bonus");
  }
  
  let finalPercentage = Math.min(percentage + bonusPoints, 100);
  
  // Determine letter grade
  let letterGrade = "F";
  if (finalPercentage >= 90) letterGrade = "A+";
  else if (finalPercentage >= 85) letterGrade = "A";
  else if (finalPercentage >= 80) letterGrade = "A-";
  else if (finalPercentage >= 75) letterGrade = "B+";
  else if (finalPercentage >= 70) letterGrade = "B";
  else if (finalPercentage >= 65) letterGrade = "B-";
  else if (finalPercentage >= 60) letterGrade = "C";
  else if (finalPercentage >= 50) letterGrade = "D";

  return {
    score: Math.round(finalPercentage),
    percent: Math.round(finalPercentage),
    letterGrade,
    passed: finalPercentage >= 70,
    feedback: feedback.join(". "),
    details: {
      codeScore: lengthScore + keywordScore,
      reflectionScore: reflectionScore,
      followupScore: followupScore,
      codeLength,
      reflectionWordCount: reflectionText.split(/\s+/).filter(w => w.length).length || 0,
      followupWordCount: followupText.split(/\s+/).filter(w => w.length).length || 0
    }
  };
}

/* =========================
   XP CALCULATION FOR ASSIGNMENTS - ENHANCED
========================= */
function calculateAssignmentXP(score, percent, assignmentQuality = 0, isFirstAttempt = false, bonusMultiplier = 1) {
  let xpEarned = 0;
  
  // Base XP based on percentage (max 100 XP)
  let baseXPMultiplier = 1;
  if (percent >= 95) baseXPMultiplier = 1.5;
  else if (percent >= 90) baseXPMultiplier = 1.3;
  else if (percent >= 85) baseXPMultiplier = 1.2;
  else if (percent >= 80) baseXPMultiplier = 1.1;
  
  const baseXP = Math.floor((percent / 100) * 100 * baseXPMultiplier);
  xpEarned += baseXP;
  
  // Passing bonus (70% or higher)
  if (percent >= 70) {
    xpEarned += 25;
  }
  
  // Excellence bonus (85% or higher)
  if (percent >= 85) {
    xpEarned += 35;
  }
  
  // Perfect score bonus (100%)
  if (percent >= 98) {
    xpEarned += 50;
  }
  
  // First attempt bonus
  if (isFirstAttempt) {
    xpEarned += 20;
  }
  
  // Quality bonus for exceptional submissions
  if (assignmentQuality >= 90) {
    xpEarned += 30;
  } else if (assignmentQuality >= 85) {
    xpEarned += 20;
  } else if (assignmentQuality >= 80) {
    xpEarned += 10;
  }
  
  // Streak bonus (applied later in main handler)
  if (bonusMultiplier > 1) {
    xpEarned = Math.floor(xpEarned * bonusMultiplier);
  }
  
  // Cap at 250 XP per assignment
  return Math.min(xpEarned, 250);
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
          xpForNextLevel: xpForNextLevel,
          lastLevelUp: new Date()
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
   GET USER STREAK
========================= */
async function getUserStreak(db, userId) {
  const user = await db.collection("users").findOne({ _id: userId });
  if (!user) return 0;
  
  const streak = user.streak || 0;
  const lastSubmission = user.lastSubmissionDate;
  
  if (!lastSubmission) return 0;
  
  const today = new Date();
  const lastDate = new Date(lastSubmission);
  const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    // Consecutive day
    return streak;
  } else if (diffDays === 0) {
    // Same day, keep streak
    return streak;
  } else {
    // Streak broken
    return 0;
  }
}

/* =========================
   UPDATE STREAK
========================= */
async function updateStreak(db, userId) {
  const user = await db.collection("users").findOne({ _id: userId });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let newStreak = 1;
  let streakBonus = 1;
  
  if (user.lastSubmissionDate) {
    const lastDate = new Date(user.lastSubmissionDate);
    lastDate.setHours(0, 0, 0, 0);
    const diffDays = (today - lastDate) / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      newStreak = (user.streak || 0) + 1;
    } else if (diffDays === 0) {
      newStreak = user.streak || 1;
    } else {
      newStreak = 1;
    }
  }
  
  // Calculate streak bonus multiplier (max 2.0x at 30 days)
  streakBonus = Math.min(2.0, 1 + (newStreak / 30));
  
  await db.collection("users").updateOne(
    { _id: userId },
    {
      $set: {
        streak: newStreak,
        lastSubmissionDate: today,
        streakBonusMultiplier: streakBonus
      }
    }
  );
  
  return { streak: newStreak, multiplier: streakBonus };
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
       GET REQUESTS - Check assignment status
    ========================= */
    if (req.method === "GET") {
      const { mode, course, topic } = req.query;

      if (mode === "status" && course && topic !== undefined) {
        const existing = await db.collection("assignments").findOne({
          userId: user._id,
          course: course,
          topicIndex: Number(topic)
        });

        const percent = existing?.percent || 0;
        const cappedPercent = Math.min(percent, 100);

        return res.json({
          success: true,
          completed: !!existing,
          score: existing?.score || 0,
          percent: cappedPercent,
          xpEarned: existing?.xpEarned || 0,
          grade: existing?.grade || null,
          completedAt: existing?.completedAt || null,
          submissionCount: existing?.submissionCount || 0
        });
      }

      // Get all assignments for analytics
      const assignments = await db.collection("assignments")
        .find({ userId: user._id })
        .sort({ completedAt: -1 })
        .toArray();

      const totalAssignments = assignments.length;
      const completedAssignments = assignments.filter(a => a.status === "completed").length;
      const totalScore = assignments.reduce((sum, a) => sum + (a.score || 0), 0);
      const totalXP = assignments.reduce((sum, a) => sum + (a.xpEarned || 0), 0);
      
      const levelInfo = await updateUserLevel(db, user._id);
      const streakInfo = await getUserStreak(db, user._id);

      return res.json({
        success: true,
        totalAssignments,
        completedAssignments,
        totalScore: assignments.length > 0 ? Math.round(totalScore / assignments.length) : 0,
        totalXP,
        levelInfo,
        streak: streakInfo,
        recentAssignments: assignments.slice(0, 10).map(a => ({
          ...a,
          percent: Math.min(a.percent || 0, 100)
        }))
      });
    }

    /* =========================
       POST - SAVE ASSIGNMENT WITH VALIDATION AND XP
    ========================= */
    if (req.method === "POST") {
      const {
        course,
        topicIndex,
        code = "",
        reflections = [],
        followUpAnswers = [],
        status = "completed",
        allowResubmit = false,
        score: providedScore,
        percent: providedPercent,
        xpEarned: providedXpEarned
      } = req.body;

      // Validate required fields
      if (!course || topicIndex === undefined) {
        return res.status(400).json({
          success: false,
          message: "Missing course or topicIndex"
        });
      }

      // Check for existing assignment submission
      const existing = await db.collection("assignments").findOne({
        userId: user._id,
        course: course,
        topicIndex: Number(topicIndex)
      });

      if (existing && !allowResubmit) {
        return res.status(403).json({
          success: false,
          message: "Assignment already submitted. XP already awarded for this topic.",
          existingScore: Math.min(existing.percent, 100),
          existingXP: existing.xpEarned,
          completedAt: existing.completedAt
        });
      }

      /* =========================
         VALIDATE ASSIGNMENT
      ========================= */
      let validationResult;
      let finalScore, finalPercent, gradeInfo;
      
      if (providedScore !== undefined && providedPercent !== undefined) {
        // Use provided scores from frontend
        finalScore = providedScore;
        finalPercent = Math.min(providedPercent, 100);
        gradeInfo = {
          letterGrade: finalPercent >= 90 ? "A+" : finalPercent >= 85 ? "A" : finalPercent >= 80 ? "A-" : finalPercent >= 75 ? "B+" : finalPercent >= 70 ? "B" : finalPercent >= 65 ? "B-" : finalPercent >= 60 ? "C" : "D",
          passed: finalPercent >= 70
        };
        validationResult = {
          feedback: "Assignment submitted successfully!",
          details: { source: "frontend" }
        };
      } else {
        // Validate the assignment
        validationResult = validateAssignment(
          code, 
          reflections, 
          followUpAnswers, 
          course, 
          Number(topicIndex)
        );
        
        finalScore = validationResult.score;
        finalPercent = validationResult.percent;
        gradeInfo = {
          letterGrade: validationResult.letterGrade,
          passed: validationResult.passed
        };
      }

      // Get streak bonus
      const streakData = await updateStreak(db, user._id);
      const streakBonus = streakData.multiplier;
      
      // Calculate XP earned
      let xpEarned = providedXpEarned;
      if (xpEarned === undefined) {
        const isFirstAttempt = !existing;
        const assignmentQuality = finalPercent;
        xpEarned = calculateAssignmentXP(finalScore, finalPercent, assignmentQuality, isFirstAttempt, streakBonus);
      }

      /* =========================
         SAVE ASSIGNMENT RESULT
      ========================= */
      const assignmentData = {
        userId: user._id,
        course: course,
        topicIndex: Number(topicIndex),
        code: code,
        reflections: reflections || [],
        followUpAnswers: followUpAnswers || [],
        score: finalScore,
        percent: finalPercent,
        xpEarned: xpEarned,
        grade: gradeInfo.letterGrade,
        passed: gradeInfo.passed,
        status: status,
        validationDetails: validationResult.details || null,
        feedback: validationResult.feedback,
        submissionCount: existing ? (existing.submissionCount || 0) + 1 : 1,
        isRetry: !!existing,
        streakBonus: streakBonus,
        completedAt: new Date(),
        updatedAt: new Date()
      };
      
      let savedId;
      if (existing && allowResubmit) {
        // Update existing assignment
        await db.collection("assignments").updateOne(
          { _id: existing._id },
          { $set: assignmentData }
        );
        savedId = existing._id;
      } else if (!existing) {
        // Create new assignment record
        const insertResult = await db.collection("assignments").insertOne(assignmentData);
        savedId = insertResult.insertedId;
      } else {
        savedId = existing._id;
      }

      /* =========================
         UPDATE USER XP (only add if new XP > existing)
      ========================= */
      let xpToAdd = xpEarned;
      if (existing && existing.xpEarned >= xpEarned && !allowResubmit) {
        xpToAdd = 0;
      } else if (existing && allowResubmit) {
        xpToAdd = Math.max(0, xpEarned - (existing.xpEarned || 0));
      }
      
      let finalTotalXP = (user.xp || 0);
      
      // Additional bonuses for milestones
      let milestoneBonus = 0;
      let milestoneMessage = null;
      
      if (xpToAdd > 0) {
        const newTotalXP = (user.xp || 0) + xpToAdd;
        const oldLevel = Math.floor((user.xp || 0) / 100) + 1;
        const newLevel = Math.floor(newTotalXP / 100) + 1;
        
        // Level up bonus
        if (newLevel > oldLevel) {
          milestoneBonus = 50 * (newLevel - oldLevel);
          xpToAdd += milestoneBonus;
          milestoneMessage = `Level up! +${milestoneBonus} bonus XP!`;
        }
        
        // Check for streak milestones
        if (streakData.streak === 7) {
          const streakMilestoneBonus = 100;
          xpToAdd += streakMilestoneBonus;
          milestoneMessage = `🔥 7-day streak! +${streakMilestoneBonus} bonus XP!`;
        } else if (streakData.streak === 30) {
          const streakMilestoneBonus = 500;
          xpToAdd += streakMilestoneBonus;
          milestoneMessage = `🏆 30-day streak master! +${streakMilestoneBonus} bonus XP!`;
        }
        
        await db.collection("users").updateOne(
          { _id: user._id },
          {
            $inc: {
              xp: xpToAdd,
              totalAssignmentsCompleted: existing ? 0 : 1,
              totalAssignmentScore: finalScore,
              totalXPEarned: xpToAdd
            },
            $set: {
              lastActive: new Date(),
              lastCourse: course,
              lastTopicIndex: topicIndex,
              streak: streakData.streak,
              lastSubmissionDate: new Date()
            },
            $push: {
              assignmentHistory: {
                course,
                topicIndex,
                score: finalScore,
                percent: finalPercent,
                xpEarned: xpToAdd,
                streakBonus: streakBonus,
                milestoneBonus: milestoneBonus,
                completedAt: new Date()
              }
            }
          }
        );
        finalTotalXP = (user.xp || 0) + xpToAdd;
      }

      // Update user level
      const levelInfo = await updateUserLevel(db, user._id);

      /* =========================
         RESPONSE WITH VALIDATION FEEDBACK
      ========================= */
      return res.json({
        success: true,
        message: existing ? "Assignment updated successfully" : "Assignment completed successfully!",
        xpAdded: xpToAdd > 0,
        xpEarned: xpToAdd,
        totalXP: finalTotalXP,
        streakBonus: streakBonus,
        streak: streakData.streak,
        milestoneBonus: milestoneBonus,
        milestoneMessage: milestoneMessage,
        assignment: {
          score: finalScore,
          percent: finalPercent,
          letterGrade: gradeInfo.letterGrade,
          passed: gradeInfo.passed,
          feedback: validationResult.feedback
        },
        levelInfo: levelInfo,
        validationDetails: validationResult.details,
        assignmentId: savedId?.toString(),
        submissionCount: existing ? (existing.submissionCount || 0) + 1 : 1,
        isRetry: !!existing
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  } catch (err) {
    console.error("❌ ASSIGNMENT API ERROR:", err);

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