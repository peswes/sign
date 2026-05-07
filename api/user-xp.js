import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

/* =========================
   DB CACHE (Vercel OPTIMIZED)
========================= */
let cachedClient = null;
let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  const client = new MongoClient(uri);
  await client.connect();

  cachedClient = client;
  cachedDb = client.db("test"); // ✅ IMPORTANT: your real DB

  console.log("✅ Connected to DB: test");

  return cachedDb;
}

/* =========================
   CORS
========================= */
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

/* =========================
   HELPER: Calculate level from XP
========================= */
function calculateLevel(xp) {
  // Level 1: 0 XP, Level 2: 250 XP, Level 3: 600 XP, etc.
  // Formula: level = floor(sqrt(xp / 50)) + 1
  if (!xp || xp < 0) return 1;
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

/* =========================
   HELPER: Calculate XP needed for next level
========================= */
function xpToNextLevel(currentXP, currentLevel) {
  const nextLevelXP = 50 * Math.pow(currentLevel, 2);
  return Math.max(0, nextLevelXP - currentXP);
}

/* =========================
   HELPER: Update user XP in database
========================= */
async function updateUserXP(db, userId, xpToAdd, course, topicIndex, score) {
  const userCollection = db.collection("users");
  const progressCollection = db.collection("user_progress");
  
  // Find current user
  const user = await userCollection.findOne({ _id: new ObjectId(userId) });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  const currentXP = user.xp || 0;
  const newXP = currentXP + xpToAdd;
  const newLevel = calculateLevel(newXP);
  const oldLevel = user.level || 1;
  
  // Update user XP and level
  await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    { 
      $set: { 
        xp: newXP, 
        level: newLevel,
        totalScore: (user.totalScore || 0) + (score || 0),
        lastActive: new Date()
      },
      $inc: { assignmentsCompleted: 1 }
    }
  );
  
  // Record progress for this topic
  await progressCollection.updateOne(
    { 
      userId: new ObjectId(userId), 
      course: course,
      topicIndex: topicIndex
    },
    {
      $set: {
        completed: true,
        score: score || 0,
        xpEarned: xpToAdd,
        completedAt: new Date()
      }
    },
    { upsert: true }
  );
  
  return {
    xpGained: xpToAdd,
    totalXP: newXP,
    oldLevel,
    newLevel,
    leveledUp: newLevel > oldLevel,
    xpToNextLevel: xpToNextLevel(newXP, newLevel)
  };
}

/* =========================
   HANDLER
========================= */
export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    /* =========================
       AUTH TOKEN
    ========================= */
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ error: "Invalid or expired token", details: jwtError.message });
    }

    console.log("🔐 JWT DECODED:", decoded);

    const userId = decoded?.user?.id || decoded?.id || decoded?.userId;
    const email = decoded?.user?.email || decoded?.email;

    if (!userId && !email) {
      return res.status(400).json({
        error: "Invalid token (no user id/email)"
      });
    }

    /* =========================
       CONNECT DB
    ========================= */
    const db = await connectDB();

    let userData = null;
    let userQuery = null;

    /* =========================
       HANDLE POST REQUEST (ADD XP)
    ========================= */
    if (req.method === "POST") {
      const { xpToAdd, course, topicIndex, score } = req.body;
      
      if (!xpToAdd || xpToAdd <= 0) {
        return res.status(400).json({ error: "Invalid XP amount to add" });
      }
      
      if (!course || topicIndex === undefined) {
        return res.status(400).json({ error: "Missing course or topic information" });
      }
      
      // Find user by ID or email
      if (userId && ObjectId.isValid(userId)) {
        userQuery = { _id: new ObjectId(userId) };
      } else if (email) {
        userQuery = { email: email.toLowerCase().trim() };
      }
      
      if (!userQuery) {
        return res.status(400).json({ error: "Cannot identify user" });
      }
      
      const user = await db.collection("users").findOne(userQuery);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if this topic was already completed
      const existingProgress = await db.collection("user_progress").findOne({
        userId: user._id,
        course: course,
        topicIndex: topicIndex,
        completed: true
      });
      
      if (existingProgress) {
        return res.status(400).json({ 
          error: "Topic already completed", 
          message: "You have already earned XP for this topic",
          alreadyCompleted: true
        });
      }
      
      // Update XP
      const xpUpdateResult = await updateUserXP(db, user._id.toString(), xpToAdd, course, topicIndex, score);
      
      return res.status(200).json({
        success: true,
        ...xpUpdateResult
      });
    }
    
    /* =========================
       HANDLE GET REQUEST (FETCH XP)
    ========================= */
    if (req.method === "GET") {
      // Try ObjectId first
      if (userId && ObjectId.isValid(userId)) {
        console.log("🔎 Searching by ID:", userId);
        userData = await db.collection("users").findOne({
          _id: new ObjectId(userId)
        });
      }

      // Fallback to email
      if (!userData && email) {
        console.log("🔎 Searching by email:", email);
        userData = await db.collection("users").findOne({
          email: email.toLowerCase().trim()
        });
      }

      // If still not found, try to find by userId string (might be stored as string)
      if (!userData && userId) {
        console.log("🔎 Searching by userId string:", userId);
        userData = await db.collection("users").findOne({
          userId: userId
        });
      }

      /* =========================
         NOT FOUND
      ========================= */
      if (!userData) {
        console.log("❌ USER NOT FOUND:", { userId, email });

        return res.status(404).json({
          error: "User not found",
          debug: { userId, email }
        });
      }

      // Get completed assignments count
      const completedAssignments = await db.collection("user_progress").countDocuments({
        userId: userData._id,
        completed: true
      });
      
      // Get total XP from all completed assignments
      const progressAggregation = await db.collection("user_progress").aggregate([
        { $match: { userId: userData._id, completed: true } },
        { $group: { _id: null, totalXPEarned: { $sum: "$xpEarned" } } }
      ]).toArray();
      
      const totalXPEarnedFromAssignments = progressAggregation[0]?.totalXPEarned || 0;
      
      // Calculate rank based on XP compared to all users
      const userRank = await db.collection("users").countDocuments({
        xp: { $gt: (userData.xp || 0) }
      }) + 1;
      
      const totalUsers = await db.collection("users").countDocuments();
      
      /* =========================
         SUCCESS RESPONSE
      ========================= */
      return res.status(200).json({
        success: true,
        xp: userData.xp || 0,
        totalScore: userData.totalScore || 0,
        level: userData.level || calculateLevel(userData.xp || 0),
        lastActive: userData.lastActive || null,
        course: userData.course || null,
        assignmentsCompleted: completedAssignments,
        totalXPEarned: totalXPEarnedFromAssignments,
        rank: userRank,
        totalUsers: totalUsers,
        xpToNextLevel: xpToNextLevel(userData.xp || 0, userData.level || calculateLevel(userData.xp || 0)),
        achievements: userData.achievements || [],
        streak: userData.streak || 0,
        joinedAt: userData.createdAt || userData.joinedAt || null
      });
    }
    
    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error("❌ XP API ERROR:", err);

    return res.status(500).json({
      error: "Failed to fetch/update XP",
      details: err.message
    });
  }
}

/* =========================
   HELPER FUNCTIONS FOR FRONTEND (can be used by clients)
========================= */

// Function to calculate XP reward based on assignment quality
export function calculateXPReward(score, maxScore = 100, baseXP = 50) {
  // Score is percentage (0-100)
  const percentage = Math.min(100, Math.max(0, score));
  // XP scales with quality: 0-100% = 0-150 XP
  const xpEarned = Math.floor((percentage / 100) * baseXP * 1.5);
  return Math.max(5, xpEarned);
}

// Function to calculate level from XP (same as above but exported)
export function getLevelFromXP(xp) {
  if (!xp || xp < 0) return 1;
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

// Function to calculate progress to next level (0-100)
export function getLevelProgress(xp) {
  const currentLevel = getLevelFromXP(xp);
  const currentLevelXP = 50 * Math.pow(currentLevel - 1, 2);
  const nextLevelXP = 50 * Math.pow(currentLevel, 2);
  const xpInCurrentLevel = xp - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  
  if (xpNeededForLevel <= 0) return 100;
  return Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForLevel) * 100));
}

// Function to get achievement badges based on XP and assignments
export function getAchievements(xp, assignmentsCompleted, streak) {
  const achievements = [];
  
  if (xp >= 100) achievements.push({ id: "xp_100", name: "Century Club", description: "Earned 100 XP", icon: "🏆" });
  if (xp >= 500) achievements.push({ id: "xp_500", name: "Half Thousand", description: "Earned 500 XP", icon: "⭐" });
  if (xp >= 1000) achievements.push({ id: "xp_1000", name: "XP Master", description: "Earned 1000 XP", icon: "👑" });
  if (xp >= 2500) achievements.push({ id: "xp_2500", name: "Legendary", description: "Earned 2500 XP", icon: "💎" });
  
  if (assignmentsCompleted >= 5) achievements.push({ id: "assign_5", name: "On a Roll", description: "Completed 5 assignments", icon: "🎯" });
  if (assignmentsCompleted >= 12) achievements.push({ id: "assign_12", name: "Course Master", description: "Completed all assignments", icon: "🎓" });
  
  if (streak >= 7) achievements.push({ id: "streak_7", name: "Weekly Warrior", description: "7 day streak", icon: "🔥" });
  if (streak >= 30) achievements.push({ id: "streak_30", name: "Monthly Master", description: "30 day streak", icon: "🌙" });
  
  return achievements;
}