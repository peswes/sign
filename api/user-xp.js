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
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

/* =========================
   HANDLER
========================= */
export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    /* =========================
       AUTH TOKEN
    ========================= */
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("🔐 JWT DECODED:", decoded);

    const userId = decoded?.user?.id || decoded?.id;
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

    /* =========================
       TRY OBJECTID FIRST
    ========================= */
    if (userId && ObjectId.isValid(userId)) {
      console.log("🔎 Searching by ID:", userId);

      userData = await db.collection("users").findOne({
        _id: new ObjectId(userId)
      });
    }

    /* =========================
       FALLBACK EMAIL
    ========================= */
    if (!userData && email) {
      console.log("🔎 Searching by email:", email);

      userData = await db.collection("users").findOne({
        email: email.toLowerCase().trim()
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

    /* =========================
       SUCCESS RESPONSE
    ========================= */
    return res.status(200).json({
      xp: userData.xp || 0,
      totalScore: userData.totalScore || 0,
      level: userData.level || Math.floor((userData.xp || 0) / 250) + 1,
      lastActive: userData.lastActive || null
    });

  } catch (err) {
    console.error("❌ XP API ERROR:", err);

    return res.status(500).json({
      error: "Failed to fetch XP",
      details: err.message
    });
  }
}