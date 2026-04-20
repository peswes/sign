import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const user = jwt.verify(token, process.env.JWT_SECRET);

    const {
      course,
      topicIndex,
      score,
      totalQuestions,
      percent,
      answers,
      xpEarned
    } = req.body;

    const client = await MongoClient.connect(uri);
    const db = client.db("lms");

    /* =========================
       1. SAVE QUIZ HISTORY
    ========================= */
    await db.collection("quiz_results").insertOne({
      userId: user.id,
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
       2. UPDATE USER STATS
    ========================= */
    await db.collection("users").updateOne(
      { _id: new ObjectId(user.id) },
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

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save quiz result" });
  }
}