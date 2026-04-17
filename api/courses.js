import jwt from "jsonwebtoken";

/* =========================
   FULL LMS COURSE DATABASE
========================= */
const courses = [
  {
    title: "Frontend Development",
    desc: "HTML • CSS • JavaScript • React",
    courseKey: "frontend-development",
    color: "#4da3ff",
    lessons: [
      {
        id: 1,
        title: "Introduction to Web Development",
        video: "https://www.youtube.com/embed/UB1O30fR-EE",
        content: "Understand how websites work and how the web is structured."
      }
    ]
  },

  {
    title: "Backend Development",
    desc: "Node.js • APIs • Databases",
    courseKey: "backend-development",
    color: "#2ecc71",
    lessons: [
      {
        id: 1,
        title: "Node.js Basics",
        video: "https://www.youtube.com/embed/TlB_eWDSMt4",
        content: "Learn backend development with Node.js."
      }
    ]
  },

  {
    title: "Data Analysis",
    desc: "Excel • Python • Data Insights",
    courseKey: "data-analysis",
    color: "#3498db",
    lessons: [
      {
        id: 1,
        title: "Data Analysis Basics",
        video: "https://www.youtube.com/embed/r-uOLxNrNk8",
        content: "Learn how data is analyzed."
      }
    ]
  }
];

/* =========================
   WEEKLY SCHEDULE (UPDATED)
   Friday → Saturday
========================= */
const weeklySchedule = {
  monday: "frontend-development",
  wednesday: "backend-development",
  saturday: "data-analysis"
};

/* =========================
   CORS
========================= */
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

/* =========================
   API HANDLER
========================= */
export default function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);

    /* =========================
       GET TODAY
    ========================= */
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long"
    }).toLowerCase();

    const todayCourseKey = weeklySchedule[today];

    /* =========================
       ❌ NO CLASS TODAY
    ========================= */
    if (!todayCourseKey) {
      return res.status(200).json({
        today,
        course: null
      });
    }

    /* =========================
       ✅ GET TODAY COURSE
    ========================= */
    const todayCourse = courses.find(
      (c) => c.courseKey === todayCourseKey
    );

    return res.status(200).json({
      today,
      course: todayCourse || null
    });

  } catch (err) {
    console.error("COURSE API ERROR:", err);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}