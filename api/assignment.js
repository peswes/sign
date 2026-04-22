export default function handler(req, res) {
  // =========================
  // CORS SETUP
  // =========================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { courseKey, lesson } = req.body;

  if (!courseKey || !lesson?.id) {
    return res.status(400).json({ message: "Missing courseKey or lesson" });
  }

  const lessonId = Number(lesson.id);
  const lessonTitle = lesson.title || "Untitled Lesson";

  // =========================
  // 🧠 CORE ASSIGNMENT SYSTEM
  // =========================
  const assignments = {
    "frontend-development": {
  1: {
    title: "🌐 How the Web Works Simulation",
    task: "Create a visual or HTML explanation showing how Browser, Server, DNS, and Hosting work together in real websites."
  },

  2: {
    title: "🏗️ Semantic HTML Builder",
    task: "Build a full website using semantic HTML tags (header, nav, section, article, footer). Make it structured like a real production site."
  },

  3: {
    title: "🎨 Modern CSS Layout Challenge",
    task: "Create a fully responsive layout using Flexbox and CSS Grid that adapts to mobile, tablet, and desktop."
  },

  4: {
    title: "🚀 Startup Landing Page Project",
    task: "Design and build a startup landing page with hero section, features, testimonials, and call-to-action button."
  },

  5: {
    title: "🧠 JavaScript Fundamentals Challenge",
    task: "Create real-world JavaScript logic using variables, functions, arrays, and events (e.g calculator or form validation)."
  },

  6: {
    title: "🎛️ DOM Manipulation Mastery",
    task: "Build interactive UI components like modal, dropdown, tab system, or counter using DOM manipulation."
  },

  7: {
    title: "🌍 API Integration Project",
    task: "Fetch real data from an API (weather, crypto, or users) and display it dynamically on a webpage."
  },

  8: {
    title: "📱 Interactive Web App",
    task: "Build a To-Do App or Weather App with local storage and dynamic UI updates."
  },

  9: {
    title: "🔗 Git & GitHub Workflow",
    task: "Simulate Git workflow: init repo, commit changes, push to GitHub, and explain team collaboration process."
  },

  10: {
    title: "📱 Responsive UI Design",
    task: "Redesign a webpage using mobile-first approach ensuring perfect responsiveness on all screen sizes."
  },

  11: {
    title: "🚀 Deployment Challenge",
    task: "Deploy your frontend project using Vercel, Netlify, or GitHub Pages and share a live link."
  },

  12: {
    title: "🏆 Final Portfolio Project",
    task: "Build a full professional developer portfolio with projects, skills, about section, and contact form."
  }
},

    "backend-development": {
      1: {
        title: "⚙️ Server Architecture Map",
        task: "Explain how a backend server processes requests from client to database."
      },
      2: {
        title: "🚀 Node.js Event Loop",
        task: "Explain or diagram how Node.js event loop works with pseudo-code."
      },
      3: {
        title: "🧩 Express API Builder",
        task: "Create an Express server with at least 2 working API routes."
      }
    },

    "game-development": {
      1: {
        title: "🎮 Game Loop Design",
        task: "Write pseudo-code for a game loop (start → update → render → repeat)."
      },
      2: {
        title: "🕹️ Game Rules System",
        task: "Design win/lose rules for a simple game."
      },
      3: {
        title: "🏃 Player Movement Logic",
        task: "Implement or explain character movement using keyboard input."
      }
    },

    "robotics-ai": {
      1: {
        title: "🤖 AI Decision Flow",
        task: "Explain AI decision-making using input → processing → output model."
      },
      2: {
        title: "📊 Machine Learning Pipeline",
        task: "Describe training, testing, and prediction flow in ML."
      },
      3: {
        title: "⚡ Smart Rule-Based AI",
        task: "Build a simple rule-based AI system using conditions."
      }
    },

    "data-analysis": {
      1: {
        title: "📊 Data Classification",
        task: "Differentiate structured vs unstructured data with examples."
      },
      2: {
        title: "🧹 Data Cleaning Process",
        task: "List steps to clean and prepare raw data."
      },
      3: {
        title: "📈 Data Visualization Logic",
        task: "Design how to visualize sales or user data."
      }
    },

    "cybersecurity": {
      1: {
        title: "🔐 Cyber Threat Types",
        task: "List and explain common cyber attacks."
      },
      2: {
        title: "🛡️ Password Security",
        task: "Explain hashing and secure password storage."
      },
      3: {
        title: "🌐 Secure Login System",
        task: "Design a secure authentication flow."
      }
    },

    "finance-business": {
      1: {
        title: "💼 Business Model Breakdown",
        task: "Explain how companies generate revenue."
      },
      2: {
        title: "📊 Budget Planning",
        task: "Create a simple business budget plan."
      },
      3: {
        title: "🚀 Startup Strategy",
        task: "Design a startup idea with revenue model."
      }
    }
  };

  // =========================
  // GET COURSE ASSIGNMENTS
  // =========================
  const course = assignments[courseKey];

  const selectedAssignment = course?.[lessonId];

  // =========================
  // SMART FALLBACK SYSTEM
  // =========================
  const response = selectedAssignment || {
    title: `📌 Practice: ${lessonTitle}`,
    task: `Build something practical based on "${lessonTitle}". Apply what you learned in real-world form.`
  };

  // =========================
  // RESPONSE
  // =========================
  return res.status(200).json({
    success: true,
    assignment: {
      title: response.title,
      description: response.task,
      course: courseKey,
      lessonId,
      lessonTitle
    }
  });
}