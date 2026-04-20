import { MongoClient } from "mongodb";
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
       AUTH CHECK
    ========================= */
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);

    /* =========================
       CONNECT DB
    ========================= */
    client = await MongoClient.connect(uri);
    const db = client.db("lms");

    /* =========================
       FIND USER (FIXED)
       👉 USING EMAIL (NOT ObjectId)
    ========================= */
    const userData = await db.collection("users").findOne({
      email: user.email
    });

    if (!userData) {
      console.log("User not found in DB:", user);
      return res.status(404).json({ error: "User not found" });
    }

    /* =========================
       RESPONSE
    ========================= */
    return res.json({
      xp: userData.xp || 0,
      totalScore: userData.totalScore || 0,
      lastActive: userData.lastActive || null
    });

  } catch (err) {
    console.log("XP API ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch XP" });

  } finally {
    if (client) {
      await client.close();
    }
  }
}