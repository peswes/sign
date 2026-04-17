import jwt from "jsonwebtoken";

const courses = [
  {
    title: "Web Development",
    desc: "HTML • CSS • JS",
    courseKey: "web",
    progress: 75,
    color: "#4da3ff"
  },
  {
    title: "AI & Machine Learning",
    desc: "Python • Data Science",
    courseKey: "ai",
    progress: 55,
    color: "#6c5ce7"
  },
  {
    title: "UI/UX Design",
    desc: "Figma • Prototyping",
    courseKey: "design",
    progress: 68,
    color: "#00d2d3"
  },
  {
    title: "Cyber Security",
    desc: "Networks • Ethical Hacking",
    courseKey: "cyber",
    progress: 40,
    color: "#ff7675"
  }
];

// =========================
// CORS SETUP
// =========================
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

export default function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // =========================
    // GET TOKEN
    // =========================
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // =========================
    // VERIFY TOKEN
    // =========================
    const user = jwt.verify(token, process.env.JWT_SECRET);

    console.log("USER:", user);

    // =========================
    // CLEAN USER TRACK
    // =========================
    const userTrack = (user.track || "")
      .toString()
      .toLowerCase()
      .trim();

    console.log("USER TRACK:", userTrack);

    // =========================
    // DIRECT MATCH (NO MAPPING)
    // =========================
    const filtered = courses.filter(
      course => course.courseKey === userTrack
    );

    console.log("FILTERED:", filtered);

    // =========================
    // SAFE FALLBACK
    // =========================
    if (!userTrack || filtered.length === 0) {
      return res.status(200).json(courses);
    }

    return res.status(200).json(filtered);

  } catch (err) {
    console.error("COURSE ERROR:", err.message);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}