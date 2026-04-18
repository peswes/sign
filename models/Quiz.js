import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true
  },
  topicIndex: {
    type: Number,
    required: true
  },
  questions: [
    {
      question: String,
      options: [String],
      answer: Number
    }
  ]
});

export default mongoose.model("Quiz", quizSchema);