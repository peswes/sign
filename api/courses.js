import jwt from "jsonwebtoken";

const courses = [
  { title: "Web Development", desc: "HTML • CSS • JS", track: "frontend", progress: 75, color: "#4da3ff" },
  { title: "AI & Machine Learning", desc: "Python • Data Science", track: "ai", progress: 55, color: "#6c5ce7" },
  { title: "UI/UX Design", desc: "Figma • Prototyping", track: "design", progress: 68, color: "#00d2d3" },
  { title: "Cyber Security", desc: "Networks • Ethical Hacking", track: "cyber", progress: 40, color: "#ff7675" }
];

/* =========================
   CORS HEADERS (IMPORTANT)
========================= */
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

export default function handler(req, res) {

  setCors(res);

  /* =========================
     HANDLE PRE-FLIGHT REQUEST
  ========================= */
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (!user?.track) {
      return res.status(400).json({ message: "Invalid token payload" });
    }

    const filtered = courses.filter(c => c.track === user.track);

    return res.status(200).json(filtered);

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}