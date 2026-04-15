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

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const link = `https://sign-iota-lilac.vercel.app/reset-password.html?token=${token}&email=${email}`;

    await transporter.sendMail({
      from: "EdTech <no-reply@edtech.com>",
      to: email,
      subject: "Reset Password",
      html: `<p>Click below:</p><a href="${link}">${link}</a>`,
    });

    return res.status(200).json({ message: "Reset link sent" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}