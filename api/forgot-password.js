import connectDB from "../lib/db.js";
import User from "../models/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

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

    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // ✅ Normalize email
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // ✅ Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // ✅ HASH TOKEN BEFORE SAVING (VERY IMPORTANT)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins

    await user.save();

    // ✅ Email setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Send ORIGINAL token (not hashed)
    const link = `https://peswes.github.io/sign/reset-password.html?token=${resetToken}&email=${user.email}`;

    await transporter.sendMail({
      from: `"EdTech Platform" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>Password Reset Request</h2>
          <p>Click the button below to reset your password:</p>
          <a href="${link}" style="padding:10px 15px;background:#1976d2;color:#fff;text-decoration:none;border-radius:5px">
            Reset Password
          </a>
          <p style="margin-top:10px;font-size:12px;color:gray">
            This link expires in 15 minutes.
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      message: "Reset link sent to email",
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}