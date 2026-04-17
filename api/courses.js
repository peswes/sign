import jwt from "jsonwebtoken";

const courses = [
  {
    title: "Frontend Development",
    desc: "HTML • CSS • JavaScript • React",
    courseKey: "frontend-development",
    progress: 75,
    color: "#4da3ff"
  },
  {
    title: "Game Development",
    desc: "Unity • C# • 2D/3D Games",
    courseKey: "game-development",
    progress: 50,
    color: "#ff9f43"
  },
  {
    title: "Robotics & AI",
    desc: "Python • AI Models • Automation",
    courseKey: "robotics-ai",
    progress: 55,
    color: "#6c5ce7"
  },
  {
    title: "Creative Tech",
    desc: "Design • Animation • UI Concepts",
    courseKey: "creative-tech",
    progress: 60,
    color: "#00d2d3"
  },
  {
    title: "Backend Development",
    desc: "Node.js • APIs • Databases",
    courseKey: "backend-development",
    progress: 70,
    color: "#2ecc71"
  },
  {
    title: "Cybersecurity",
    desc: "Ethical Hacking • Networks • Security",
    courseKey: "cybersecurity",
    progress: 40,
    color: "#ff7675"
  },
  {
    title: "Data Analysis",
    desc: "Excel • Python • Data Insights",
    courseKey: "data-analysis",
    progress: 65,
    color: "#3498db"
  },
  {
    title: "Finance & Business",
    desc: "Business • Finance • Startup Skills",
    courseKey: "finance-business",
    progress: 45,
    color: "#f1c40f"
  }
];

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

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

    console.log("USER:", user);

    // =========================
    // ACTIVE COURSE
    // =========================
    const activeCourseKey = (user.course || "")
      .toString()
      .toLowerCase()
      .trim();

    const activeCourse = courses.find(
      (c) => c.courseKey === activeCourseKey
    );

    // =========================
    // RELATED COURSES
    // =========================
    const relatedCourses = courses.filter(
      (c) => c.courseKey !== activeCourseKey
    );

    return res.status(200).json({
      activeCourse: activeCourse || null,
      relatedCourses
    });

  } catch (err) {
    console.error(err);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}