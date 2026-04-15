import connectDB from "../lib/db.js";
import Referral from "../models/Referral.js";
import User from "../models/User.js";

const setCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    // 🔥 FIX: Vercel body parsing issue
    if (typeof req.body === "string") {
      req.body = JSON.parse(req.body);
    }

    const {
      name,
      email,
      phone,
      course,
      password,
      referralCode
    } = req.body;

    // 🔥 VALIDATION
    if (!name || !email || !phone || !course || !password || !referralCode) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const cleanCode = referralCode.trim().toUpperCase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 🔥 FIX: safe referral search
    const ref = await Referral.findOne({
      code: { $regex: `^${cleanCode}$`, $options: "i" }
    });

    if (!ref) {
      return res.status(400).json({ message: "Invalid referral code" });
    }

    if (!ref.isActive) {
      return res.status(400).json({ message: "Referral inactive" });
    }

    if (ref.usedCount >= ref.maxUses) {
      return res.status(400).json({ message: "Referral expired" });
    }

    const user = await User.create({
      name,
      email,
      phone,
      course,
      password,
      referralCode: cleanCode
    });

    ref.usedCount += 1;
    await ref.save();

    return res.status(200).json({
      message: "Enrollment successful",
      user
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
}