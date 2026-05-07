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
  cachedDb = client.db("test");

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
   HELPER: Update user data
========================= */
async function updateUserQuizScore(db, userId, quizPercentage, course, topicIndex, score) {
  const userCollection = db.collection("users");
  const progressCollection = db.collection("user_progress");
  
  const user = await userCollection.findOne({ _id: new ObjectId(userId) });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Get current quiz percentage (0-100)
  let currentQuizPercentage = user.quizPercentage || 0;
  
  // Update quiz percentage (store as number between 0-100)
  let newQuizPercentage = Math.min(100, Math.max(0, quizPercentage));
  
  // Update user
  await userCollection.updateOne(
    { _id: new ObjectId(userId) },
    { 
      $set: { 
        quizPercentage: newQuizPercentage,
        lastActive: new Date()
      }
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
        quizPercentage: newQuizPercentage,
        completedAt: new Date()
      }
    },
    { upsert: true }
  );
  
  return {
    quizPercentage: newQuizPercentage,
    previousQuizPercentage: currentQuizPercentage
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

    const userId = decoded?.user?.id || decoded?.id || decoded?.userId;
    const email = decoded?.user?.email || decoded?.email;

    if (!userId && !email) {
      return res.status(400).json({ error: "Invalid token (no user id/email)" });
    }

    const db = await connectDB();
    let userData = null;

    /* =========================
       HANDLE POST REQUEST (UPDATE QUIZ PERCENTAGE)
    ========================= */
    if (req.method === "POST") {
      const { quizPercentage, course, topicIndex, score } = req.body;
      
      if (quizPercentage === undefined || quizPercentage === null) {
        return res.status(400).json({ error: "quizPercentage is required" });
      }
      
      if (!course || topicIndex === undefined) {
        return res.status(400).json({ error: "Missing course or topic information" });
      }
      
      let userQuery = null;
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
      
      // Update quiz percentage
      const updateResult = await updateUserQuizScore(db, user._id.toString(), quizPercentage, course, topicIndex, score);
      
      return res.status(200).json({
        success: true,
        quizPercentage: updateResult.quizPercentage,
        previousQuizPercentage: updateResult.previousQuizPercentage,
        message: `Quiz score updated to ${updateResult.quizPercentage}%`
      });
    }
    
    /* =========================
       HANDLE GET REQUEST (FETCH QUIZ PERCENTAGE)
    ========================= */
    if (req.method === "GET") {
      if (userId && ObjectId.isValid(userId)) {
        userData = await db.collection("users").findOne({ _id: new ObjectId(userId) });
      }

      if (!userData && email) {
        userData = await db.collection("users").findOne({ email: email.toLowerCase().trim() });
      }

      if (!userData && userId) {
        userData = await db.collection("users").findOne({ userId: userId });
      }

      if (!userData) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get quiz percentage (0-100)
      const quizPercentage = userData.quizPercentage || 0;
      
      // Determine rank/title based on quiz percentage
      let quizTitle = "Beginner 🌱";
      if (quizPercentage === 100) {
        quizTitle = "Perfect 💯🏆";
      } else if (quizPercentage >= 90) {
        quizTitle = "Expert 📚✨";
      } else if (quizPercentage >= 80) {
        quizTitle = "Advanced 🚀";
      } else if (quizPercentage >= 70) {
        quizTitle = "Pro 💪";
      } else if (quizPercentage >= 60) {
        quizTitle = "Intermediate 💡";
      } else if (quizPercentage >= 50) {
        quizTitle = "Growing 🌿";
      } else if (quizPercentage >= 30) {
        quizTitle = "Learning 📖";
      } else if (quizPercentage > 0) {
        quizTitle = "Beginner 🌱";
      } else {
        quizTitle = "Not Started ✨";
      }
      
      return res.status(200).json({
        success: true,
        quizPercentage: quizPercentage,
        quizTitle: quizTitle,
        xp: userData.xp || 0,
        level: userData.level || calculateLevel(userData.xp || 0),
        streak: userData.streak || 0,
        message: quizPercentage === 100 ? "🎉 Perfect score! You've mastered this!" : `Current progress: ${quizPercentage}%`
      });
    }
    
    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error("❌ API ERROR:", err);
    return res.status(500).json({
      error: "Failed to process request",
      details: err.message
    });
  }
}