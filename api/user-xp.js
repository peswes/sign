import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

let cachedClient = null;
let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db("lms"); // 🔥 CHECK THIS NAME

  cachedClient = client;
  cachedDb = db;

  return db;
}

/* =========================
   CORS
========================= */
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("🔐 JWT:", decoded);

    const userId = decoded?.user?.id || decoded?.id;
    const email = decoded?.user?.email || decoded?.email;

    const db = await connectDB();

    let userData = null;

    /* =========================
       FIX #1: Try ObjectId safely
    ========================= */
    if (userId) {
      try {
        if (ObjectId.isValid(userId)) {
          userData = await db.collection("users").findOne({
            _id: new ObjectId(userId)
          });
        }
      } catch (e) {}
    }

    /* =========================
       FIX #2: fallback to email
    ========================= */
    if (!userData && email) {
      userData = await db.collection("users").findOne({
        email: email.toLowerCase().trim()
      });
    }

    /* =========================
       FINAL CHECK
    ========================= */
    if (!userData) {
      console.log("❌ USER NOT FOUND:", { userId, email });

      return res.status(404).json({
        error: "User not found",
        debug: { userId, email }
      });
    }

    return res.json({
      xp: userData.xp || 0,
      totalScore: userData.totalScore || 0,
      level: userData.level || Math.floor((userData.xp || 0) / 250) + 1,
      lastActive: userData.lastActive || null
    });

  } catch (err) {
    console.error("XP ERROR:", err);

    return res.status(500).json({
      error: "Failed to fetch XP",
      details: err.message
    });
  }
}