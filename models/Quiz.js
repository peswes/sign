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
      validator: (arr) => Array.isArray(arr) && arr.length >= 2,
      message: "At least 2 options are required"
    }
  },

  answer: {
    type: Number,
    required: true
  },

  explanation: {
    type: String,
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
    index: true,
    trim: true
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
    default: []   // 🔥 IMPORTANT FIX
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});


/* =========================
   FIX: VIRTUAL FIELD (SAFE WAY)
========================= */
quizSchema.virtual("totalQuestions").get(function () {
  return this.questions ? this.questions.length : 0;
});


/* =========================
   INDEX (PREVENT DUPLICATES)
========================= */
quizSchema.index(
  { courseId: 1, topicIndex: 1 },
  { unique: true }
);


/* =========================
   IMPORTANT FIX FOR VERCEL
========================= */
quizSchema.set("toJSON", { virtuals: true });
quizSchema.set("toObject", { virtuals: true });


/* =========================
   EXPORT MODEL
========================= */
export default mongoose.models.Quiz ||
  mongoose.model("Quiz", quizSchema);