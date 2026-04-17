import connectDB from "../lib/db.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 🔍 FIND USER
    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 🔐 CHECK PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // 🔥 NORMALIZE COURSE SYSTEM (CRITICAL FIX)
    const userTrack =
      (user.course || user.accessType || "frontend")
        .toString()
        .toLowerCase()
        .trim();

    // 🔐 GENERATE JWT TOKEN (CLEAN + CONSISTENT)
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,

        // IMPORTANT: USED BY courses.js
        track: userTrack
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🚀 RESPONSE
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,

        // IMPORTANT: frontend + courses API depend on this
        track: userTrack
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}