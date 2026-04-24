export default function handler(req, res) {
  // =========================
  // CORS SETUP
  // =========================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const {
      studentId,
      course,
      lessonId,
      assignmentTitle,
      code,
      reflections,
      followUpAnswers,
      submittedAt,
      previousSubmissionId
    } = req.body;

    // =========================
    // VALIDATION
    // =========================
    if (!studentId || !course || !lessonId || !code) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: studentId, course, lessonId, or code"
      });
    }

    // Validate 3-step completion
    if (!reflections || reflections.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing reflection answers (Step 2)",
        missingStep: "reflection"
      });
    }

    if (!followUpAnswers || followUpAnswers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing follow-up answers (Step 3)",
        missingStep: "followup"
      });
    }

    // =========================
    // GRADING ENGINE
    // =========================
    function calculateGrade(submission) {
      let totalScore = 0;
      let feedback = [];

      // 1. Code Quality (60%)
      let codeScore = 0;
      const codeQuality = evaluateCodeQuality(submission.code);
      codeScore = codeQuality.score;
      feedback.push(...codeQuality.feedback);
      totalScore += codeScore * 0.6;

      // 2. Reflection Quality (20%)
      let reflectionScore = 0;
      const reflectionQuality = evaluateReflections(submission.reflections);
      reflectionScore = reflectionQuality.score;
      feedback.push(...reflectionQuality.feedback);
      totalScore += reflectionScore * 0.2;

      // 3. Follow-up Answers (20%)
      let followupScore = 0;
      const followupQuality = evaluateFollowups(submission.followUpAnswers);
      followupScore = followupQuality.score;
      feedback.push(...followupQuality.feedback);
      totalScore += followupScore * 0.2;

      // Round to nearest integer
      totalScore = Math.round(totalScore);

      // Determine letter grade
      let letterGrade = "F";
      if (totalScore >= 90) letterGrade = "A";
      else if (totalScore >= 80) letterGrade = "B";
      else if (totalScore >= 70) letterGrade = "C";
      else if (totalScore >= 60) letterGrade = "D";

      const passed = totalScore >= 70;

      return {
        total: totalScore,
        letterGrade,
        passed,
        breakdown: {
          code: Math.round(codeScore),
          reflection: Math.round(reflectionScore),
          followup: Math.round(followupScore)
        },
        feedback: feedback.slice(0, 5) // Top 5 feedback points
      };
    }

    function evaluateCodeQuality(code) {
      let score = 0;
      let feedback = [];
      
      // Check for code length and substance
      if (code.length > 100) {
        score += 20;
        feedback.push("✓ Good code length and substance");
      } else {
        feedback.push("⚠️ Code is too brief, add more details");
      }
      
      // Check for HTML/CSS/JS indicators
      if (code.includes("<") && code.includes(">")) {
        score += 15;
        feedback.push("✓ Uses HTML markup");
      }
      
      if (code.includes("{") && code.includes("}")) {
        score += 15;
        feedback.push("✓ Uses structured code blocks");
      }
      
      if (code.includes("function") || code.includes("=>") || code.includes("class")) {
        score += 20;
        feedback.push("✓ Demonstrates programming concepts");
      }
      
      if (code.toLowerCase().includes("responsive") || code.includes("@media")) {
        score += 15;
        feedback.push("✓ Shows responsive design consideration");
      }
      
      if (code.includes("aria-") || code.toLowerCase().includes("accessibility")) {
        score += 15;
        feedback.push("✓ Good accessibility awareness");
      }
      
      // Cap at 100
      score = Math.min(score, 100);
      
      if (score < 50) {
        feedback.unshift("⚠️ Code needs more development");
      } else if (score >= 80) {
        feedback.unshift("🌟 Excellent code quality!");
      }
      
      return { score, feedback };
    }
    
    function evaluateReflections(reflections) {
      let score = 0;
      let feedback = [];
      
      if (!reflections || reflections.length === 0) {
        return { score: 0, feedback: ["❌ No reflections provided"] };
      }
      
      let totalLength = reflections.join(" ").length;
      let detailedAnswers = 0;
      
      reflections.forEach((ref, idx) => {
        if (ref.length > 50) {
          detailedAnswers++;
          score += 20;
          feedback.push(`✓ Reflection ${idx + 1} shows good detail`);
        } else if (ref.length > 20) {
          score += 10;
          feedback.push(`✓ Reflection ${idx + 1} is adequate`);
        } else {
          feedback.push(`⚠️ Reflection ${idx + 1} needs more detail`);
        }
      });
      
      // Check for keywords indicating deep thinking
      const keywords = ["because", "challenge", "solve", "improve", "learn", "approach", "decision"];
      let keywordMatches = 0;
      reflections.forEach(ref => {
        keywords.forEach(keyword => {
          if (ref.toLowerCase().includes(keyword)) keywordMatches++;
        });
      });
      
      if (keywordMatches > reflections.length * 2) {
        score = Math.min(score + 10, 100);
        feedback.push("✓ Shows deep reflective thinking");
      }
      
      score = Math.min(score, 100);
      
      if (score < 50) {
        feedback.unshift("📝 Add more detail to your reflections");
      } else if (score >= 80) {
        feedback.unshift("💭 Excellent reflection quality!");
      }
      
      return { score, feedback };
    }
    
    function evaluateFollowups(followups) {
      let score = 0;
      let feedback = [];
      
      if (!followups || followups.length === 0) {
        return { score: 0, feedback: ["❌ No follow-up answers provided"] };
      }
      
      let totalLength = followups.join(" ").length;
      let detailedAnswers = 0;
      
      followups.forEach((answer, idx) => {
        if (answer.length > 60) {
          detailedAnswers++;
          score += 20;
          feedback.push(`✓ Follow-up ${idx + 1} demonstrates understanding`);
        } else if (answer.length > 30) {
          score += 12;
          feedback.push(`✓ Follow-up ${idx + 1} is satisfactory`);
        } else {
          feedback.push(`⚠️ Follow-up ${idx + 1} needs more explanation`);
        }
      });
      
      // Check for technical depth
      const techKeywords = ["why", "how", "because", "optimize", "performance", "security", "maintainable"];
      let techMatches = 0;
      followups.forEach(answer => {
        techKeywords.forEach(keyword => {
          if (answer.toLowerCase().includes(keyword)) techMatches++;
        });
      });
      
      if (techMatches > followups.length) {
        score = Math.min(score + 10, 100);
        feedback.push("✓ Shows technical depth in answers");
      }
      
      score = Math.min(score, 100);
      
      if (score < 50) {
        feedback.unshift("🔍 Expand your follow-up answers with more reasoning");
      } else if (score >= 80) {
        feedback.unshift("🎯 Excellent technical understanding!");
      }
      
      return { score, feedback };
    }

    // =========================
    // CREATE SUBMISSION RECORD
    // =========================
    const submission = {
      id: Date.now(),
      submissionCode: `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      studentId,
      course,
      lessonId,
      assignmentTitle,
      code,
      reflections: reflections || [],
      followUpAnswers: followUpAnswers || [],
      previousSubmissionId: previousSubmissionId || null,
      submittedAt: submittedAt || new Date().toISOString(),
      status: "pending_review"
    };

    // Calculate grade automatically for mock storage
    const gradingResult = calculateGrade(submission);
    submission.grade = gradingResult;
    submission.status = gradingResult.passed ? "passed" : "failed";

    // =========================
    // MOCK STORAGE (temporary)
    // =========================
    /**
     * IMPORTANT:
     * This is in-memory storage (resets on server restart).
     * Later upgrade to:
     * - MongoDB Atlas
     * - Firebase
     * - Supabase
     * - PostgreSQL
     */

    if (!global.submissions) {
      global.submissions = [];
    }

    // Track submission history
    if (!global.submissionHistory) {
      global.submissionHistory = {};
    }
    
    if (!global.submissionHistory[studentId]) {
      global.submissionHistory[studentId] = [];
    }
    
    global.submissionHistory[studentId].push({
      submissionId: submission.id,
      course,
      lessonId,
      grade: gradingResult.total,
      passed: gradingResult.passed,
      timestamp: submission.submittedAt
    });

    global.submissions.push(submission);

    console.log("📥 New Submission:", {
      id: submission.id,
      studentId: submission.studentId,
      course: submission.course,
      lessonId: submission.lessonId,
      grade: submission.grade.total,
      passed: submission.grade.passed
    });

    // =========================
    // CHECK FOR IMPROVEMENT (if resubmission)
    // =========================
    let improvement = null;
    if (previousSubmissionId) {
      const previousSubmission = global.submissions.find(s => s.id === previousSubmissionId);
      if (previousSubmission && previousSubmission.grade) {
        const gradeImprovement = submission.grade.total - previousSubmission.grade.total;
        improvement = {
          previousGrade: previousSubmission.grade.total,
          newGrade: submission.grade.total,
          improvement: gradeImprovement,
          message: gradeImprovement > 0 ? `🎉 Improved by ${gradeImprovement} points!` : 
                   gradeImprovement < 0 ? `📉 Score decreased by ${Math.abs(gradeImprovement)} points` :
                   "📊 Score remained the same"
        };
      }
    }

    // =========================
    // RESPONSE
    // =========================
    return res.status(200).json({
      success: true,
      message: gradingResult.passed ? "✅ Assignment submitted and passed!" : "⚠️ Assignment submitted but needs improvement",
      submission: {
        id: submission.id,
        submissionCode: submission.submissionCode,
        submittedAt: submission.submittedAt,
        status: submission.status,
        grade: {
          total: submission.grade.total,
          letterGrade: submission.grade.letterGrade,
          passed: submission.grade.passed,
          breakdown: submission.grade.breakdown
        },
        feedback: submission.grade.feedback
      },
      improvement: improvement,
      nextSteps: gradingResult.passed ? 
        "Continue to next lesson! 🚀" : 
        "Review the feedback and resubmit with improvements. Focus on the areas mentioned above."
    });

  } catch (error) {
    console.error("Submit Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}

// =========================
// HELPER FUNCTION FOR GETTING STUDENT PROGRESS
// =========================
export function getStudentProgress(studentId) {
  if (!global.submissionHistory || !global.submissionHistory[studentId]) {
    return {
      totalSubmissions: 0,
      passedLessons: [],
      averageGrade: 0,
      recentSubmissions: []
    };
  }
  
  const history = global.submissionHistory[studentId];
  const passedLessons = history.filter(s => s.passed).map(s => ({ course: s.course, lessonId: s.lessonId }));
  const averageGrade = history.reduce((sum, s) => sum + s.grade, 0) / history.length;
  
  return {
    totalSubmissions: history.length,
    passedLessons,
    averageGrade: Math.round(averageGrade),
    recentSubmissions: history.slice(-5).reverse()
  };
}

// =========================
// HELPER FUNCTION FOR GETTING SUBMISSION BY ID
// =========================
export function getSubmissionById(submissionId) {
  if (!global.submissions) return null;
  return global.submissions.find(s => s.id === submissionId);
}

// =========================
// HELPER FUNCTION FOR GETTING ALL SUBMISSIONS FOR A LESSON
// =========================
export function getSubmissionsByLesson(course, lessonId) {
  if (!global.submissions) return [];
  return global.submissions.filter(s => s.course === course && s.lessonId === lessonId);
}