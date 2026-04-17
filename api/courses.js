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
   WEEKLY SCHEDULE
   (MON → WED → SAT)
========================= */
const weeklySchedule = {
  monday: "frontend-development",
  wednesday: "backend-development",
  saturday: "data-analysis"
};

/* =========================
   CORS SETUP
========================= */
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

/* =========================
   MAIN API HANDLER
========================= */
export default function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    /* =========================
       AUTH CHECK
    ========================= */
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    let user;
    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    /* =========================
       (OPTIONAL DEBUG OVERRIDE)
       use ?day=monday for testing
    ========================= */
    const overrideDay = req.query.day;

    const today = (
      overrideDay ||
      new Date().toLocaleDateString("en-US", {
        weekday: "long"
      })
    ).toLowerCase();

    /* =========================
       GET TODAY COURSE
    ========================= */
    const todayCourseKey = weeklySchedule[today];

    if (!todayCourseKey) {
      return res.status(200).json({
        today,
        course: null,
        message: "No class today"
      });
    }

    const todayCourse = courses.find(
      (c) => c.courseKey === todayCourseKey
    );

    /* =========================
       RESPONSE
    ========================= */
    return res.status(200).json({
      today,
      course: todayCourse || null,
      user: {
        id: user.id,
        name: user.name,
        track: user.track || user.course
      }
    });

  } catch (err) {
    console.error("COURSE API ERROR:", err);

    return res.status(500).json({
      message: "Server error"
    });
  }
}