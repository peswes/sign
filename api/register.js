import connectDB from "../lib/db.js";
import Referral from "../models/Referral.js";
import User from "../models/User.js";

const setCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  // HANDLE PRE-FLIGHT REQUEST (VERY IMPORTANT)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectDB();

  try {
    const { name, email, phone, course, password, referralCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const ref = await Referral.findOne({ code: referralCode });

    if (!ref || !ref.isActive) {
      return res.status(400).json({ message: "Invalid referral code" });
    }

    if (ref.usedCount >= ref.maxUses) {
      return res.status(400).json({ message: "Referral code expired" });
    }

    const user = await User.create({
      name,
      email,
      phone,
      course,
      password,
      referralCode
    });

    ref.usedCount += 1;
    await ref.save();

    return res.status(200).json({
      message: "Enrollment successful",
      user
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}