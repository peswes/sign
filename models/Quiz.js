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
    required: true,
    validate: {
      validator: function (v) {
        return v >= 0;
      },
      message: "Answer index must be valid"
    }
  },

  explanation: {
    type: String,
    default: ""
  }
});

/* =========================
   ATTEMPT SCHEMA (CLEAN)
========================= */
const attemptSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },

  score: {
    type: Number,
    required: true
  },

  percentage: {
    type: Number,
    required: true
  },

  passed: {
    type: Boolean,
    default: false
  },

  takenAt: {
    type: Date,
    default: Date.now
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
    default: []
  },

  allowRetake: {
    type: Boolean,
    default: false
  },

  requiresVideoCompletion: {
    type: Boolean,
    default: true
  },

  passMark: {
    type: Number,
    default: 70,
    min: 1,
    max: 100
  },

  /* =========================
     ATTEMPTS (LIMITED SAFELY)
  ========================= */
  attempts: {
    type: [attemptSchema],
    default: [],
    validate: {
      validator: function (arr) {
        return arr.length <= 50; // 🔥 prevents unlimited growth
      },
      message: "Too many attempts stored"
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

/* =========================
   VIRTUALS
========================= */
quizSchema.virtual("totalQuestions").get(function () {
  return this.questions.length;
});

quizSchema.virtual("totalAttempts").get(function () {
  return this.attempts.length;
});

/* =========================
   INDEX (NO DUPLICATES)
========================= */
quizSchema.index(
  { courseId: 1, topicIndex: 1 },
  { unique: true }
);

/* =========================
   SAFE OUTPUT
========================= */
quizSchema.set("toJSON", { virtuals: true });
quizSchema.set("toObject", { virtuals: true });

export default mongoose.models.Quiz ||
  mongoose.model("Quiz", quizSchema);