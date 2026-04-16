import connectDB from "../lib/db.js";
import User from "../models/User.js";
import crypto from "crypto";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ HASH TOKEN (must match DB)
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // ✅ Update password
    user.password = newPassword; // (ensure hashing in schema or middleware)

    // ✅ Clear reset fields
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}