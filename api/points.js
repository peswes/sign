import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";

const uri = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const token = req.headers.authorization?.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);

    const { score, xpEarned } = req.body;

    const client = await MongoClient.connect(uri);
    const db = client.db("lms");

    await db.collection("users").updateOne(
      { _id: user.id },
      {
        $inc: {
          xp: xpEarned,
          totalScore: score
        }
      }
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "Failed to save points" });
  }
}