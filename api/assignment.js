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

  const { courseKey, lesson, previousSubmission } = req.body;

  if (!courseKey || !lesson?.id) {
    return res.status(400).json({ message: "Missing courseKey or lesson" });
  }

  const lessonId = Number(lesson.id);
  const lessonTitle = lesson.title || "Untitled Lesson";
  const hasPreviousWork = previousSubmission && previousSubmission.code;

  // =========================
  // 🧠 ENHANCED ASSIGNMENT SYSTEM WITH 3-STEP FLOW
  // =========================
  const assignments = {
    "frontend-development": {
      1: {
        title: "🌐 How the Web Works Simulation",
        projectTask: "Create a visual or HTML explanation showing how Browser, Server, DNS, and Hosting work together in real websites.",
        reflection: [
          "Why did you choose this visual format?",
          "What was the hardest concept to explain?",
          "How would you improve this explanation for beginners?"
        ],
        followUp: [
          "What happens when you type a URL in browser?",
          "How does DNS caching improve performance?",
          "What security considerations exist in this flow?"
        ]
      },
      2: {
        title: "🏗️ Semantic HTML Builder",
        projectTask: "Build a full website using semantic HTML tags (header, nav, section, article, footer). Make it structured like a real production site.",
        reflection: [
          "Why did you choose this semantic structure?",
          "What accessibility improvements did you implement?",
          "What would you add next time?"
        ],
        followUp: [
          "Why use <article> vs <section>?",
          "How does semantic HTML help SEO?",
          "What landmark roles would you add?"
        ]
      },
      3: {
        title: "🎨 Modern CSS Layout Challenge",
        projectTask: "Create a fully responsive layout using Flexbox and CSS Grid that adapts to mobile, tablet, and desktop.",
        reflection: [
          "Why did you use Grid vs Flexbox in different sections?",
          "What responsive challenge did you solve?",
          "How would you optimize performance?"
        ],
        followUp: [
          "When would you use CSS Grid over Flexbox?",
          "How do you test responsive designs?",
          "What's the difference between em and rem?"
        ]
      },
      4: {
        title: "🚀 Startup Landing Page Project",
        projectTask: "Extend your landing page from previous lessons. Add responsive navigation, hero section, and CTA interactions.",
        reflection: [
          "Why did you choose this layout structure?",
          "What problem did you solve in this iteration?",
          "What would you improve next?"
        ],
        followUp: [
          "Why did you use Grid instead of Flexbox for this layout?",
          "How would you make this accessible for screen readers?",
          "What bug did you debug in this version?"
        ]
      },
      5: {
        title: "🧠 JavaScript Fundamentals Challenge",
        projectTask: hasPreviousWork 
          ? "Extend your previous JavaScript code. Add error handling, input validation, and a new feature."
          : "Create real-world JavaScript logic using variables, functions, arrays, and events (e.g., calculator or form validation).",
        reflection: [
          "Why did you choose this JavaScript architecture?",
          "What edge cases did you handle?",
          "How would you refactor this code?"
        ],
        followUp: [
          "What's the difference between == and ===?",
          "How does event delegation work?",
          "When would you use a closure?"
        ]
      },
      6: {
        title: "🎛️ DOM Manipulation Mastery",
        projectTask: hasPreviousWork
          ? "Add two new interactive components to your existing UI (modal, dropdown, or tab system)."
          : "Build interactive UI components like modal, dropdown, tab system, or counter using DOM manipulation.",
        reflection: [
          "Why did you choose these components?",
          "What DOM traversal challenges did you face?",
          "How would you improve performance?"
        ],
        followUp: [
          "What's the difference between innerHTML and createElement?",
          "How would you prevent memory leaks?",
          "When would you use event delegation?"
        ]
      },
      7: {
        title: "🌍 API Integration Project",
        projectTask: hasPreviousWork
          ? "Add error handling, loading states, and caching to your existing API integration."
          : "Fetch real data from an API (weather, crypto, or users) and display it dynamically on a webpage.",
        reflection: [
          "Why did you choose this API?",
          "What async challenges did you solve?",
          "How would you add offline support?"
        ],
        followUp: [
          "How do you handle API errors gracefully?",
          "What's the difference between Promises and async/await?",
          "How would you cache API responses?"
        ]
      },
      8: {
        title: "📱 Interactive Web App",
        projectTask: hasPreviousWork
          ? "Extend your To-Do or Weather App with data persistence, editing, and filtering features."
          : "Build a To-Do App or Weather App with local storage and dynamic UI updates.",
        reflection: [
          "Why did you choose this app architecture?",
          "What state management challenge did you solve?",
          "How would you add user accounts?"
        ],
        followUp: [
          "How does localStorage differ from sessionStorage?",
          "How would you sync data across tabs?",
          "What are the security concerns with localStorage?"
        ]
      },
      9: {
        title: "🔗 Git & GitHub Workflow",
        projectTask: "Simulate Git workflow: init repo, commit changes, push to GitHub, and explain team collaboration process with branch strategy.",
        reflection: [
          "Why did you choose this branching strategy?",
          "What merge conflict would you anticipate?",
          "How would you handle code review?"
        ],
        followUp: [
          "What's the difference between git merge and rebase?",
          "How do you revert a bad commit?",
          "What's a typical CI/CD pipeline?"
        ]
      },
      10: {
        title: "📱 Responsive UI Design",
        projectTask: hasPreviousWork
          ? "Redesign your existing webpage using mobile-first approach with perfect responsiveness on all screen sizes."
          : "Redesign a webpage using mobile-first approach ensuring perfect responsiveness on all screen sizes.",
        reflection: [
          "Why did you choose mobile-first approach?",
          "What responsive patterns did you use?",
          "How would you test on real devices?"
        ],
        followUp: [
          "What breakpoints did you choose and why?",
          "How would you optimize images for different devices?",
          "What's the difference between relative and absolute units?"
        ]
      },
      11: {
        title: "🚀 Deployment Challenge",
        projectTask: "Deploy your frontend project using Vercel, Netlify, or GitHub Pages, configure custom domain, and enable HTTPS.",
        reflection: [
          "Why did you choose this platform?",
          "What deployment challenges did you face?",
          "How would you set up preview deployments?"
        ],
        followUp: [
          "What environment variables did you need?",
          "How would you implement blue-green deployment?",
          "What's your rollback strategy?"
        ]
      },
      12: {
        title: "🏆 Final Portfolio Project",
        projectTask: hasPreviousWork
          ? "Add a blog section, case studies, and optimize your portfolio for performance and SEO."
          : "Build a full professional developer portfolio with projects, skills, about section, and contact form.",
        reflection: [
          "Why did you choose this portfolio structure?",
          "What makes your projects stand out?",
          "How would you improve this for job applications?"
        ],
        followUp: [
          "How would you measure portfolio success?",
          "What analytics would you add?",
          "How would you optimize Core Web Vitals?"
        ]
      }
    },
    "backend-development": {
      1: {
        title: "⚙️ Server Architecture Map",
        projectTask: "Explain how a backend server processes requests from client to database with diagram and code examples.",
        reflection: [
          "Why did you choose this architecture?",
          "What bottleneck would you address first?",
          "How would you scale this system?"
        ],
        followUp: [
          "What's the difference between vertical and horizontal scaling?",
          "How would you add a cache layer?",
          "What monitoring would you implement?"
        ]
      },
      2: {
        title: "🚀 Node.js Event Loop",
        projectTask: hasPreviousWork
          ? "Refactor your Node.js code to avoid blocking operations and optimize event loop usage."
          : "Explain or diagram how Node.js event loop works with pseudo-code examples.",
        reflection: [
          "Why did you choose this async pattern?",
          "What blocking operation did you identify?",
          "How would you measure performance?"
        ],
        followUp: [
          "What's the difference between setImmediate and nextTick?",
          "How would you handle CPU-intensive tasks?",
          "What causes event loop lag?"
        ]
      },
      3: {
        title: "🧩 Express API Builder",
        projectTask: hasPreviousWork
          ? "Add middleware, error handling, input validation, and authentication to your Express API."
          : "Create an Express server with at least 5 working API routes including CRUD operations.",
        reflection: [
          "Why did you choose this route structure?",
          "What middleware did you need?",
          "How would you document your API?"
        ],
        followUp: [
          "What's the difference between app.use and app.METHOD?",
          "How would you implement rate limiting?",
          "What security headers would you add?"
        ]
      }
    },
    "game-development": {
      1: {
        title: "🎮 Game Loop Design",
        projectTask: "Write pseudo-code for a complete game loop (initialize → input → update → render → repeat) with delta time.",
        reflection: [
          "Why did you choose this loop architecture?",
          "What performance considerations did you make?",
          "How would you add fixed timestep?"
        ],
        followUp: [
          "Why is delta time important?",
          "How would you handle game states?",
          "What's the difference between update and render?"
        ]
      },
      2: {
        title: "🕹️ Game Rules System",
        projectTask: hasPreviousWork
          ? "Extend your game with power-ups, scoring system, and difficulty levels."
          : "Design and implement win/lose rules, scoring system, and game mechanics for a simple game.",
        reflection: [
          "Why did you choose these game mechanics?",
          "What balance challenge did you solve?",
          "How would you add multiplayer?"
        ],
        followUp: [
          "How do you balance game difficulty?",
          "What makes game mechanics engaging?",
          "How would you save game progress?"
        ]
      },
      3: {
        title: "🏃 Player Movement Logic",
        projectTask: hasPreviousWork
          ? "Add smooth movement, collision detection, and animations to your player controller."
          : "Implement or explain character movement using keyboard input with smooth controls.",
        reflection: [
          "Why did you choose this movement system?",
          "What input handling challenge did you solve?",
          "How would you add controller support?"
        ],
        followUp: [
          "How do you handle multiple key presses?",
          "What's the difference between velocity and position-based movement?",
          "How would you implement jump physics?"
        ]
      }
    },
    "robotics-ai": {
      1: {
        title: "🤖 AI Decision Flow",
        projectTask: "Implement an AI decision-making system using input → processing → output model with conditional logic.",
        reflection: [
          "Why did you choose this decision structure?",
          "What edge cases did you handle?",
          "How would you add learning capability?"
        ],
        followUp: [
          "What's the difference between deterministic and probabilistic AI?",
          "How would you handle uncertainty?",
          "What sensors would provide better input?"
        ]
      },
      2: {
        title: "📊 Machine Learning Pipeline",
        projectTask: "Build a complete ML pipeline: data collection → preprocessing → training → evaluation → prediction.",
        reflection: [
          "Why did you choose this pipeline architecture?",
          "What data quality issues did you solve?",
          "How would you improve accuracy?"
        ],
        followUp: [
          "What's the difference between training and validation data?",
          "How do you prevent overfitting?",
          "What's the bias-variance tradeoff?"
        ]
      },
      3: {
        title: "⚡ Smart Rule-Based AI",
        projectTask: hasPreviousWork
          ? "Add fuzzy logic or confidence scores to your rule-based AI system."
          : "Build a rule-based AI system with at least 10 conditions and 5 possible actions.",
        reflection: [
          "Why did you choose these rules?",
          "What was the hardest rule to implement?",
          "How would you scale beyond rules?"
        ],
        followUp: [
          "When are rule-based systems better than ML?",
          "How would you debug rule conflicts?",
          "What's the state explosion problem?"
        ]
      }
    },
    "data-analysis": {
      1: {
        title: "📊 Data Classification",
        projectTask: "Classify and process datasets with structured, semi-structured, and unstructured data examples.",
        reflection: [
          "Why did you classify data this way?",
          "What storage would you use for each type?",
          "How would you automate classification?"
        ],
        followUp: [
          "What's the difference between CSV and JSON?",
          "How do you handle missing data?",
          "What's data normalization?"
        ]
      },
      2: {
        title: "🧹 Data Cleaning Process",
        projectTask: hasPreviousWork
          ? "Add outlier detection, imputation strategies, and validation rules to your cleaning pipeline."
          : "Build a complete data cleaning pipeline for a messy dataset (missing values, duplicates, outliers).",
        reflection: [
          "Why did you choose these cleaning strategies?",
          "What data quality issue was hardest to fix?",
          "How would you validate cleaning results?"
        ],
        followUp: [
          "What's the difference between imputation and deletion?",
          "How do you detect anomalies?",
          "What's ETL vs ELT?"
        ]
      },
      3: {
        title: "📈 Data Visualization Logic",
        projectTask: hasPreviousWork
          ? "Add interactive filtering, tooltips, and responsive design to your data visualization."
          : "Create an interactive dashboard visualizing sales or user data with multiple chart types.",
        reflection: [
          "Why did you choose these visualizations?",
          "What insight were you trying to show?",
          "How would you make it accessible?"
        ],
        followUp: [
          "When would you use a bar chart vs line chart?",
          "How do you avoid misleading visualizations?",
          "What's colorblind-friendly design?"
        ]
      }
    },
    "cybersecurity": {
      1: {
        title: "🔐 Cyber Threat Types",
        projectTask: "Build an interactive threat model showing common attacks (Phishing, MITM, DDoS, SQL Injection) with mitigations.",
        reflection: [
          "Why did you choose these threats?",
          "What's the most dangerous in your context?",
          "How would you prioritize fixes?"
        ],
        followUp: [
          "What's the difference between threat and vulnerability?",
          "How does defense in depth work?",
          "What's the CIA triad?"
        ]
      },
      2: {
        title: "🛡️ Password Security",
        projectTask: "Implement a password strength checker with hashing (bcrypt) and secure storage explanation.",
        reflection: [
          "Why did you choose this hashing algorithm?",
          "What makes a password strong?",
          "How would you add 2FA?"
        ],
        followUp: [
          "Why is salt important in hashing?",
          "What's the difference between hashing and encryption?",
          "How do rainbow table attacks work?"
        ]
      },
      3: {
        title: "🌐 Secure Login System",
        projectTask: hasPreviousWork
          ? "Add JWT refresh tokens, rate limiting, and security headers to your login system."
          : "Design and implement a secure authentication flow with JWT, HTTPS, and session management.",
        reflection: [
          "Why did you choose JWT over sessions?",
          "What security headers did you implement?",
          "How would you handle password reset?"
        ],
        followUp: [
          "Where should you store tokens?",
          "What's CSRF and how to prevent it?",
          "How do you secure against brute force?"
        ]
      }
    },
    "finance-business": {
      1: {
        title: "💼 Business Model Breakdown",
        projectTask: "Create a detailed business model canvas for a startup idea with revenue streams identified.",
        reflection: [
          "Why did you choose this business model?",
          "What's your key value proposition?",
          "How would you validate this model?"
        ],
        followUp: [
          "What's the difference between B2B and B2C?",
          "How do you calculate unit economics?",
          "What's customer acquisition cost?"
        ]
      },
      2: {
        title: "📊 Budget Planning",
        projectTask: hasPreviousWork
          ? "Add forecasting, variance analysis, and what-if scenarios to your budget plan."
          : "Build an interactive budget planner for a small business with income, expenses, and profit tracking.",
        reflection: [
          "Why did you choose these budget categories?",
          "What assumption was hardest to estimate?",
          "How would you track actual vs budget?"
        ],
        followUp: [
          "What's the difference between fixed and variable costs?",
          "How do you calculate break-even point?",
          "What's cash flow vs profit?"
        ]
      },
      3: {
        title: "🚀 Startup Strategy",
        projectTask: hasPreviousWork
          ? "Add go-to-market strategy, competitive analysis, and growth metrics to your startup plan."
          : "Create a complete startup pitch deck with problem, solution, market size, and revenue model.",
        reflection: [
          "Why did you choose this market?",
          "What's your unfair advantage?",
          "How would you get first 100 customers?"
        ],
        followUp: [
          "What's product-market fit?",
          "How do you calculate TAM, SAM, SOM?",
          "What's a minimal viable product?"
        ]
      }
    }
  };

  // =========================
  // GRADING RUBRIC
  // =========================
  const rubric = {
    projectBuild: 60,
    reflection: 20,
    followUp: 20,
    passingGrade: 70,
    criteria: {
      "Project Build": [
        "Code works and meets requirements",
        "Good structure and organization",
        "Appropriate technology choices",
        "Clean UI/UX implementation"
      ],
      "Reflection": [
        "Shows understanding of choices",
        "Identifies challenges solved",
        "Demonstrates growth mindset"
      ],
      "Follow-up Questions": [
        "Shows deep understanding",
        "Original thinking demonstrated",
        "Can explain technical decisions"
      ]
    }
  };

  // =========================
  // GET ENHANCED ASSIGNMENT
  // =========================
  const course = assignments[courseKey];
  const selectedAssignment = course?.[lessonId];

  // =========================
  // SMART FALLBACK WITH 3-STEP FLOW
  // =========================
  const response = selectedAssignment || {
    title: `📌 Practice: ${lessonTitle}`,
    projectTask: `Build something practical based on "${lessonTitle}". Apply what you learned in real-world form.${
      hasPreviousWork ? " Extend your previous work with new features." : ""
    }`,
    reflection: [
      "Why did you choose this approach?",
      "What challenge did you overcome?",
      "How would you improve this next time?"
    ],
    followUp: [
      "What was the most important concept in this lesson?",
      "How would you apply this to a real project?",
      "What do you want to learn next?"
    ]
  };

  // =========================
  // RESPONSE WITH FULL ASSIGNMENT FLOW
  // =========================
  return res.status(200).json({
    success: true,
    assignment: {
      title: response.title,
      projectTask: response.projectTask,
      course: courseKey,
      lessonId,
      lessonTitle,
      hasPreviousWork,
      
      // Step 2: Reflection Questions
      reflectionQuestions: response.reflection,
      
      // Step 3: Follow-up Questions
      followUpQuestions: response.followUp,
      
      // Grading Information
      rubric: rubric,
      
      // Submission Requirements
      submissionFormat: {
        code: "Your project code or link",
        reflections: "Answers to reflection questions",
        followUpAnswers: "Answers to follow-up questions",
        demoLink: "Optional: Live demo URL"
      },
      
      // Instructions
      instructions: {
        step1: "Build or extend your project based on the task above",
        step2: "Answer all reflection questions explaining your decisions",
        step3: "Answer all follow-up questions before final submission",
        tip: "Be specific in your answers. Show your thinking process."
      }
    }
  });
}