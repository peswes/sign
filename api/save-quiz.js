import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

/* =========================
   DB CONNECTION CACHE
========================= */
let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;

  const client = new MongoClient(uri);
  await client.connect();

  cachedDb = client.db("lms");
  return cachedDb;
}

/* =========================
   CORS
========================= */
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded?.user?.id || decoded?.id || decoded?._id;
    const email = decoded?.email || decoded?.user?.email;

    if (!userId && !email) {
      return res.status(400).json({ error: "Invalid token" });
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

    const db = await connectDB();

    /* =========================
       FIND USER
    ========================= */
    const query =
      userId && ObjectId.isValid(userId)
        ? { _id: new ObjectId(userId) }
        : { email: email?.toLowerCase() };

    const user = await db.collection("users").findOne(query);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    /* =========================
       SAVE QUIZ RESULT
    ========================= */
    await db.collection("quiz_results").insertOne({
      userId: user._id,
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
       UPDATE USER XP
    ========================= */
    await db.collection("users").updateOne(
      { _id: user._id },
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

    return res.json({
      success: true,
      xpEarned
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Failed to save quiz"
    });
  }
}