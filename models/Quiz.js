import mongoose from "mongoose";

/* =========================
   QUESTION SCHEMA
========================= */
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },

  options: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => arr.length >= 2,
      message: "At least 2 options are required"
    }
  },

  answer: {
    type: Number,
    required: true
  },

  explanation: {
    type: String, // optional (for future feature)
    default: ""
  }
});


/* =========================
   QUIZ SCHEMA
========================= */
const quizSchema = new mongoose.Schema({
  
  courseId: {
    type: String,
    required: true,
    index: true
  },

  topicIndex: {
    type: Number,
    required: true,
    index: true
  },

  title: {
    type: String,
    default: "Topic Quiz"
  },

  questions: {
    type: [questionSchema],
    required: true
  },

  totalQuestions: {
    type: Number,
    default: function () {
      return this.questions.length;
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});


/* =========================
   PREVENT DUPLICATE QUIZ
   (Same course + topic)
========================= */
quizSchema.index(
  { courseId: 1, topicIndex: 1 },
  { unique: true }
);


/* =========================
   EXPORT MODEL
========================= */
export default mongoose.models.Quiz ||
  mongoose.model("Quiz", quizSchema);