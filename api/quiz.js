import Quiz from "../models/Quiz.js";

export default async function handler(req, res) {
  // =========================
  // CORS HEADERS (IMPORTANT)
  // =========================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request (VERY IMPORTANT for Vercel)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { course, topic } = req.query;

  if (!course || topic === undefined) {
    return res.status(400).json({
      message: "Missing parameters (course or topic)"
    });
  }

  try {
    const quiz = await Quiz.findOne({
      courseId: course,
      topicIndex: Number(topic)
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found"
      });
    }

    return res.status(200).json({
      success: true,
      courseId: quiz.courseId,
      topicIndex: quiz.topicIndex,
      questions: quiz.questions
    });

  } catch (err) {
    console.error("Quiz API Error:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
}