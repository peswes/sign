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
    progress: 75,
    lessons: [
      {
        id: 1,
        title: "Introduction to Web Development",
        video: "https://www.youtube.com/embed/UB1O30fR-EE",
        content: "Understand how websites work and how the web is structured."
      },
      {
        id: 2,
        title: "HTML Basics",
        video: "https://www.youtube.com/embed/pQN-pnXPaVg",
        content: "Learn how to structure webpages using HTML."
      },
      {
        id: 3,
        title: "CSS Styling",
        video: "https://www.youtube.com/embed/yfoY53QXEnI",
        content: "Learn how to style websites beautifully."
      }
    ]
  },

  {
    title: "Game Development",
    desc: "Unity • C# • 2D/3D Games",
    courseKey: "game-development",
    color: "#ff9f43",
    progress: 50,
    lessons: [
      {
        id: 1,
        title: "Introduction to Game Development",
        video: "https://www.youtube.com/embed/gB1F9G0JXOo",
        content: "Learn what game development is and how games are built."
      }
    ]
  },

  {
    title: "Robotics & AI",
    desc: "Python • AI Models • Automation",
    courseKey: "robotics-ai",
    color: "#6c5ce7",
    progress: 55,
    lessons: [
      {
        id: 1,
        title: "Introduction to AI",
        video: "https://www.youtube.com/embed/ad79nYk2keg",
        content: "What is Artificial Intelligence?"
      }
    ]
  },

  {
    title: "Creative Tech",
    desc: "Design • Animation • UI Concepts",
    courseKey: "creative-tech",
    color: "#00d2d3",
    progress: 60,
    lessons: [
      {
        id: 1,
        title: "UI/UX Basics",
        video: "https://www.youtube.com/embed/9bZkp7q19f0",
        content: "Learn UI/UX design principles."
      }
    ]
  },

  {
    title: "Backend Development",
    desc: "Node.js • APIs • Databases",
    courseKey: "backend-development",
    color: "#2ecc71",
    progress: 70,
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
    title: "Cybersecurity",
    desc: "Ethical Hacking • Networks • Security",
    courseKey: "cybersecurity",
    color: "#ff7675",
    progress: 40,
    lessons: [
      {
        id: 1,
        title: "Introduction to Cybersecurity",
        video: "https://www.youtube.com/embed/inWWhr5tnEA",
        content: "Learn basics of digital security."
      }
    ]
  },

  {
    title: "Data Analysis",
    desc: "Excel • Python • Data Insights",
    courseKey: "data-analysis",
    color: "#3498db",
    progress: 65,
    lessons: [
      {
        id: 1,
        title: "Data Analysis Basics",
        video: "https://www.youtube.com/embed/r-uOLxNrNk8",
        content: "Learn how data is analyzed."
      }
    ]
  },

  {
    title: "Finance & Business",
    desc: "Business • Finance • Startup Skills",
    courseKey: "finance-business",
    color: "#f1c40f",
    progress: 45,
    lessons: [
      {
        id: 1,
        title: "Business Fundamentals",
        video: "https://www.youtube.com/embed/3JluqTojuME",
        content: "Learn how businesses work."
      }
    ]
  }
];

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
       FIXED COURSE MATCHING
       (IMPORTANT: must use user.track OR user.course)
    ========================= */
    const activeCourseKey =
      (user.track || user.course || "")
        .toLowerCase()
        .trim();

    const activeCourse = courses.find(
      (c) => c.courseKey === activeCourseKey
    );

    const relatedCourses = courses.filter(
      (c) => c.courseKey !== activeCourseKey
    );

    return res.status(200).json({
      activeCourse: activeCourse || null,
      relatedCourses
    });

  } catch (err) {
    console.error("COURSE API ERROR:", err);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}