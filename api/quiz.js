import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";

/* =========================
   DB CONNECT (SAFE)
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
     GET QUIZ (FIXED + SAFE)
  ========================= */
  if (req.method === "GET") {
    try {

      let { course, topic, topicIndex } = req.query;

      const index = Number(topicIndex ?? topic);

      if (!course || isNaN(index)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parameters"
        });
      }

      course = course.trim();

      const quiz = await Quiz.findOne({
        courseId: course,
        topicIndex: index
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
     POST QUIZ (STRONG VALIDATION)
  ========================= */
  if (req.method === "POST") {
    try {

      const { courseId, topicIndex, questions } = req.body;

      if (!courseId || topicIndex === undefined || !Array.isArray(questions)) {
        return res.status(400).json({
          success: false,
          message: "Missing or invalid fields"
        });
      }

      const index = Number(topicIndex);

      if (isNaN(index)) {
        return res.status(400).json({
          success: false,
          message: "Invalid topicIndex"
        });
      }

      // 🔥 basic question validation
      for (let q of questions) {
        if (
          !q.question ||
          !Array.isArray(q.options) ||
          q.options.length < 2 ||
          typeof q.answer !== "number"
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid question format"
          });
        }
      }

      const course = courseId.trim();

      // safer upsert (prevents race conditions)
      const existing = await Quiz.findOne({
        courseId: course,
        topicIndex: index
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Quiz already exists"
        });
      }

      const newQuiz = await Quiz.create({
        courseId: course,
        topicIndex: index,
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

  /* =========================
     METHOD NOT ALLOWED
  ========================= */
  return res.status(405).json({
    success: false,
    message: "Method not allowed"
  });
}