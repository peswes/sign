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

    const cleanEmail = email.toLowerCase().trim();

    // 🔥 FIND USER
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 🚨 RATE LIMIT CHECK (2 MIN COOLDOWN)
    const now = Date.now();

    if (
      user.resetRequestedAt &&
      now - user.resetRequestedAt < 2 * 60 * 1000
    ) {
      return res.status(429).json({
        message: "Please wait before requesting another reset link"
      });
    }

    // 🔒 LOCK REQUEST IMMEDIATELY (PREVENT MULTIPLE EMAILS)
    user.resetRequestedAt = now;
    await user.save();

    // 🔥 GENERATE TOKEN
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 🔐 HASH TOKEN
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    await user.save();

    // 📧 EMAIL SETUP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // 🔗 RESET LINK
    const link = `https://peswes.github.io/sign/reset-password.html?token=${resetToken}&email=${cleanEmail}`;

    // 📤 SEND EMAIL
    await transporter.sendMail({
      from: `"EdTech Platform" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "Reset Your Password",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>Password Reset Request</h2>
          <p>Click the button below to reset your password:</p>

          <a href="${link}"
             style="display:inline-block;padding:10px 15px;background:#1976d2;color:#fff;text-decoration:none;border-radius:5px">
            Reset Password
          </a>

          <p style="margin-top:10px;font-size:12px;color:gray">
            This link expires in 15 minutes.
          </p>
        </div>
      `
    });

    return res.status(200).json({
      message: "Reset link sent to email"
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}