import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";

/* =========================
   DATABASE CONNECTION
========================= */
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;

  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("✅ MongoDB Connected");
};


/* =========================
   HANDLER
========================= */
export default async function handler(req, res) {

  /* =========================
     CORS (FOR VERCEL + FRONTEND)
  ========================= */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  await connectDB();

  /* =========================
     GET QUIZ (FRONTEND USE)
  ========================= */
  if (req.method === "GET") {

    const { course, topic } = req.query;

    if (!course || topic === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing parameters (course or topic)"
      });
    }

    try {
      const quiz = await Quiz.findOne({
        courseId: course,
        topicIndex: Number(topic)
      }).lean(); // ⚡ faster

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: "Quiz not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          courseId: quiz.courseId,
          topicIndex: quiz.topicIndex,
          title: quiz.title,
          totalQuestions: quiz.questions.length,
          questions: quiz.questions
        }
      });

    } catch (err) {
      console.error("GET Quiz Error:", err);

      return res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message
      });
    }
  }


  /* =========================
     CREATE QUIZ (ADMIN USE)
  ========================= */
  if (req.method === "POST") {

    try {
      const { courseId, topicIndex, questions, title } = req.body;

      if (!courseId || topicIndex === undefined || !questions) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields"
        });
      }

      // Prevent duplicate quiz
      const existing = await Quiz.findOne({
        courseId,
        topicIndex
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Quiz already exists for this topic"
        });
      }

      const newQuiz = await Quiz.create({
        courseId,
        topicIndex,
        title,
        questions
      });

      return res.status(201).json({
        success: true,
        message: "Quiz created successfully",
        data: newQuiz
      });

    } catch (err) {
      console.error("POST Quiz Error:", err);

      return res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message
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