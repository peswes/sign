import mongoose from "mongoose";
import dotenv from "dotenv";
import Quiz from "./models/Quiz.js";

dotenv.config();

/* =========================
   CONNECT DATABASE
========================= */
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) return;

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

  } catch (err) {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  }
};

/* =========================
   QUIZ DATA
========================= */
const quizzes = [

/* =========================
   FRONTEND DEVELOPMENT
========================= */
{
  courseId: "frontend-development",
  topicIndex: 0,
  title: "How the Web Works",
  questions: [
    {
      question: "What happens when you enter a URL in a browser?",
      options: ["Browser sends request to server", "Opens offline file", "Deletes cache", "Nothing happens"],
      answer: 0
    },
    {
      question: "What does DNS do?",
      options: ["Stores images", "Converts domain to IP address", "Runs CSS", "Edits videos"],
      answer: 1
    },
    {
      question: "What is a server?",
      options: ["Provides data to clients", "A browser extension", "A design tool", "A database UI"],
      answer: 0
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

/* =========================
   BACKEND DEVELOPMENT
========================= */
{
  courseId: "backend-development",
  topicIndex: 0,
  title: "Backend Basics",
  questions: [
    {
      question: "Node.js is used for?",
      options: ["Frontend design", "Backend development", "Graphic design", "Gaming"],
      answer: 1
    },
    {
      question: "Express.js is a?",
      options: ["Database", "Backend framework", "Browser", "Operating system"],
      answer: 1
    }
  ]
},

/* =========================
   CYBERSECURITY
========================= */
{
  courseId: "cybersecurity",
  topicIndex: 0,
  title: "Security Basics",
  questions: [
    {
      question: "What is phishing?",
      options: ["A cyber attack", "A programming language", "A game", "A tool"],
      answer: 0
    },
    {
      question: "Firewall is used for?",
      options: ["Security", "Design", "Gaming", "Editing"],
      answer: 0
    }
  ]
},

/* =========================
   DATA ANALYSIS
========================= */
{
  courseId: "data-analysis",
  topicIndex: 0,
  title: "Data Analysis Basics",
  questions: [
    {
      question: "Data analysis involves?",
      options: ["Cleaning and interpreting data", "Playing games", "Drawing", "Hacking"],
      answer: 0
    }
  ]
}

];

/* =========================
   SAFE INSERT (UPSERT)
========================= */
const seedQuizzes = async () => {
  try {
    await connectDB();

    console.log("📥 Seeding quizzes...");

    for (const quiz of quizzes) {
      await Quiz.updateOne(
        { courseId: quiz.courseId, topicIndex: quiz.topicIndex },
        { $set: quiz },
        { upsert: true }
      );
    }

    console.log("🔥 Quizzes seeded successfully (no duplicates)");
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