import jwt from "jsonwebtoken";

const courses = [
  {
    title: "Web Development",
    desc: "HTML • CSS • JS",
    courseKey: "web development",
    progress: 75,
    color: "#4da3ff"
  },
  {
    title: "AI & Machine Learning",
    desc: "Python • Data Science",
    courseKey: "ai & machine learning",
    progress: 55,
    color: "#6c5ce7"
  },
  {
    title: "UI/UX Design",
    desc: "Figma • Prototyping",
    courseKey: "ui/ux design",
    progress: 68,
    color: "#00d2d3"
  },
  {
    title: "Cyber Security",
    desc: "Networks • Ethical Hacking",
    courseKey: "cyber security",
    progress: 40,
    color: "#ff7675"
  }
];

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
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const user = jwt.verify(token, process.env.JWT_SECRET);

    console.log("USER FROM TOKEN:", user);

    // 🔥 NORMALIZE USER TRACK
    const userTrack = (user.track || "")
      .toString()
      .toLowerCase()
      .trim();

    console.log("USER TRACK:", userTrack);

    // 🔥 IF NO TRACK → RETURN ALL COURSES (SAFE UX)
    if (!userTrack) {
      return res.status(200).json(courses);
    }

    // 🔥 FILTER COURSES SAFELY
    const filtered = courses.filter(course =>
      course.courseKey.toLowerCase() === userTrack
    );

    console.log("FILTERED COURSES:", filtered);

    return res.status(200).json(filtered);

  } catch (err) {
    console.error("COURSE ERROR:", err.message);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}