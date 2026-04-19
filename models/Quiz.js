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
   QUIZ SCHEMA (UPGRADED LMS VERSION)
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

  /* =========================
     QUESTIONS
  ========================= */
  questions: {
    type: [questionSchema],
    default: []
  },

  /* =========================
     LMS CONTROL FIELDS
  ========================= */

  // 🔒 prevents retake
  allowRetake: {
    type: Boolean,
    default: false
  },

  // 🎥 must complete video first
  requiresVideoCompletion: {
    type: Boolean,
    default: true
  },

  // 📊 pass mark (e.g. 70%)
  passMark: {
    type: Number,
    default: 70
  },

  /* =========================
     USER ATTEMPTS (IMPORTANT)
     stores who took quiz + score
  ========================= */
  attempts: [
    {
      userId: {
        type: String,
        required: true
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
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }

});


/* =========================
   VIRTUAL FIELD
========================= */
quizSchema.virtual("totalQuestions").get(function () {
  return this.questions ? this.questions.length : 0;
});


/* =========================
   INDEX (NO DUPLICATES)
========================= */
quizSchema.index(
  { courseId: 1, topicIndex: 1 },
  { unique: true }
);


/* =========================
   SAFE JSON OUTPUT
========================= */
quizSchema.set("toJSON", { virtuals: true });
quizSchema.set("toObject", { virtuals: true });


/* =========================
   EXPORT MODEL
========================= */
export default mongoose.models.Quiz ||
  mongoose.model("Quiz", quizSchema);