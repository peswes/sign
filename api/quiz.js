import Quiz from "../models/Quiz.js";

export default async function handler(req, res) {
  const { course, topic } = req.query;

  if (!course || topic === undefined) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  try {
    const quiz = await Quiz.findOne({
      courseId: course,
      topicIndex: Number(topic)
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json({
      questions: quiz.questions
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}