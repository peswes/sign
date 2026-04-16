import connectDB from "../lib/db.js";
import Referral from "../models/Referral.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

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

    // FIX: handle Vercel JSON parsing issue
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const {
      name,
      email,
      phone,
      course,
      password,
      referralCode
    } = body;

    // VALIDATION
    if (!name || !email || !phone || !course || !password || !referralCode) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = referralCode.trim().toUpperCase();

    // CHECK EXISTING USER
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // FIND REFERRAL CODE
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

    // 🔥 HASH PASSWORD (IMPORTANT FIX)
    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE USER
    const user = await User.create({
      name,
      email: cleanEmail,
      phone,
      course,
      password: hashedPassword,
      referralCode: cleanCode
    });

    // UPDATE REFERRAL USAGE
    ref.usedCount += 1;
    await ref.save();

    return res.status(200).json({
      message: "Enrollment successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        course: user.course
      }
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
}