import mongoose from "mongoose";
import dotenv from "dotenv";
import Quiz from "./models/Quiz.js"; 

dotenv.config();

/* =========================
   CONNECT DATABASE
========================= */
const connectDB = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    console.log("👉 URI:", process.env.MONGODB_URI);

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    if (mongoose.connection.readyState === 1) return;

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB Connected Successfully");

  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
    process.exit(1);
  }
};

/* =========================
   QUIZ DATA
========================= */
const quizzes = [
 {
  courseId: "frontend-development",
  topicIndex: 0,
  title: "Intro to Web",
  questions: [
    {
      question: "What is the internet mainly used for?",
      options: ["Connecting computers worldwide", "Designing logos", "Offline storage", "Editing videos"],
      answer: 0
    },
    {
      question: "What is a web browser?",
      options: ["Software to access websites", "A programming language", "A database", "A server"],
      answer: 0
    },
    {
      question: "Which of these is a browser?",
      options: ["Chrome", "Photoshop", "Excel", "Word"],
      answer: 0
    },
    {
      question: "What does a browser do?",
      options: ["Displays web pages", "Creates hardware", "Stores electricity", "Runs servers"],
      answer: 0
    },
    {
      question: "What is a website?",
      options: ["Collection of web pages", "A single image", "A computer", "A software update"],
      answer: 0
    },
    {
      question: "What connects websites together?",
      options: ["Internet", "USB cable", "RAM", "Keyboard"],
      answer: 0
    },
    {
      question: "What is a URL?",
      options: ["Web address", "Computer memory", "Programming tool", "Image format"],
      answer: 0
    },
    {
      question: "What happens first when you open a website?",
      options: ["Browser sends request", "Computer shuts down", "File deletes", "Screen breaks"],
      answer: 0
    },
    {
      question: "What is a server?",
      options: ["Computer that responds to requests", "A browser", "A website design tool", "A monitor"],
      answer: 0
    },
    {
      question: "What does HTTP stand for?",
      options: ["HyperText Transfer Protocol", "High Text Transfer Program", "Home Tool Text Process", "None"],
      answer: 0
    }
  ]
},

 {
  courseId: "frontend-development",
  topicIndex: 1,
  title: "HTML Basics",
  questions: [
    {
      question: "What does HTML stand for?",
      options: ["Hyper Text Markup Language", "High Text Machine Language", "Home Tool Markup Language", "None"],
      answer: 0
    },
    {
      question: "What is HTML used for?",
      options: ["Structuring web pages", "Styling pages", "Database", "Networking"],
      answer: 0
    },
    {
      question: "Which tag creates a heading?",
      options: ["<h1>", "<p>", "<div>", "<span>"],
      answer: 0
    },
    {
      question: "Which tag is used for paragraphs?",
      options: ["<p>", "<h1>", "<img>", "<a>"],
      answer: 0
    },
    {
      question: "Which tag creates a link?",
      options: ["<a>", "<link>", "<href>", "<url>"],
      answer: 0
    },
    {
      question: "Which tag inserts an image?",
      options: ["<img>", "<image>", "<pic>", "<src>"],
      answer: 0
    },
    {
      question: "HTML files end with?",
      options: [".html", ".css", ".js", ".txt"],
      answer: 0
    },
    {
      question: "Which tag creates a list?",
      options: ["<ul>", "<list>", "<ol>", "<lii>"],
      answer: 0
    },
    {
      question: "Which tag is for line break?",
      options: ["<br>", "<break>", "<lb>", "<line>"],
      answer: 0
    },
    {
      question: "HTML is a ___ language?",
      options: ["Markup", "Programming", "Database", "Styling"],
      answer: 0
    }
  ]
},


{
  courseId: "frontend-development",
  topicIndex: 2,
  title: "CSS Styling",
  questions: [
    {
      question: "What does CSS stand for?",
      options: ["Cascading Style Sheets", "Creative Style System", "Computer Style Syntax", "None"],
      answer: 0
    },
    {
      question: "CSS is used for?",
      options: ["Styling web pages", "Structuring pages", "Database", "Logic"],
      answer: 0
    },
    {
      question: "How do you change text color?",
      options: ["color", "text-color", "font-color", "style-color"],
      answer: 0
    },
    {
      question: "Which symbol is used for class in CSS?",
      options: [".", "#", "$", "*"],
      answer: 0
    },
    {
      question: "Which symbol is used for id?",
      options: ["#", ".", "@", "&"],
      answer: 0
    },
    {
      question: "What does margin do?",
      options: ["Space outside element", "Inside element", "Deletes element", "Adds image"],
      answer: 0
    },
    {
      question: "What does padding do?",
      options: ["Space inside element", "Outside element", "Deletes text", "Adds border only"],
      answer: 0
    },
    {
      question: "Which property changes background color?",
      options: ["background-color", "bg-color", "color-bg", "background-style"],
      answer: 0
    },
    {
      question: "CSS file extension is?",
      options: [".css", ".html", ".js", ".style"],
      answer: 0
    },
    {
      question: "CSS is used with?",
      options: ["HTML", "Python", "C++", "SQL"],
      answer: 0
    }
  ]
},

{
  courseId: "frontend-development",
  topicIndex: 3,
  title: "Mini Project",
  questions: [
    {
      question: "What is the purpose of a mini project?",
      options: ["Practice skills learned", "Delete code", "Skip learning", "Install software"],
      answer: 0
    },
    {
      question: "What should a mini project help you do?",
      options: ["Build confidence", "Break system", "Only watch videos", "Avoid coding"],
      answer: 0
    },
    {
      question: "Which is an example of a mini project?",
      options: ["To-do list app", "Washing machine", "Car engine", "Bank ATM hardware"],
      answer: 0
    },
    {
      question: "Mini projects are mainly for?",
      options: ["Practice", "Decoration", "Storage", "Gaming only"],
      answer: 0
    },
    {
      question: "What skill improves most from mini projects?",
      options: ["Problem solving", "Sleeping", "Watching TV", "Scrolling"],
      answer: 0
    },
    {
      question: "Mini projects usually use?",
      options: ["HTML, CSS, JS", "Only Excel", "Only Word", "No tools"],
      answer: 0
    },
    {
      question: "What should you do after finishing a mini project?",
      options: ["Review and improve", "Delete it", "Ignore it", "Stop learning"],
      answer: 0
    },
    {
      question: "Mini projects help you prepare for?",
      options: ["Real-world projects", "Nothing", "Gaming", "Hardware repair"],
      answer: 0
    },
    {
      question: "Best mindset for mini projects?",
      options: ["Practice and learn", "Rush and skip", "Avoid errors", "No coding"],
      answer: 0
    },
    {
      question: "Mini projects improve?",
      options: ["Confidence in coding", "Fear of coding", "Confusion", "Nothing"],
      answer: 0
    }
  ]
},


{
  courseId: "frontend-development",
  topicIndex: 4,
  title: "JavaScript Basics",
  questions: [
    {
      question: "What is JavaScript used for?",
      options: ["Interactivity", "Styling", "Database", "Hardware"],
      answer: 0
    },
    {
      question: "Which keyword declares a variable?",
      options: ["let", "html", "css", "div"],
      answer: 0
    },
    {
      question: "Which symbol is used for strict equality?",
      options: ["===", "==", "=", "!="],
      answer: 0
    },
    {
      question: "JavaScript runs in?",
      options: ["Browser", "Printer", "Monitor", "Mouse"],
      answer: 0
    },
    {
      question: "What is a function?",
      options: ["Reusable block of code", "Image", "File", "Database"],
      answer: 0
    },
    {
      question: "Which is correct variable declaration?",
      options: ["let x = 5", "html x = 5", "var-css = 5", "define x"],
      answer: 0
    },
    {
      question: "JavaScript is?",
      options: ["Programming language", "Markup language", "Style sheet", "Database"],
      answer: 0
    },
    {
      question: "What does console.log do?",
      options: ["Print output", "Delete file", "Style page", "Create HTML"],
      answer: 0
    },
    {
      question: "Which is NOT a JS data type?",
      options: ["heading", "string", "number", "boolean"],
      answer: 0
    },
    {
      question: "JavaScript is mainly used for?",
      options: ["Frontend logic", "Styling", "Hardware", "Networking only"],
      answer: 0
    }
  ]
},


{
  courseId: "frontend-development",
  topicIndex: 5,
  title: "DOM Manipulation",
  questions: [
    {
      question: "What does DOM stand for?",
      options: ["Document Object Model", "Data Object Model", "Digital Output Mode", "None"],
      answer: 0
    },
    {
      question: "DOM represents?",
      options: ["Web page structure", "Database", "Server", "CSS file"],
      answer: 0
    },
    {
      question: "Which method selects an element by ID?",
      options: ["getElementById", "queryText", "selectAll", "findNode"],
      answer: 0
    },
    {
      question: "DOM allows you to?",
      options: ["Change webpage dynamically", "Only read files", "Edit hardware", "Compile code"],
      answer: 0
    },
    {
      question: "Which is correct?",
      options: ["document.querySelector()", "html.select()", "css.find()", "dom.get()"],
      answer: 0
    },
    {
      question: "DOM is part of?",
      options: ["Browser", "Server", "Database", "Hardware"],
      answer: 0
    },
    {
      question: "You can change text using DOM with?",
      options: ["innerText", "font-style", "text-css", "changeText()"],
      answer: 0
    },
    {
      question: "DOM works with?",
      options: ["HTML", "Only images", "Only CSS", "Hardware"],
      answer: 0
    },
    {
      question: "DOM manipulation is done using?",
      options: ["JavaScript", "C++ only", "Excel", "Photoshop"],
      answer: 0
    },
    {
      question: "What happens when DOM is updated?",
      options: ["Webpage changes live", "Computer shuts down", "File deletes", "Nothing"],
      answer: 0
    }
  ]
},

{
  courseId: "frontend-development",
  topicIndex: 6,
  title: "Events & Animations",
  questions: [
    {
      question: "What is a JavaScript event?",
      options: ["User action like click", "Database", "File system", "Server"],
      answer: 0
    },
    {
      question: "Which is an event?",
      options: ["click", "style", "html", "css"],
      answer: 0
    },
    {
      question: "What triggers a click event?",
      options: ["Mouse click", "Page load only", "File save", "CSS change"],
      answer: 0
    },
    {
      question: "What are animations used for?",
      options: ["Visual effects", "Database storage", "Networking", "Security"],
      answer: 0
    },
    {
      question: "Which property is used for animation?",
      options: ["animation", "text", "color", "font"],
      answer: 0
    },
    {
      question: "Events are handled using?",
      options: ["JavaScript", "HTML only", "CSS only", "SQL"],
      answer: 0
    },
    {
      question: "Mouse hover is what type of event?",
      options: ["Interaction event", "File event", "Server event", "System event"],
      answer: 0
    },
    {
      question: "Animations improve?",
      options: ["User experience", "Database speed", "Server power", "Hardware"],
      answer: 0
    },
    {
      question: "Which function listens to events?",
      options: ["addEventListener", "getElement", "styleChange", "runEvent"],
      answer: 0
    },
    {
      question: "Events make websites?",
      options: ["Interactive", "Static only", "Broken", "Offline"],
      answer: 0
    }
  ]
},

{
  courseId: "frontend-development",
  topicIndex: 7,
  title: "Mini App",
  questions: [
    {
      question: "What is a mini app?",
      options: ["Small functional application", "Operating system", "Database", "Hardware"],
      answer: 0
    },
    {
      question: "Mini apps are built using?",
      options: ["HTML, CSS, JS", "Only Excel", "Only Word", "Photoshop"],
      answer: 0
    },
    {
      question: "Example of mini app?",
      options: ["Calculator", "Fridge", "Car engine", "TV remote"],
      answer: 0
    },
    {
      question: "Mini apps are used for?",
      options: ["Simple tasks", "Hardware repair", "Networking", "Printing only"],
      answer: 0
    },
    {
      question: "Mini apps improve?",
      options: ["Coding skills", "Hardware skills", "Painting skills", "Driving"],
      answer: 0
    },
    {
      question: "Mini apps usually run in?",
      options: ["Browser", "Fridge", "TV only", "Printer"],
      answer: 0
    },
    {
      question: "Mini apps help you learn?",
      options: ["Real-world logic", "Cooking", "Driving", "Painting"],
      answer: 0
    },
    {
      question: "Which is a mini app feature?",
      options: ["Simple UI", "Complex hardware", "No logic", "Offline only"],
      answer: 0
    },
    {
      question: "Mini apps use?",
      options: ["JavaScript logic", "Only images", "Only videos", "No code"],
      answer: 0
    },
    {
      question: "Mini apps prepare you for?",
      options: ["Real projects", "Nothing", "Gaming only", "Hardware repair"],
      answer: 0
    }
  ]
},


{
  courseId: "frontend-development",
  topicIndex: 8,
  title: "UI/UX Basics",
  questions: [
    {
      question: "What does UI stand for?",
      options: ["User Interface", "User Internet", "Universal Input", "None"],
      answer: 0
    },
    {
      question: "UX focuses on?",
      options: ["User experience", "Server speed", "Database design", "Hardware"],
      answer: 0
    },
    {
      question: "Good UI means?",
      options: ["Easy to use design", "Complex system", "Broken layout", "Slow app"],
      answer: 0
    },
    {
      question: "UX improves?",
      options: ["User satisfaction", "Server power", "Hardware speed", "Code size"],
      answer: 0
    },
    {
      question: "UI is about?",
      options: ["Visual design", "Database", "Backend logic", "Networking"],
      answer: 0
    },
    {
      question: "UX is about?",
      options: ["User journey", "Server code", "Hardware design", "CSS only"],
      answer: 0
    },
    {
      question: "Good UI should be?",
      options: ["Simple and clear", "Confusing", "Slow", "Heavy"],
      answer: 0
    },
    {
      question: "UI uses?",
      options: ["Colors and layout", "Only code", "Only server", "Hardware"],
      answer: 0
    },
    {
      question: "UX design is tested by?",
      options: ["Users", "Servers", "Database", "CSS"],
      answer: 0
    },
    {
      question: "UI/UX improves?",
      options: ["Product experience", "Hardware", "Internet speed", "CPU power"],
      answer: 0
    }
  ]
},

{
  courseId: "frontend-development",
  topicIndex: 9,
  title: "Git & Version Control",
  questions: [
    {
      question: "What is Git used for?",
      options: ["Tracking code changes", "Designing websites", "Running browsers", "Editing images"],
      answer: 0
    },
    {
      question: "What does version control mean?",
      options: [
        "Tracking changes in files over time",
        "Deleting old files",
        "Styling web pages",
        "Running servers"
      ],
      answer: 0
    },
    {
      question: "Which command initializes a Git repo?",
      options: ["git init", "git start", "git run", "git create"],
      answer: 0
    },
    {
      question: "What does 'git add' do?",
      options: [
        "Stages changes for commit",
        "Deletes files",
        "Runs code",
        "Uploads website"
      ],
      answer: 0
    },
    {
      question: "What does 'git commit' do?",
      options: [
        "Saves changes",
        "Deletes repo",
        "Styles code",
        "Runs server"
      ],
      answer: 0
    },
    {
      question: "What is GitHub?",
      options: [
        "Online Git repository hosting service",
        "A programming language",
        "A browser",
        "A database"
      ],
      answer: 0
    },
    {
      question: "What is a repository?",
      options: [
        "Project folder tracked by Git",
        "Browser tab",
        "CSS file",
        "Image file"
      ],
      answer: 0
    },
    {
      question: "What does 'git push' do?",
      options: [
        "Uploads code to remote repo",
        "Deletes code",
        "Runs code locally",
        "Formats files"
      ],
      answer: 0
    },
    {
      question: "What does 'git pull' do?",
      options: [
        "Downloads updates from remote repo",
        "Deletes files",
        "Creates repo",
        "Styles code"
      ],
      answer: 0
    },
    {
      question: "Why is Git important?",
      options: [
        "Collaboration and version tracking",
        "Only for design",
        "Only for gaming",
        "Only for servers"
      ],
      answer: 0
    }
  ]
},


{
  courseId: "frontend-development",
  topicIndex: 10,
  title: "Deployment",
  questions: [
    {
      question: "What is deployment?",
      options: [
        "Making a website live on the internet",
        "Deleting a project",
        "Writing code only",
        "Designing UI"
      ],
      answer: 0
    },
    {
      question: "Where can you deploy websites?",
      options: [
        "Vercel / Netlify",
        "Notepad",
        "Excel",
        "Photoshop"
      ],
      answer: 0
    },
    {
      question: "What is hosting?",
      options: [
        "Making website available online",
        "Editing images",
        "Writing CSS",
        "Deleting files"
      ],
      answer: 0
    },
    {
      question: "What is a domain name?",
      options: [
        "Website address",
        "Computer hardware",
        "CSS file",
        "Server code"
      ],
      answer: 0
    },
    {
      question: "What does build mean in deployment?",
      options: [
        "Preparing code for production",
        "Deleting project",
        "Writing notes",
        "Drawing UI"
      ],
      answer: 0
    },
    {
      question: "Which tool is used for deployment?",
      options: ["Vercel", "Paint", "Word", "Excel"],
      answer: 0
    },
    {
      question: "Why deploy a website?",
      options: [
        "To make it accessible online",
        "To delete it",
        "To hide it",
        "To compress files only"
      ],
      answer: 0
    },
    {
      question: "What is a live website?",
      options: [
        "A website accessible on the internet",
        "A local file only",
        "A screenshot",
        "A PDF"
      ],
      answer: 0
    },
    {
      question: "What is production environment?",
      options: [
        "Live version of website",
        "Code editor",
        "Local folder",
        "Browser extension"
      ],
      answer: 0
    },
    {
      question: "Deployment connects code to?",
      options: ["Internet users", "Printer", "Photoshop", "Offline files"],
      answer: 0
    }
  ]
},

{
  courseId: "frontend-development",
  topicIndex: 11,
  title: "Final Project",
  questions: [
    {
      question: "What is a final project?",
      options: [
        "A complete real-world application",
        "A small note",
        "A deleted file",
        "A design image"
      ],
      answer: 0
    },
    {
      question: "Final projects test what?",
      options: [
        "All skills learned",
        "Only CSS",
        "Only HTML",
        "Only images"
      ],
      answer: 0
    },
    {
      question: "What should a final project demonstrate?",
      options: [
        "Problem-solving skills",
        "Gaming skills",
        "Drawing skills",
        "Typing speed only"
      ],
      answer: 0
    },
    {
      question: "Which is an example of a final project?",
      options: [
        "Portfolio website",
        "Calculator hardware",
        "Paint drawing",
        "Excel sheet only"
      ],
      answer: 0
    },
    {
      question: "Final projects are usually?",
      options: [
        "Full applications",
        "Simple notes",
        "Images only",
        "Empty files"
      ],
      answer: 0
    },
    {
      question: "What technologies are used in final projects?",
      options: [
        "HTML, CSS, JS",
        "Only Word",
        "Only Excel",
        "Only PowerPoint"
      ],
      answer: 0
    },
    {
      question: "Why build final projects?",
      options: [
        "To show real skills",
        "To delete code",
        "To stop learning",
        "To play games"
      ],
      answer: 0
    },
    {
      question: "Final projects help you prepare for?",
      options: [
        "Job opportunities",
        "Gaming careers",
        "Nothing",
        "Hardware repair"
      ],
      answer: 0
    },
    {
      question: "What is important in a final project?",
      options: [
        "Clean and functional code",
        "Random files",
        "Broken UI",
        "No logic"
      ],
      answer: 0
    },
    {
      question: "Final project shows your?",
      options: [
        "Overall understanding",
        "Gaming skill",
        "Typing speed",
        "Internet speed"
      ],
      answer: 0
    }
  ]
},

  {
    courseId: "backend-development",
    topicIndex: 0,
    title: "Backend Basics",
    questions: [
      {
        question: "Node.js is used for?",
        options: [
          "Frontend design",
          "Backend development",
          "Graphic design",
          "Gaming"
        ],
        answer: 1
      }
    ]
  }
];

/* =========================
   SEED FUNCTION (SAFE + DEBUG)
========================= */
const seedQuizzes = async () => {
  try {
    await connectDB();

    console.log("📥 Seeding quizzes...");

    let count = 0;

    for (const quiz of quizzes) {
      const result = await Quiz.updateOne(
        { courseId: quiz.courseId, topicIndex: quiz.topicIndex },
        { $set: quiz },
        { upsert: true }
      );

      console.log(
        `✔ ${quiz.courseId} topic ${quiz.topicIndex} -> upserted:`,
        result.upsertedCount || 0
      );

      count++;
    }

    console.log(`🔥 Done! ${count} quizzes processed`);
    process.exit();

  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

/* =========================
   RUN SEEDER
========================= */
seedQuizzes();