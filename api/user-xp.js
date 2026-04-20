import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

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

  let client;

  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);

    console.log("JWT USER FULL:", user); // 🔥 IMPORTANT DEBUG

    client = await MongoClient.connect(uri);
    const db = client.db("lms");

    /* ✅ FIXED PATH */
    const userId = user.user?.id || user.id;

    const userData = await db.collection("users").findOne({
      _id: new ObjectId(userId)
    });

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      xp: userData.xp || 0,
      totalScore: userData.totalScore || 0,
      lastActive: userData.lastActive || null
    });

  } catch (err) {
    console.log("XP API ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch XP" });

  } finally {
    if (client) await client.close();
  }
}