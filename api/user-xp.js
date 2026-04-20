import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

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
     PRE-FLIGHT REQUEST
  ========================= */
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let client;

  try {
    /* =========================
       AUTH
    ========================= */
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("JWT USER FULL:", decoded);

    /* =========================
       SAFE USER ID EXTRACTION
    ========================= */
    const userId =
      decoded?.user?.id ||
      decoded?.id ||
      decoded?._id;

    if (!userId) {
      return res.status(400).json({ error: "Invalid token structure" });
    }

    /* =========================
       CONNECT DB
    ========================= */
    client = new MongoClient(uri);
    await client.connect();

    const db = client.db("lms");

    /* =========================
       SAFE OBJECTID CONVERSION
    ========================= */
    let objectId;

    try {
      objectId = new ObjectId(userId);
    } catch (err) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    /* =========================
       FETCH USER
    ========================= */
    const userData = await db.collection("users").findOne({
      _id: objectId
    });

    if (!userData) {
      console.log("❌ USER NOT FOUND:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    /* =========================
       RESPONSE
    ========================= */
    return res.json({
      xp: userData.xp || 0,
      totalScore: userData.totalScore || 0,
      level: userData.level || 1,
      lastActive: userData.lastActive || null
    });

  } catch (err) {
    console.error("❌ XP API ERROR:", err);

    return res.status(500).json({
      error: "Failed to fetch XP",
      details: err.message
    });

  } finally {
    if (client) await client.close();
  }
}