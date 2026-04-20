import jwt from "jsonwebtoken";

/* =========================
   FULL LMS COURSE DATABASE
========================= */
const courses = [
 {
  title: "Frontend Development",
  desc: "HTML • CSS • JavaScript • React • Real-World Projects",
  courseKey: "frontend-development",
  color: "#4da3ff",
  progress: 75,

  lessons: [

    /* =========================
       PHASE 1: WEB FOUNDATION (REAL WORLD START)
    ========================= */
    {
      id: 1,
      title: "How the Web Works (Real Industry Overview)",
      video: "https://www.youtube.com/embed/0ik6X4DJKCc",
      content:
        "Understand how browsers, servers, DNS, hosting, and APIs work together in real websites."
    },
    {
      id: 2,
      title: "HTML for Real Projects (Semantic Structure)",
      video: "https://www.youtube.com/embed/gY2dNUdH51o",
      content:
        "Build real website layouts using semantic HTML used in production apps."
    },
    {
  id: 3,
  title: "Modern CSS (Flexbox + Grid + Responsive Design)",
  video: "https://www.youtube.com/embed/gY2dNUdH51o",
  content: "Create responsive layouts used in modern startups and tech companies."
},

    /* =========================
       MINI PROJECT 1
    ========================= */
    {
      id: 4,
      title: "Project 1: Landing Page (Startup Style)",
      video: "https://www.youtube.com/watch?v=SqcY0GlETPk&list=PPSV&t=73s",
      content:
        "Build a real startup landing page with hero section, features, testimonials, and CTA."
    },

    /* =========================
       PHASE 2: JAVASCRIPT (REAL INTERACTION)
    ========================= */
    {
      id: 5,
      title: "JavaScript Fundamentals (Real App Logic)",
      video: "https://www.youtube.com/embed/W6NZfCO5SIk",
      content:
        "Learn how real apps handle logic: variables, functions, arrays, and events."
    },
    {
      id: 6,
      title: "DOM Manipulation (Real UI Control)",
      video: "https://www.youtube.com/embed/0ik6X4DJKCc",
      content:
        "Control real web pages dynamically like buttons, forms, modals, and menus."
    },
    {
      id: 7,
      title: "API Basics (Connect to Real Data)",
      video: "https://www.youtube.com/embed/1JtWc1b6i1A",
      content:
        "Fetch live data from APIs like weather apps, crypto apps, and dashboards."
    },

    /* =========================
       MINI PROJECT 2
    ========================= */
    {
      id: 8,
      title: "Project 2: Interactive App (To-Do / Weather App)",
      video: "https://www.youtube.com/embed/t2ypzz6gJm0",
      content:
        "Build a real functional app that stores data and interacts with APIs."
    },

    /* =========================
       PHASE 3: REAL-WORLD DEVELOPMENT
    ========================= */
    {
      id: 9,
      title: "Git & GitHub (Team Workflow)",
      video: "https://www.youtube.com/embed/RGOj5yH7evk",
      content:
        "Learn how developers collaborate on real-world projects using Git."
    },
    {
      id: 10,
      title: "Responsive UI (Mobile-First Design)",
      video: "https://www.youtube.com/embed/srvUrASNj0s",
      content:
        "Build apps that work perfectly on mobile, tablet, and desktop."
    },
    {
      id: 11,
      title: "Frontend Deployment (Live Hosting)",
      video: "https://www.youtube.com/embed/swy9O0g2b4Y",
      content:
        "Deploy real websites using Vercel, Netlify, or GitHub Pages."
    },

    /* =========================
       FINAL PROJECT (JOB-READY LEVEL)
    ========================= */
    {
      id: 12,
      title: "Final Project: Real Portfolio + Dashboard",
      video: "https://www.youtube.com/embed/UB1O30fR-EE",
      content:
        "Build a professional portfolio + dashboard system like a real frontend developer."
    }
  ]
},





{
  title: "Game Development",
  desc: "Unity • C# • 2D/3D Game Systems • Real Projects",
  courseKey: "game-development",
  color: "#ff9f43",
  progress: 50,

  lessons: [

    /* =========================
       PHASE 1: GAME DEVELOPMENT FOUNDATIONS
    ========================= */
    {
      id: 1,
      title: "How Games Actually Work (Game Engine Thinking)",
      video: "https://www.youtube.com/embed/gB1F9G0JXOo",
      content:
        "Understand game loops, rendering, physics, input systems, and how real games run under the hood."
    },
    {
      id: 2,
      title: "Game Design Basics (Core Mechanics)",
      video: "https://www.youtube.com/embed/3Q_oYDQ2whs",
      content:
        "Learn how game ideas are structured: rules, mechanics, challenges, and player experience."
    },
    {
      id: 3,
      title: "Player Movement System (Core Mechanics in Games)",
      video: "https://www.youtube.com/embed/7bYjX6X1Z9c",
      content:
        "Build smooth movement systems used in platformers and 3D games."
    },

    /* =========================
       MINI GAME 1
    ========================= */
    {
      id: 4,
      title: "Mini Project: Clicker Game (First Playable Game)",
      video: "https://www.youtube.com/embed/2Vqzq3b0s2Q",
      content:
        "Build your first complete game with scoring, buttons, and simple logic."
    },

    /* =========================
       PHASE 2: GAME SYSTEMS
    ========================= */
    {
      id: 5,
      title: "Game Controls & Input System",
      video: "https://www.youtube.com/embed/1JtWc1b6i1A",
      content:
        "Learn keyboard, mouse, and touch input systems used in real games."
    },
    {
      id: 6,
      title: "Scoring System & Game State Logic",
      video: "https://www.youtube.com/embed/5kqQ1X2Zp3A",
      content:
        "Learn how games track score, lives, win/lose conditions."
    },
    {
      id: 7,
      title: "Collision & Physics (Unity Style Logic)",
      video: "https://www.youtube.com/embed/7J7G6Xx9b2Q",
      content:
        "Understand how objects interact in games using physics and collision detection."
    },

    /* =========================
       MINI GAME 2
    ========================= */
    {
      id: 8,
      title: "Mini Project: Platformer Game",
      video: "https://www.youtube.com/embed/8Z6k3Qx1p0A",
      content:
        "Build a simple 2D platform game with jumping, obstacles, and scoring."
    },

    /* =========================
       PHASE 3: REAL GAME DEVELOPMENT
    ========================= */
    {
      id: 9,
      title: "UI for Games (Menus, HUD, Buttons)",
      video: "https://www.youtube.com/embed/9bZkp7q19f0",
      content:
        "Design game menus, pause screens, health bars, and HUD systems."
    },
    {
      id: 10,
      title: "Level Design (Game Flow Creation)",
      video: "https://www.youtube.com/embed/4x5pQwZ7k2A",
      content:
        "Learn how to design fun and challenging game levels."
    },
    {
      id: 11,
      title: "Game Optimization (Performance & Smooth Play)",
      video: "https://www.youtube.com/embed/6pQxX1k2Z9A",
      content:
        "Make games run smoothly by optimizing assets and logic."
    },

    /* =========================
       FINAL PROJECT
    ========================= */
    {
      id: 12,
      title: "Final Project: Complete 2D Game (Publish Ready)",
      video: "https://www.youtube.com/embed/UB1O30fR-EE",
      content:
        "Build a full playable game with menu, gameplay, scoring, and win system ready for publishing."
    }
  ]
},

 {
  title: "Robotics & AI",
  desc: "Python • Machine Learning • Automation • Smart Systems",
  courseKey: "robotics-ai",
  color: "#6c5ce7",
  progress: 55,

  lessons: [

    /* =========================
       PHASE 1: AI FOUNDATIONS
    ========================= */
    {
      id: 1,
      title: "What is Artificial Intelligence (Real World View)",
      video: "https://www.youtube.com/embed/ad79nYk2keg",
      content:
        "Understand how AI is used in apps like Google, Netflix, ChatGPT, and self-driving systems."
    },
    {
      id: 2,
      title: "How Machines Learn (Data → Model → Prediction)",
      video: "https://www.youtube.com/embed/7eh4d6sabA0",
      content:
        "Learn how AI systems are trained using data to make predictions."
    },
    {
      id: 3,
      title: "Python for AI (Core Tools)",
      video: "https://www.youtube.com/embed/_uQrJ0TkZlc",
      content:
        "Learn Python basics used in AI development (variables, loops, functions, libraries)."
    },

    /* =========================
       MINI AI PROJECT
    ========================= */
    {
      id: 4,
      title: "Mini Project: Smart Decision System",
      video: "https://www.youtube.com/embed/1JtWc1b6i1A",
      content:
        "Build a simple AI logic system that makes decisions based on input conditions."
    },

    /* =========================
       PHASE 2: MACHINE LEARNING LOGIC
    ========================= */
    {
      id: 5,
      title: "Machine Learning Basics (Real Thinking Models)",
      video: "https://www.youtube.com/embed/GwIo3gDZCVQ",
      content:
        "Understand how AI models learn patterns from data."
    },
    {
      id: 6,
      title: "Data Handling for AI (Training Data)",
      video: "https://www.youtube.com/embed/r-uOLxNrNk8",
      content:
        "Learn how data is collected, cleaned, and used for AI training."
    },
    {
      id: 7,
      title: "Simple AI Model (Prediction System)",
      video: "https://www.youtube.com/embed/7eh4d6sabA0",
      content:
        "Build a basic prediction system (like price prediction or classification)."
    },

    /* =========================
       MINI AI PROJECT 2
    ========================= */
    {
      id: 8,
      title: "Mini Project: AI Chatbot Logic",
      video: "https://www.youtube.com/embed/1JtWc1b6i1A",
      content:
        "Create a simple chatbot that responds based on rules and logic."
    },

    /* =========================
       PHASE 3: ROBOTICS SYSTEMS
    ========================= */
    {
      id: 9,
      title: "Robotics Basics (Sensors, Motors, Movement)",
      video: "https://www.youtube.com/embed/4qf2kX1Z9aA",
      content:
        "Learn how robots sense the environment and move intelligently."
    },
    {
      id: 10,
      title: "Automation Systems (Real-World Smart Systems)",
      video: "https://www.youtube.com/embed/5gqQ1X2Zp3A",
      content:
        "Build systems that automatically react to inputs (like smart homes)."
    },
    {
      id: 11,
      title: "Control Logic (Robot Decision Systems)",
      video: "https://www.youtube.com/embed/7J7G6Xx9b2Q",
      content:
        "Learn how robots decide what to do using logic and conditions."
    },

    /* =========================
       FINAL PROJECT
    ========================= */
    {
      id: 12,
      title: "Final Project: Smart AI + Automation System",
      video: "https://www.youtube.com/embed/UB1O30fR-EE",
      content:
        "Build a complete AI or robotics system that makes decisions, reacts, and automates tasks."
    }
  ]
},

{
  title: "Creative Tech",
  desc: "UI/UX Design • Motion Graphics • Branding • Content Creation",
  courseKey: "creative-tech",
  color: "#00d2d3",
  progress: 60,

  lessons: [

    /* =========================
       PHASE 1: DESIGN THINKING
    ========================= */
    {
      id: 1,
      title: "What is UI/UX Design (Real Product Thinking)",
      video: "https://www.youtube.com/embed/9bZkp7q19f0",
      content:
        "Understand how apps like Instagram, TikTok, and Netflix are designed for user experience."
    },
    {
      id: 2,
      title: "Design Principles (Layout, Balance, Hierarchy)",
      video: "https://www.youtube.com/embed/7b3Gg0X1a2Q",
      content:
        "Learn how designers structure visually appealing interfaces used in real apps."
    },
    {
      id: 3,
      title: "Color Theory & Typography (Brand Feel)",
      video: "https://www.youtube.com/embed/5kqQ1X2Zp3A",
      content:
        "Learn how colors and fonts affect emotions and brand identity."
    },

    /* =========================
       MINI DESIGN PROJECT
    ========================= */
    {
      id: 4,
      title: "Mini Project: App UI Design (Mobile Screen)",
      video: "https://www.youtube.com/embed/UB1O30fR-EE",
      content:
        "Design a real mobile app screen like login page, dashboard, or social feed."
    },

    /* =========================
       PHASE 2: DIGITAL CONTENT CREATION
    ========================= */
    {
      id: 5,
      title: "Intro to Digital Content Creation",
      video: "https://www.youtube.com/embed/1JtWc1b6i1A",
      content:
        "Learn how designers create content for social media, ads, and branding."
    },
    {
      id: 6,
      title: "Video Editing Basics (Real Creator Workflow)",
      video: "https://www.youtube.com/embed/7J7G6Xx9b2Q",
      content:
        "Learn how to edit videos like TikTok, YouTube Shorts, and ads."
    },
    {
      id: 7,
      title: "Motion & Animation (UI Effects)",
      video: "https://www.youtube.com/embed/4qf2kX1Z9aA",
      content:
        "Learn simple animations used in modern websites and apps."
    },

    /* =========================
       MINI CONTENT PROJECT
    ========================= */
    {
      id: 8,
      title: "Mini Project: Social Media Ad Design",
      video: "https://www.youtube.com/embed/1JtWc1b6i1A",
      content:
        "Create a full social media post or short video ad for a brand."
    },

    /* =========================
       PHASE 3: BRANDING & PORTFOLIO
    ========================= */
    {
      id: 9,
      title: "Brand Identity (Real Business Design)",
      video: "https://www.youtube.com/embed/5gqQ1X2Zp3A",
      content:
        "Learn how brands are created: logo, colors, fonts, and identity systems."
    },
    {
      id: 10,
      title: "Portfolio Design (Showcase Your Work)",
      video: "https://www.youtube.com/embed/7b3Gg0X1a2Q",
      content:
        "Learn how designers present their work to clients and companies."
    },
    {
      id: 11,
      title: "Advanced Editing (Professional Level Output)",
      video: "https://www.youtube.com/embed/6pQxX1k2Z9A",
      content:
        "Polish your designs and videos to professional quality."
    },

    /* =========================
       FINAL PROJECT
    ========================= */
    {
      id: 12,
      title: "Final Project: Full Brand + Portfolio Kit",
      video: "https://www.youtube.com/embed/UB1O30fR-EE",
      content:
        "Create a complete brand identity + portfolio showcasing your creative skills."
    }
  ]
},

 {
  title: "Backend Development",
  desc: "Node.js • Express • APIs • Databases • Authentication",
  courseKey: "backend-development",
  color: "#2ecc71",
  progress: 70,

  lessons: [

    /* =========================
       PHASE 1: BACKEND FOUNDATIONS
    ========================= */
    {
      id: 1,
      title: "How Backend Systems Work (Real Architecture)",
      video: "https://www.youtube.com/embed/TlB_eWDSMt4",
      content:
        "Understand how servers, APIs, databases, and clients communicate in real applications."
    },
    {
      id: 2,
      title: "Node.js Runtime (How Backend Code Runs)",
      video: "https://www.youtube.com/embed/3JluqTojuME",
      content:
        "Learn how Node.js handles requests using event-driven architecture."
    },
    {
      id: 3,
      title: "Express.js Setup (Real Server Building)",
      video: "https://www.youtube.com/embed/L72fhGm1tfE",
      content:
        "Build your first real backend server with routes and middleware."
    },

    /* =========================
       MINI BACKEND PROJECT 1
    ========================= */
    {
      id: 4,
      title: "Mini Project: Simple REST API",
      video: "https://www.youtube.com/embed/1JtWc1b6i1A",
      content:
        "Build a basic API that handles GET, POST, PUT, DELETE requests."
    },

    /* =========================
       PHASE 2: DATABASE SYSTEMS
    ========================= */
    {
      id: 5,
      title: "Databases Explained (MongoDB & SQL Thinking)",
      video: "https://www.youtube.com/embed/7S_tz1z_5bA",
      content:
        "Learn how real applications store and retrieve data."
    },
    {
      id: 6,
      title: "CRUD Operations (Create, Read, Update, Delete)",
      video: "https://www.youtube.com/embed/7CqJlxBYj-M",
      content:
        "Learn how to manage data inside a backend system."
    },
    {
      id: 7,
      title: "Connecting Node.js to Database",
      video: "https://www.youtube.com/embed/4qf2kX1Z9aA",
      content:
        "Build real backend apps that store user data in databases."
    },

    /* =========================
       MINI BACKEND PROJECT 2
    ========================= */
    {
      id: 8,
      title: "Mini Project: User Management API",
      video: "https://www.youtube.com/embed/5gqQ1X2Zp3A",
      content:
        "Build a system that creates users, updates profiles, and deletes accounts."
    },

    /* =========================
       PHASE 3: REAL WORLD BACKEND SYSTEMS
    ========================= */
    {
      id: 9,
      title: "Authentication (Login & Signup System)",
      video: "https://www.youtube.com/embed/7b3Gg0X1a2Q",
      content:
        "Learn how real apps handle secure login using JWT and hashing."
    },
    {
      id: 10,
      title: "Security Best Practices (Real Backend Safety)",
      video: "https://www.youtube.com/embed/6pQxX1k2Z9A",
      content:
        "Protect APIs from attacks, validate inputs, and secure data."
    },
    {
      id: 11,
      title: "Deployment (Make Your Backend Live)",
      video: "https://www.youtube.com/embed/swy9O0g2b4Y",
      content:
        "Deploy backend apps to Vercel, Render, or cloud servers."
    },

    /* =========================
       FINAL PROJECT
    ========================= */
    {
      id: 12,
      title: "Final Project: Full Authentication + API System",
      video: "https://www.youtube.com/embed/UB1O30fR-EE",
      content:
        "Build a complete backend system with login, database, and secure APIs like real production apps."
    }
  ]
},

{
  title: "Cybersecurity",
  desc: "Ethical Hacking • Network Security • System Defense • SOC Skills",
  courseKey: "cybersecurity",
  color: "#ff7675",
  progress: 40,

  lessons: [

    /* =========================
       PHASE 1: CYBERSECURITY FOUNDATIONS
    ========================= */
    {
      id: 1,
      title: "What is Cybersecurity (Real World Security Systems)",
      video: "https://www.youtube.com/embed/inWWhr5tnEA",
      content:
        "Understand how companies protect data, systems, and users from cyber threats."
    },
    {
      id: 2,
      title: "Types of Cyber Attacks (Real Threat Landscape)",
      video: "https://www.youtube.com/embed/7b3Gg0X1a2Q",
      content:
        "Learn about malware, phishing, ransomware, and hacking techniques used in real attacks."
    },
    {
      id: 3,
      title: "Passwords, Encryption & Secure Data",
      video: "https://www.youtube.com/embed/5kqQ1X2Zp3A",
      content:
        "Learn how data is protected using encryption and secure authentication systems."
    },

    /* =========================
       MINI SECURITY PROJECT 1
    ========================= */
    {
      id: 4,
      title: "Mini Project: Secure Login System Concept",
      video: "https://www.youtube.com/embed/1JtWc1b6i1A",
      content:
        "Understand how secure login systems protect users using hashing and tokens."
    },

    /* =========================
       PHASE 2: NETWORK SECURITY
    ========================= */
    {
      id: 5,
      title: "How Networks Work (Internet Infrastructure)",
      video: "https://www.youtube.com/embed/7S_tz1z_5bA",
      content:
        "Learn how data travels across networks and how the internet is structured."
    },
    {
      id: 6,
      title: "Firewalls & Protection Systems",
      video: "https://www.youtube.com/embed/4qf2kX1Z9aA",
      content:
        "Understand how firewalls block unwanted traffic and protect systems."
    },
    {
      id: 7,
      title: "Secure Communication (HTTPS & VPNs)",
      video: "https://www.youtube.com/embed/7CqJlxBYj-M",
      content:
        "Learn how secure connections protect sensitive data online."
    },

    /* =========================
       MINI SECURITY PROJECT 2
    ========================= */
    {
      id: 8,
      title: "Mini Project: Network Security Model",
      video: "https://www.youtube.com/embed/5gqQ1X2Zp3A",
      content:
        "Simulate how a secure network blocks threats and protects users."
    },

    /* =========================
       PHASE 3: REAL CYBERSECURITY PRACTICE
    ========================= */
    {
      id: 9,
      title: "System Security (Hardening Systems)",
      video: "https://www.youtube.com/embed/7J7G6Xx9b2Q",
      content:
        "Learn how systems are secured against unauthorized access and attacks."
    },
    {
      id: 10,
      title: "Ethical Hacking (Defensive Perspective)",
      video: "https://www.youtube.com/embed/6pQxX1k2Z9A",
      content:
        "Understand how ethical hackers test systems to find weaknesses safely."
    },
    {
      id: 11,
      title: "Risk Management & Incident Response",
      video: "https://www.youtube.com/embed/swy9O0g2b4Y",
      content:
        "Learn how companies respond when security breaches happen."
    },

    /* =========================
       FINAL PROJECT
    ========================= */
    {
      id: 12,
      title: "Final Project: Secure System Analysis Report",
      video: "https://www.youtube.com/embed/UB1O30fR-EE",
      content:
        "Analyze a system, identify vulnerabilities, and design a full security defense plan like a real cybersecurity analyst."
    }
  ]
},

{
  title: "Data Analysis",
  desc: "Excel • SQL • Python • Data Visualization • Business Insights",
  courseKey: "data-analysis",
  color: "#3498db",
  progress: 65,

  lessons: [

    /* =========================
       PHASE 1: DATA FOUNDATIONS
    ========================= */
    {
      id: 1,
      title: "What is Data Analysis (Real Business Use)",
      video: "https://www.youtube.com/embed/r-uOLxNrNk8",
      content:
        "Understand how companies like Amazon, Netflix, and banks use data to make decisions."
    },
    {
      id: 2,
      title: "Types of Data & Basic Statistics",
      video: "https://www.youtube.com/embed/7b3Gg0X1a2Q",
      content:
        "Learn structured vs unstructured data and basic statistical thinking."
    },
    {
      id: 3,
      title: "Excel for Data Analysis (Real Workplace Skill)",
      video: "https://www.youtube.com/embed/5kqQ1X2Zp3A",
      content:
        "Learn how analysts use Excel for real business reporting and calculations."
    },

    /* =========================
       MINI PROJECT 1
    ========================= */
    {
      id: 4,
      title: "Mini Project: Sales Data Analysis (Excel Report)",
      video: "https://www.youtube.com/embed/1JtWc1b6i1A",
      content:
        "Analyze a simple sales dataset and create charts and insights."
    },

    /* =========================
       PHASE 2: DATA PROCESSING & SQL
    ========================= */
    {
      id: 5,
      title: "Data Cleaning (Real Analyst Workflow)",
      video: "https://www.youtube.com/embed/7S_tz1z_5bA",
      content:
        "Learn how analysts clean messy data before analysis."
    },
    {
      id: 6,
      title: "SQL Basics (Database Querying)",
      video: "https://www.youtube.com/embed/7CqJlxBYj-M",
      content:
        "Learn how to extract and manipulate data using SQL."
    },
    {
      id: 7,
      title: "Data Visualization (Charts & Dashboards)",
      video: "https://www.youtube.com/embed/4qf2kX1Z9aA",
      content:
        "Learn how to turn data into visual insights using charts and dashboards."
    },

    /* =========================
       MINI PROJECT 2
    ========================= */
    {
      id: 8,
      title: "Mini Project: Business Dashboard",
      video: "https://www.youtube.com/embed/5gqQ1X2Zp3A",
      content:
        "Build a dashboard showing business performance insights."
    },

    /* =========================
       PHASE 3: ADVANCED ANALYTICS
    ========================= */
    {
      id: 9,
      title: "Python for Data Analysis (Pandas Basics)",
      video: "https://www.youtube.com/embed/_uQrJ0TkZlc",
      content:
        "Learn Python tools used by real data analysts (Pandas, NumPy basics)."
    },
    {
      id: 10,
      title: "Data Storytelling (Business Insights)",
      video: "https://www.youtube.com/embed/7J7G6Xx9b2Q",
      content:
        "Learn how to explain data findings to business teams clearly."
    },
    {
      id: 11,
      title: "Advanced Excel (Pivot Tables & Automation)",
      video: "https://www.youtube.com/embed/6pQxX1k2Z9A",
      content:
        "Master advanced Excel tools used in professional data jobs."
    },

    /* =========================
       FINAL PROJECT
    ========================= */
    {
      id: 12,
      title: "Final Project: Real Business Data Report",
      video: "https://www.youtube.com/embed/UB1O30fR-EE",
      content:
        "Analyze a full dataset, clean it, visualize it, and present insights like a professional data analyst."
    }
  ]
},

{
  title: "Finance & Business",
  desc: "Finance • Business Strategy • Entrepreneurship • Investment Basics",
  courseKey: "finance-business",
  color: "#f1c40f",
  progress: 45,

  lessons: [

    /* =========================
       PHASE 1: BUSINESS FOUNDATIONS
    ========================= */
    {
      id: 1,
      title: "How Businesses Work (Real Economy View)",
      video: "https://www.youtube.com/embed/3JluqTojuME",
      content:
        "Understand how companies are built, how they make money, and how markets operate."
    },
    {
      id: 2,
      title: "Money Flow & Financial Systems",
      video: "https://www.youtube.com/embed/7b3Gg0X1a2Q",
      content:
        "Learn how money moves between businesses, banks, and consumers."
    },
    {
      id: 3,
      title: "Basics of Accounting (Real Business Tracking)",
      video: "https://www.youtube.com/embed/5kqQ1X2Zp3A",
      content:
        "Learn how businesses track income, expenses, and profits."
    },

    /* =========================
       MINI BUSINESS PROJECT 1
    ========================= */
    {
      id: 4,
      title: "Mini Project: Simple Business Budget Plan",
      video: "https://www.youtube.com/embed/1JtWc1b6i1A",
      content:
        "Create a basic budget plan for a small business idea."
    },

    /* =========================
       PHASE 2: BUSINESS STRATEGY & GROWTH
    ========================= */
    {
      id: 5,
      title: "Business Models (How Companies Make Money)",
      video: "https://www.youtube.com/embed/7S_tz1z_5bA",
      content:
        "Learn different ways businesses generate revenue (subscription, e-commerce, services)."
    },
    {
      id: 6,
      title: "Marketing Strategy (Customer Growth)",
      video: "https://www.youtube.com/embed/4qf2kX1Z9aA",
      content:
        "Understand how businesses attract and retain customers."
    },
    {
      id: 7,
      title: "Financial Statements (Profit & Loss)",
      video: "https://www.youtube.com/embed/7CqJlxBYj-M",
      content:
        "Learn how to read income statements, balance sheets, and cash flow reports."
    },

    /* =========================
       MINI BUSINESS PROJECT 2
    ========================= */
    {
      id: 8,
      title: "Mini Project: Startup Idea Analysis",
      video: "https://www.youtube.com/embed/5gqQ1X2Zp3A",
      content:
        "Analyze a startup idea and evaluate its profit potential."
    },

    /* =========================
       PHASE 3: REAL WORLD FINANCE
    ========================= */
    {
      id: 9,
      title: "Investment Basics (Stocks & Assets)",
      video: "https://www.youtube.com/embed/7J7G6Xx9b2Q",
      content:
        "Learn how investing works and how people grow wealth over time."
    },
    {
      id: 10,
      title: "Risk Management (Business Safety)",
      video: "https://www.youtube.com/embed/6pQxX1k2Z9A",
      content:
        "Learn how businesses handle risks and avoid financial loss."
    },
    {
      id: 11,
      title: "Entrepreneurship (Building Your Own Business)",
      video: "https://www.youtube.com/embed/swy9O0g2b4Y",
      content:
        "Learn how to turn ideas into real businesses and startups."
    },

    /* =========================
       FINAL PROJECT
    ========================= */
    {
      id: 12,
      title: "Final Project: Full Business Plan + Pitch",
      video: "https://www.youtube.com/embed/UB1O30fR-EE",
      content:
        "Create a complete business plan including idea, market research, budget, and growth strategy like a real startup founder."
    }
  ]
}
];

/* =========================
   CORS
========================= */
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

/* =========================
   API HANDLER
========================= */
export default function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(200).end();

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

    /* =========================
       FIXED COURSE MATCHING
       (IMPORTANT: must use user.track OR user.course)
    ========================= */
    const activeCourseKey =
      (user.track || user.course || "")
        .toLowerCase()
        .trim();

    const activeCourse = courses.find(
      (c) => c.courseKey === activeCourseKey
    );

    const relatedCourses = courses.filter(
      (c) => c.courseKey !== activeCourseKey
    );

    return res.status(200).json({
      activeCourse: activeCourse || null,
      relatedCourses
    });

  } catch (err) {
    console.error("COURSE API ERROR:", err);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}