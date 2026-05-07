/**
 * api/lesson-progress.js
 * ─────────────────────────────────────────────────────────────
 * Deploy this file to your sign-iota-lilac Vercel project at:
 *   api/lesson-progress.js
 *
 * Also create these two files in the SAME project:
 *   lib/connectDB.js   (see connectDB.js output)
 *   models/LessonProgress.js  (see LessonProgress.js output)
 *
 * Endpoints:
 *  GET  /api/lesson-progress?courseId=js&lessonIndex=0  → one lesson state
 *  GET  /api/lesson-progress?courseId=js&all=true       → all lessons map
 *  POST /api/lesson-progress { courseId, lessonIndex, step, value }
 * ─────────────────────────────────────────────────────────────
 */

import connectDB      from "../lib/connectDB.js";
import LessonProgress from "../models/LessonProgress.js";
import jwt            from "jsonwebtoken";

const VALID_STEPS = [
  "videoCompleted",
  "quizCompleted",
  "assignmentCompleted",
  "completed",
];

/* ── Auth ─────────────────────────────────────────────────── */
function getUserId(req) {
  const auth  = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload.id || payload._id || payload.userId;
  } catch {
    return null;
  }
}

/* ── Helpers ──────────────────────────────────────────────── */
function shapeDoc(doc) {
  return {
    success:             true,
    courseId:            doc.courseId,
    lessonIndex:         doc.lessonIndex,
    videoCompleted:      doc.videoCompleted      ?? false,
    quizCompleted:       doc.quizCompleted       ?? false,
    assignmentCompleted: doc.assignmentCompleted ?? false,
    completed:           doc.completed           ?? false,
  };
}

function emptyState(courseId, lessonIndex) {
  return {
    success:             true,
    courseId,
    lessonIndex:         Number(lessonIndex),
    videoCompleted:      false,
    quizCompleted:       false,
    assignmentCompleted: false,
    completed:           false,
  };
}

/* ══════════════════════════════════════════════════════════
   HANDLER
══════════════════════════════════════════════════════════ */
export default async function handler(req, res) {
  /* CORS */
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  /* Auth */
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    await connectDB();
  } catch (e) {
    console.error("DB connection failed:", e);
    return res.status(500).json({ success: false, error: "Database connection failed" });
  }

  /* ══ GET ══════════════════════════════════════════════════ */
  if (req.method === "GET") {
    const { courseId, lessonIndex, all } = req.query;

    if (!courseId) {
      return res.status(400).json({ success: false, error: "courseId required" });
    }

    /* GET ALL ──────────────────────────────────────────────── */
    if (all === "true") {
      try {
        const docs = await LessonProgress.find({ userId, courseId })
          .sort({ lessonIndex: 1 })
          .lean();

        const flow = {};
        docs.forEach((d) => {
          flow[d.lessonIndex] = {
            videoCompleted:      d.videoCompleted      ?? false,
            quizCompleted:       d.quizCompleted       ?? false,
            assignmentCompleted: d.assignmentCompleted ?? false,
            completed:           d.completed           ?? false,
          };
        });

        return res.status(200).json({ success: true, courseId, flow });
      } catch (e) {
        console.error("GET all error:", e);
        return res.status(500).json({ success: false, error: "Server error" });
      }
    }

    /* GET ONE ──────────────────────────────────────────────── */
    if (lessonIndex === undefined || lessonIndex === null || lessonIndex === "") {
      return res.status(400).json({ success: false, error: "lessonIndex required" });
    }

    try {
      const doc = await LessonProgress.findOne({
        userId,
        courseId,
        lessonIndex: Number(lessonIndex),
      }).lean();

      return res.status(200).json(doc ? shapeDoc(doc) : emptyState(courseId, lessonIndex));
    } catch (e) {
      console.error("GET one error:", e);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  }

  /* ══ POST ═════════════════════════════════════════════════ */
  if (req.method === "POST") {
    const { courseId, lessonIndex, step, value } = req.body;

    /* Validate */
    if (!courseId || lessonIndex === undefined || lessonIndex === null) {
      return res.status(400).json({ success: false, error: "courseId and lessonIndex required" });
    }
    if (!step) {
      return res.status(400).json({ success: false, error: "step required" });
    }
    if (!VALID_STEPS.includes(step)) {
      return res.status(400).json({
        success: false,
        error: `step must be one of: ${VALID_STEPS.join(", ")}`,
      });
    }

    const idx      = Number(lessonIndex);
    const boolVal  = value === true || value === "true";

    try {
      /* Business rules — enforce order server-side */
      if (boolVal) {
        const existing = await LessonProgress.findOne({ userId, courseId, lessonIndex: idx }).lean();

        if (step === "quizCompleted" && !existing?.videoCompleted) {
          return res.status(400).json({
            success: false,
            error: "Cannot mark quiz complete — video not watched yet",
          });
        }
        if (step === "assignmentCompleted" && !existing?.quizCompleted) {
          return res.status(400).json({
            success: false,
            error: "Cannot mark assignment complete — quiz not passed yet",
          });
        }
        if (step === "completed") {
          if (!existing?.videoCompleted || !existing?.quizCompleted || !existing?.assignmentCompleted) {
            return res.status(400).json({
              success: false,
              error: "Complete video, quiz, and assignment before marking lesson done",
            });
          }
        }
      }

      /* Upsert */
      const updated = await LessonProgress.findOneAndUpdate(
        { userId, courseId, lessonIndex: idx },
        {
          $set: { [step]: boolVal },
          $setOnInsert: { userId, courseId, lessonIndex: idx },
        },
        { upsert: true, new: true, lean: true }
      );

      return res.status(200).json(shapeDoc(updated));

    } catch (e) {
      console.error("POST error:", e);
      return res.status(500).json({ success: false, error: "Server error" });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}