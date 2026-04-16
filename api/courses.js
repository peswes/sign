import jwt from "jsonwebtoken";

const courses = [
  { title: "Web Dev", track: "frontend" },
  { title: "AI", track: "ai" }
];

export default function handler(req, res) {

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token" });

  const user = jwt.verify(token, process.env.JWT_SECRET);

  const filtered = courses.filter(c => c.track === user.track);

  res.status(200).json(filtered);
}