import mongoose from "mongoose";
import dotenv from "dotenv";
import Quiz from "./models/Quiz.js"; // change to ../models/Quiz.js if needed

dotenv.config();

/* =========================
   CONNECT DATABASE
========================= */
const connectDB = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    console.log("👉 URI:", process.env.MONGODB_URI);

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    if (mongoose.connection.readyState === 1) return;

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected Successfully");

  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
    process.exit(1);
  }
};

/* =========================
   QUIZ DATA
========================= */
const quizzes = [
  {
    courseId: "frontend-development",
    topicIndex: 0,
    title: "How the Web Works",
    questions: [
      {
        question: "What happens when you enter a URL in a browser?",
        options: [
          "Browser sends request to server",
          "Opens offline file",
          "Deletes cache",
          "Nothing happens"
        ],
        answer: 0
      },
      {
        question: "What does DNS do?",
        options: [
          "Stores images",
          "Converts domain to IP address",
          "Runs CSS",
          "Edits videos"
        ],
        answer: 1
      }
    ]
  },

  {
    courseId: "frontend-development",
    topicIndex: 1,
    title: "HTML Basics",
    questions: [
      {
        question: "What does HTML stand for?",
        options: [
          "Hyper Text Markup Language",
          "High Text Machine Language",
          "Home Tool Markup Language",
          "None"
        ],
        answer: 0
      }
    ]
  },

  {
    courseId: "backend-development",
    topicIndex: 0,
    title: "Backend Basics",
    questions: [
      {
        question: "Node.js is used for?",
        options: [
          "Frontend design",
          "Backend development",
          "Graphic design",
          "Gaming"
        ],
        answer: 1
      }
    ]
  }
];

/* =========================
   SEED FUNCTION (SAFE + DEBUG)
========================= */
const seedQuizzes = async () => {
  try {
    await connectDB();

    console.log("📥 Seeding quizzes...");

    let count = 0;

    for (const quiz of quizzes) {
      const result = await Quiz.updateOne(
        { courseId: quiz.courseId, topicIndex: quiz.topicIndex },
        { $set: quiz },
        { upsert: true }
      );

      console.log(
        `✔ ${quiz.courseId} topic ${quiz.topicIndex} -> upserted:`,
        result.upsertedCount || 0
      );

      count++;
    }

    console.log(`🔥 Done! ${count} quizzes processed`);
    process.exit();

  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

/* =========================
   RUN SEEDER
========================= */
seedQuizzes();