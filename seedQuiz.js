import mongoose from "mongoose";
import Quiz from "./models/Quiz.js";

await mongoose.connect("YOUR_MONGO_URI");



const quizzes = [

/* =========================
   TOPIC 0 - HOW THE WEB WORKS
========================= */
{
  courseId: "frontend-development",
  topicIndex: 0,
  questions: [
    {
      question: "What happens when you enter a URL in a browser?",
      options: ["Browser sends request to server", "Opens offline file", "Deletes cache", "Nothing happens"],
      answer: 0
    },
    {
      question: "What does DNS do?",
      options: ["Stores images", "Converts domain to IP address", "Runs CSS", "Edits videos"],
      answer: 1
    },
    {
      question: "What is a server?",
      options: ["Provides data to clients", "A browser extension", "A design tool", "A database UI"],
      answer: 0
    }
  ]
},

/* =========================
   TOPIC 1 - HTML
========================= */
{
  courseId: "frontend-development",
  topicIndex: 1,
  questions: [
    {
      question: "What does HTML stand for?",
      options: [
        "Hyper Text Markup Language",
        "High Text Machine Language",
        "Home Tool Markup Language",
        "None"
      ],
      answer: 0
    },
    {
      question: "What is semantic HTML?",
      options: [
        "Meaningful structure tags",
        "Random styling",
        "Backend code",
        "Database structure"
      ],
      answer: 0
    },
    {
      question: "<header> tag is used for?",
      options: ["Top section", "Footer", "Database", "API"],
      answer: 0
    }
  ]
},

/* =========================
   TOPIC 2 - CSS
========================= */
{
  courseId: "frontend-development",
  topicIndex: 2,
  questions: [
    {
      question: "CSS is used for?",
      options: ["Styling web pages", "Backend logic", "Database", "Server"],
      answer: 0
    },
    {
      question: "Flexbox is used for?",
      options: ["Layout alignment", "Database", "Security", "Hosting"],
      answer: 0
    },
    {
      question: "Grid is used for?",
      options: ["2D layouts", "Only text", "Backend", "API"],
      answer: 0
    }
  ]
},

/* =========================
   TOPIC 3 - LANDING PAGE
========================= */
{
  courseId: "frontend-development",
  topicIndex: 3,
  questions: [
    {
      question: "What is a landing page?",
      options: ["Marketing page", "Database", "Backend system", "API"],
      answer: 0
    },
    {
      question: "CTA means?",
      options: ["Call To Action", "Code Test App", "Central Tool API", "Create Tech App"],
      answer: 0
    }
  ]
},

/* =========================
   TOPIC 4 - JAVASCRIPT
========================= */
{
  courseId: "frontend-development",
  topicIndex: 4,
  questions: [
    {
      question: "JavaScript is used for?",
      options: ["Interactivity", "Styling", "Database", "Hosting"],
      answer: 0
    },
    {
      question: "A variable is used to?",
      options: ["Store data", "Design UI", "Deploy apps", "Delete files"],
      answer: 0
    }
  ]
},

/* =========================
   TOPIC 5 - DOM
========================= */
{
  courseId: "frontend-development",
  topicIndex: 5,
  questions: [
    {
      question: "DOM stands for?",
      options: ["Document Object Model", "Data Output Mode", "Design Object Map", "None"],
      answer: 0
    },
    {
      question: "DOM allows you to?",
      options: ["Change HTML dynamically", "Build database", "Host server", "Design hardware"],
      answer: 0
    }
  ]
},

/* =========================
   TOPIC 6 - API
========================= */
{
  courseId: "frontend-development",
  topicIndex: 6,
  questions: [
    {
      question: "API is used to?",
      options: ["Connect to data", "Style page", "Design logo", "Build OS"],
      answer: 0
    },
    {
      question: "Fetch API is used for?",
      options: ["Getting data", "Deleting files", "Hosting", "Styling"],
      answer: 0
    }
  ]
},

/* =========================
   TOPIC 7 - MINI APP
========================= */
{
  courseId: "frontend-development",
  topicIndex: 7,
  questions: [
    {
      question: "To-Do app is used for?",
      options: ["Task management", "Design", "Hosting", "Security"],
      answer: 0
    },
    {
      question: "Weather app uses?",
      options: ["API", "Only HTML", "Only CSS", "Only backend"],
      answer: 0
    }
  ]
},

/* =========================
   TOPIC 8 - GIT
========================= */
{
  courseId: "frontend-development",
  topicIndex: 8,
  questions: [
    {
      question: "Git is used for?",
      options: ["Version control", "Design", "Hosting", "Database"],
      answer: 0
    },
    {
      question: "GitHub is?",
      options: ["Code hosting platform", "Browser", "Editor", "OS"],
      answer: 0
    }
  ]
},

/* =========================
   TOPIC 9 - RESPONSIVE DESIGN
========================= */
{
  courseId: "frontend-development",
  topicIndex: 9,
  questions: [
    {
      question: "Responsive design means?",
      options: ["Works on all devices", "Only desktop", "Only mobile", "Only backend"],
      answer: 0
    },
    {
      question: "Media queries are used for?",
      options: ["Responsive layout", "Database", "API", "Hosting"],
      answer: 0
    }
  ]
},

/* =========================
   TOPIC 10 - DEPLOYMENT
========================= */
{
  courseId: "frontend-development",
  topicIndex: 10,
  questions: [
    {
      question: "Deployment means?",
      options: ["Making app live", "Writing code", "Deleting code", "Testing only"],
      answer: 0
    },
    {
      question: "Vercel is used for?",
      options: ["Hosting websites", "Design", "Database", "Editing videos"],
      answer: 0
    }
  ]
},

/* =========================
   TOPIC 11 - FINAL PROJECT
========================= */
{
  courseId: "frontend-development",
  topicIndex: 11,
  questions: [
    {
      question: "A portfolio shows?",
      options: ["Skills and projects", "Only games", "Only backend", "Only images"],
      answer: 0
    },
    {
      question: "A dashboard is used for?",
      options: ["Managing data", "Only styling", "Only HTML", "Only gaming"],
      answer: 0
    }
  ]
},





/* =========================
   2. GAME DEVELOPMENT
========================= */
{
  courseId: "game-development",
  topicIndex: 0,
  questions: [
    {
      question: "Which engine is popular for game development?",
      options: ["Unity", "Excel", "Word", "Photoshop"],
      answer: 0
    },
    {
      question: "What language is commonly used in Unity?",
      options: ["C#", "HTML", "CSS", "SQL"],
      answer: 0
    }
  ]
},

/* =========================
   3. ROBOTICS AND AI PROJECTS
========================= */
{
  courseId: "robotics-ai-projects",
  topicIndex: 0,
  questions: [
    {
      question: "AI stands for?",
      options: ["Automated Input", "Artificial Intelligence", "Advanced Internet", "Analog Interface"],
      answer: 1
    },
    {
      question: "Robots need sensors to?",
      options: ["Play games", "Perceive environment", "Design websites", "Store data"],
      answer: 1
    }
  ]
},

/* =========================
   4. CREATIVE TECH
========================= */
{
  courseId: "creative-tech",
  topicIndex: 0,
  questions: [
    {
      question: "What is creative technology?",
      options: ["Blending art and tech", "Only coding", "Only drawing", "Only math"],
      answer: 0
    },
    {
      question: "Which tool is used for digital design?",
      options: ["Figma", "Node.js", "MongoDB", "Python only"],
      answer: 0
    }
  ]
},

/* =========================
   5. BACKEND DEVELOPMENT
========================= */
{
  courseId: "backend-development",
  topicIndex: 0,
  questions: [
    {
      question: "Node.js is used for?",
      options: ["Frontend design", "Backend development", "Graphic design", "Gaming"],
      answer: 1
    },
    {
      question: "Express.js is a?",
      options: ["Database", "Backend framework", "Browser", "Operating system"],
      answer: 1
    }
  ]
},

/* =========================
   6. CYBERSECURITY
========================= */
{
  courseId: "cybersecurity",
  topicIndex: 0,
  questions: [
    {
      question: "What is phishing?",
      options: ["A cyber attack", "A programming language", "A game", "A tool"],
      answer: 0
    },
    {
      question: "Firewall is used for?",
      options: ["Security", "Design", "Gaming", "Editing"],
      answer: 0
    }
  ]
},

/* =========================
   7. DATA ANALYSIS
========================= */
{
  courseId: "data-analysis",
  topicIndex: 0,
  questions: [
    {
      question: "Data analysis involves?",
      options: ["Cleaning and interpreting data", "Playing games", "Drawing", "Hacking"],
      answer: 0
    },
    {
      question: "Which tool is used for analysis?",
      options: ["Excel", "Photoshop", "Unity", "VS Code only"],
      answer: 0
    }
  ]
},

/* =========================
   8. FINANCE AND BUSINESS
========================= */
{
  courseId: "finance-business",
  topicIndex: 0,
  questions: [
    {
      question: "What is investment?",
      options: ["Putting money to grow", "Spending wastefully", "Borrowing only", "Saving only"],
      answer: 0
    },
    {
      question: "Profit means?",
      options: ["Loss", "Gain", "Debt", "Expense"],
      answer: 1
    }
  ]
}

];

/* =========================
   INSERT INTO DATABASE
========================= */
await Quiz.insertMany(quizzes);

console.log("🔥 All 8 course quizzes inserted successfully");
process.exit();