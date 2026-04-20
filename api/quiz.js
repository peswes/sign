import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";

/* =========================
   DB CONNECT
========================= */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ DB Error:", err);
    throw err;
  }
};

/* =========================
   HANDLER
========================= */
export default async function handler(req, res) {

  /* =========================
     CORS
  ========================= */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  await connectDB();

  /* =========================
     GET QUIZ
  ========================= */
  if (req.method === "GET") {

    const { course, topic, topicIndex } = req.query;

    // 🔥 FIX: accept BOTH formats safely
    const index = topicIndex !== undefined ? topicIndex : topic;

    if (!course || index === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing parameters"
      });
    }

    try {

      const quiz = await Quiz.findOne({
        courseId: course,
        topicIndex: Number(index)
      }).lean();

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: "Quiz not found"
        });
      }

      return res.status(200).json({
        success: true,
        questions: quiz.questions
      });

    } catch (err) {
      console.error("GET Error:", err);

      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

  /* =========================
     POST QUIZ
  ========================= */
  if (req.method === "POST") {

    try {
      const { courseId, topicIndex, questions } = req.body;

      if (!courseId || topicIndex === undefined || !questions) {
        return res.status(400).json({
          success: false,
          message: "Missing fields"
        });
      }

      const existing = await Quiz.findOne({
        courseId,
        topicIndex
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Quiz already exists"
        });
      }

      const newQuiz = await Quiz.create({
        courseId,
        topicIndex,
        questions
      });

      return res.status(201).json({
        success: true,
        data: newQuiz
      });

    } catch (err) {
      console.error("POST Error:", err);

      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed"
  });
}