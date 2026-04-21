import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

let cachedDb = null;

async function connectDB() {
  if (cachedDb) return cachedDb;

  const client = new MongoClient(uri);
  await client.connect();

  cachedDb = client.db("lms");
  return cachedDb;
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("🔐 JWT:", decoded);

    const userId = decoded?.id || decoded?.user?.id;
    const email = decoded?.email || decoded?.user?.email;

    const db = await connectDB();

    let user = null;

    /* =========================
       CASE 1: ObjectId users
    ========================= */
    if (ObjectId.isValid(userId)) {
      user = await db.collection("users").findOne({
        _id: new ObjectId(userId)
      });
    }

    /* =========================
       CASE 2: fallback string ID OR email
    ========================= */
    if (!user) {
      user =
        (await db.collection("users").findOne({ _id: userId })) || // STRING ID
        (await db.collection("users").findOne({ email: email?.toLowerCase() }));
    }

    if (!user) {
      console.log("❌ USER NOT FOUND:", { userId, email });

      return res.status(404).json({
        error: "User not found",
        debug: { userId, email }
      });
    }

    const xp = user.xp || 0;

    return res.json({
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