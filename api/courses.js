import jwt from "jsonwebtoken";

const courses = [
  {
    title: "Web Development",
    desc: "HTML • CSS • JS",
    courseKey: "Web Development",
    progress: 75,
    color: "#4da3ff"
  },
  {
    title: "AI & Machine Learning",
    desc: "Python • Data Science",
    courseKey: "AI & Machine Learning",
    progress: 55,
    color: "#6c5ce7"
  },
  {
    title: "UI/UX Design",
    desc: "Figma • Prototyping",
    courseKey: "UI/UX Design",
    progress: 68,
    color: "#00d2d3"
  },
  {
    title: "Cyber Security",
    desc: "Networks • Ethical Hacking",
    courseKey: "Cyber Security",
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

  try {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(200).json([]);
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);

    console.log("USER:", user); // 🔥 DEBUG

    /* =========================
       🔥 FIX: TRACK → COURSE MAP
    ========================= */
    const trackToCourse = {
      frontend: "Web Development",
      ai: "AI & Machine Learning",
      design: "UI/UX Design",
      cyber: "Cyber Security"
    };

    // 🔥 SUPPORT BOTH SYSTEMS
    const userCourse = user.course || trackToCourse[user.track];

    console.log("RESOLVED COURSE:", userCourse);

    if (!userCourse) {
      return res.status(200).json([]);
    }

    const filtered = courses.filter(
      c => c.courseKey === userCourse
    );

    console.log("FILTERED:", filtered);

    return res.status(200).json(filtered);

  } catch (err) {
    console.log("ERROR:", err.message);
    return res.status(200).json([]);
  }
}