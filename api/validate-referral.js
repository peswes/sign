import connectDB from "../lib/db.js";
import Referral from "../models/Referral.js";

// CORS helper
const setCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  // HANDLE PRE-FLIGHT REQUEST (IMPORTANT FOR FETCH)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectDB();

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Referral code is required" });
    }

    const ref = await Referral.findOne({ code });

    if (!ref || !ref.isActive) {
      return res.status(400).json({ message: "Invalid referral code" });
    }

    if (ref.usedCount >= ref.maxUses) {
      return res.status(400).json({ message: "Code has expired" });
    }

    return res.status(200).json({
      message: "Valid code",
      valid: true
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}