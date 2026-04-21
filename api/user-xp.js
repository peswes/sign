import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

/* =========================
   DB CACHE (FAST ON VERCEL)
========================= */
let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;

  const client = new MongoClient(uri);
  await client.connect();

  cachedDb = client.db("lms");

  console.log("✅ MongoDB Connected");

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

    /* =========================
       SAFE USER EXTRACTION
    ========================= */
    const userId =
      decoded?.user?.id ||
      decoded?.id ||
      decoded?._id;

    const email =
      decoded?.user?.email ||
      decoded?.email;

    if (!userId && !email) {
      return res.status(400).json({
        error: "Invalid token structure"
      });
    }

    const db = await connectDB();

    /* =========================
       BUILD QUERY (VERY IMPORTANT FIX)
    ========================= */
    let query = null;

    // Case 1: valid ObjectId
    if (userId && ObjectId.isValid(userId)) {
      query = { _id: new ObjectId(userId) };
    }

    // Case 2: fallback email
    if (!query && email) {
      query = { email: email.toLowerCase().trim() };
    }

    if (!query) {
      return res.status(400).json({
        error: "Cannot build user query"
      });
    }

    console.log("🔎 FINAL QUERY:", query);

    /* =========================
       FETCH USER
    ========================= */
    const user = await db.collection("users").findOne(query);

    if (!user) {
      console.log("❌ USER NOT FOUND:", query);

      return res.status(404).json({
        error: "User not found",
        debug: {
          query,
          decoded
        }
      });
    }

    console.log("✅ USER FOUND:", user.email);

    /* =========================
       RESPONSE
    ========================= */
    const xp = user.xp || 0;

    return res.status(200).json({
      xp,
      totalScore: user.totalScore || 0,
      level: Math.floor(xp / 250) + 1,
      lastActive: user.lastActive || null
    });

  } catch (err) {
    console.error("❌ XP API ERROR:", err);

    return res.status(500).json({
      error: "Failed to fetch XP",
      message: err.message
    });
  }
}