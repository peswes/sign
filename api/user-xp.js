import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

/* =========================
   GLOBAL DB CACHE (Vercel optimization)
========================= */
let cachedClient = null;
let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db("lms");

  cachedClient = client;
  cachedDb = db;

  console.log("✅ MongoDB connected");

  return db;
}

/* =========================
   CORS SETUP
========================= */
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

export default async function handler(req, res) {
  setCors(res);

  /* =========================
     PRE-FLIGHT
  ========================= */
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    /* =========================
       AUTH
    ========================= */
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("🔐 JWT:", decoded);

    /* =========================
       SAFE IDENTIFIER EXTRACTION
    ========================= */
    const userId =
      decoded?.user?.id ||
      decoded?.id ||
      decoded?._id ||
      null;

    const email =
      decoded?.user?.email ||
      decoded?.email ||
      null;

    if (!userId && !email) {
      return res.status(400).json({
        error: "Invalid token: no identifier"
      });
    }

    /* =========================
       CONNECT DB
    ========================= */
    const db = await connectDB();

    /* =========================
       BUILD QUERY
    ========================= */
    let query = null;

    // Try ObjectId (SAFE)
    if (userId && ObjectId.isValid(userId)) {
      query = { _id: new ObjectId(userId) };
    }

    // fallback to email
    if (!query && email) {
      query = { email: email.toLowerCase() };
    }

    if (!query) {
      return res.status(400).json({
        error: "Cannot build query"
      });
    }

    console.log("🔎 QUERY:", query);

    /* =========================
       FETCH USER
    ========================= */
    const userData = await db.collection("users").findOne(query);

    if (!userData) {
      console.log("❌ USER NOT FOUND:", query);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ USER FOUND:", userData.email);

    /* =========================
       RESPONSE
    ========================= */
    return res.json({
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