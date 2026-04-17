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

    // 🔥 ALWAYS RETURN ARRAY (EVEN IF NO TOKEN)
    if (!token) {
      return res.status(200).json([]);
    }

    const user = jwt.verify(token, process.env.JWT_SECRET);

    const userCourse = user?.course;

    if (!userCourse) {
      return res.status(200).json([]);
    }

    const filtered = courses.filter(
      c => c.courseKey === userCourse
    );

    return res.status(200).json(filtered);

  } catch (err) {
    // 🔥 NEVER RETURN OBJECT
    return res.status(200).json([]);
  }
}