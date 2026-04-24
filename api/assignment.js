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

  const { courseKey, lesson, previousSubmission, getDemoAnswers } = req.body;

  if (!courseKey || !lesson?.id) {
    return res.status(400).json({ message: "Missing courseKey or lesson" });
  }

  const lessonId = Number(lesson.id);
  const lessonTitle = lesson.title || "Untitled Lesson";
  const hasPreviousWork = previousSubmission && previousSubmission.code;
  const wantDemoAnswers = getDemoAnswers === true;

  // =========================
  // DEMO ANSWERS FOR STUDENTS (Quality examples)
  // =========================
  const demoAnswers = {
    // Reflection demo answers
    demoReflections: [
      "I chose this approach because it provides a clean, maintainable structure that separates concerns. Using semantic HTML and modern CSS techniques ensures the code is both readable and performant. The component-based thinking helps with scalability and makes the code easier to debug and maintain in the long run.",
      "The main challenge was making the layout responsive across different devices. I solved this by using CSS Grid for the overall structure and Flexbox for component alignment. Media queries helped fine-tune the breakpoints for mobile, tablet, and desktop views. Testing on real devices helped identify edge cases.",
      "Next time I would add more interactive features using JavaScript, implement dark mode for better user experience, and optimize images for faster loading. I'd also add unit tests to ensure reliability, implement lazy loading for better performance, and consider using a CSS framework for faster development."
    ],
    
    // Follow-up demo answers
    demoFollowups: [
      "The most important concept was understanding how the browser renders pages and how CSS layout algorithms work. This knowledge helps debug layout issues and create more efficient designs. Understanding the box model, positioning contexts, and stacking contexts has been crucial for creating complex layouts.",
      "I would apply this by building a complete portfolio website for a client, ensuring it's accessible, performant, and responsive. The same principles apply to e-commerce sites, web applications, and content-heavy websites. Using proper semantic HTML improves SEO and accessibility.",
      "Next, I want to learn about advanced JavaScript frameworks like React, state management with Redux, and backend integration with Node.js. I'm also interested in learning about web performance optimization, Core Web Vitals, and progressive web apps (PWAs)."
    ],
    
    // Demo code template
    demoTemplate: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Web Design Demo</title>
  <style>
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: #333;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    /* Header styles */
    header {
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    nav ul {
      display: flex;
      gap: 20px;
      list-style: none;
      justify-content: center;
      flex-wrap: wrap;
    }

    nav a {
      color: #667eea;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 10px;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    nav a:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
    }

    /* Hero section */
    .hero {
      text-align: center;
      padding: 60px 20px;
      background: rgba(255,255,255,0.95);
      border-radius: 30px;
      margin-bottom: 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .hero h1 {
      font-size: 3rem;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero p {
      font-size: 1.2rem;
      color: #666;
      margin-bottom: 30px;
    }

    /* Grid layout */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }

    /* Card component */
    .card {
      background: white;
      padding: 30px;
      border-radius: 20px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .card h3 {
      color: #667eea;
      margin-bottom: 15px;
      font-size: 1.5rem;
    }

    .card p {
      color: #666;
      line-height: 1.6;
    }

    /* Button styles */
    .btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn:hover {
      transform: scale(1.05);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    /* Footer */
    footer {
      text-align: center;
      padding: 30px;
      background: rgba(255,255,255,0.95);
      border-radius: 20px;
      margin-top: 20px;
      color: #666;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2rem;
      }
      
      .hero p {
        font-size: 1rem;
      }
      
      nav ul {
        flex-direction: column;
        align-items: center;
      }
      
      .grid {
        grid-template-columns: 1fr;
      }
      
      .container {
        padding: 10px;
      }
    }

    /* Accessibility improvements */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* Focus styles for keyboard navigation */
    :focus-visible {
      outline: 3px solid #667eea;
      outline-offset: 2px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="#" aria-current="page">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">Portfolio</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
    </header>
    
    <main>
      <section class="hero" aria-label="Hero section">
        <h1>Welcome to Modern Web Development</h1>
        <p>Building responsive, accessible, and performant websites for the modern web</p>
        <button class="btn" onclick="handleClick()" aria-label="Get started button">
          Get Started
        </button>
      </section>
      
      <section class="grid" aria-label="Features section">
        <article class="card">
          <h3>📱 Responsive Design</h3>
          <p>Works seamlessly on all devices from mobile phones to desktop computers with fluid layouts and flexible components.</p>
        </article>
        
        <article class="card">
          <h3>🎨 Modern CSS</h3>
          <p>Using CSS Grid, Flexbox, and modern CSS features to create beautiful, maintainable layouts with less code.</p>
        </article>
        
        <article class="card">
          <h3>⚡ Interactive Features</h3>
          <p>JavaScript-powered interactions that enhance user experience without compromising performance or accessibility.</p>
        </article>
        
        <article class="card">
          <h3>♿ Accessibility First</h3>
          <p>Built with WCAG guidelines in mind, ensuring everyone can access and navigate your content effectively.</p>
        </article>
      </section>
    </main>
    
    <footer>
      <p>&copy; 2024 Modern Web Development. All rights reserved.</p>
      <p>Built with ❤️ using semantic HTML, modern CSS, and best practices</p>
    </footer>
  </div>

  <script>
    function handleClick() {
      // Interactive button handler
      alert('Welcome! This is a demonstration of interactive features.');
      console.log('Button clicked at:', new Date().toISOString());
    }
    
    // Optional: Add console log for development
    console.log('Page loaded successfully with responsive design');
  </script>
</body>
</html>`
  };

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
        ],
        demoCode: demoAnswers.demoTemplate,
        demoReflections: demoAnswers.demoReflections,
        demoFollowups: demoAnswers.demoFollowups
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
        ],
        demoCode: demoAnswers.demoTemplate,
        demoReflections: demoAnswers.demoReflections,
        demoFollowups: demoAnswers.demoFollowups
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
        ],
        demoCode: demoAnswers.demoTemplate,
        demoReflections: demoAnswers.demoReflections,
        demoFollowups: demoAnswers.demoFollowups
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
        ],
        demoCode: demoAnswers.demoTemplate,
        demoReflections: demoAnswers.demoReflections,
        demoFollowups: demoAnswers.demoFollowups
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
        ],
        demoCode: `// JavaScript Calculator Demo
class Calculator {
  constructor() {
    this.currentValue = 0;
    this.previousValue = null;
    this.operation = null;
    this.shouldResetScreen = false;
  }

  appendNumber(number) {
    if (this.shouldResetScreen) {
      this.clearScreen();
      this.shouldResetScreen = false;
    }
    this.currentValue = this.currentValue === 0 ? number : this.currentValue + number;
    this.updateDisplay();
  }

  chooseOperation(operation) {
    if (this.currentValue === null) return;
    if (this.previousValue !== null) {
      this.compute();
    }
    this.operation = operation;
    this.previousValue = this.currentValue;
    this.currentValue = null;
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousValue);
    const current = parseFloat(this.currentValue);
    if (isNaN(prev) || isNaN(current)) return;
    
    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        computation = prev - current;
        break;
      case '*':
        computation = prev * current;
        break;
      case '/':
        computation = prev / current;
        break;
      default:
        return;
    }
    this.currentValue = computation;
    this.operation = null;
    this.previousValue = null;
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  clear() {
    this.currentValue = 0;
    this.previousValue = null;
    this.operation = null;
    this.updateDisplay();
  }

  updateDisplay() {
    console.log('Current value:', this.currentValue);
    // In a real app, update DOM here
  }
}

// Usage example
const calc = new Calculator();
calc.appendNumber('5');
calc.chooseOperation('+');
calc.appendNumber('3');
calc.compute(); // Outputs: 8
`,
        demoReflections: [
          "I chose a class-based architecture because it provides encapsulation and makes the code more maintainable. Using a class allows me to keep state private and methods organized, which is especially useful for complex calculations.",
          "The main challenge was handling edge cases like division by zero and decimal precision. I solved this by validating inputs before operations and using proper type checking. Error handling was implemented to prevent crashes.",
          "Next time I would add more mathematical functions (square root, percentage), keyboard support, and save calculation history. I'd also add unit tests and improve the UI with better feedback."
        ],
        demoFollowups: [
          "=== compares values with type coercion, while === compares both value and type without coercion. Always use === to avoid unexpected type conversions.",
          "Event delegation attaches a single event listener to a parent element instead of individual children. This improves performance and handles dynamically added elements efficiently.",
          "Closures are useful for creating private variables, function factories, and maintaining state in callbacks. They're commonly used in module patterns and React hooks."
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
        ],
        demoCode: demoAnswers.demoTemplate,
        demoReflections: demoAnswers.demoReflections,
        demoFollowups: demoAnswers.demoFollowups
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
        ],
        demoCode: `// API Integration Demo
async function fetchWeatherData(city) {
  const API_KEY = 'your-api-key-here';
  const url = \`https://api.openweathermap.org/data/2.5/weather?q=\${city}&appid=\${API_KEY}\`;
  
  try {
    // Show loading state
    showLoading(true);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const data = await response.json();
    displayWeatherData(data);
    
    // Cache the response
    localStorage.setItem(\`weather_\${city}\`, JSON.stringify({
      data: data,
      timestamp: Date.now()
    }));
    
  } catch (error) {
    console.error('API Error:', error);
    showError('Failed to fetch weather data. Please try again.');
    
    // Try to get from cache
    const cached = localStorage.getItem(\`weather_\${city}\`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const isRecent = (Date.now() - timestamp) < 3600000; // 1 hour
      if (isRecent) {
        displayWeatherData(data);
        showMessage('Showing cached data (offline mode)');
      }
    }
  } finally {
    showLoading(false);
  }
}

function displayWeatherData(data) {
  const container = document.getElementById('weather-container');
  container.innerHTML = \`
    <h3>Weather in \${data.name}</h3>
    <p>Temperature: \${Math.round(data.main.temp - 273.15)}°C</p>
    <p>Condition: \${data.weather[0].description}</p>
    <p>Humidity: \${data.main.humidity}%</p>
  \`;
}

// Usage
fetchWeatherData('London');
`,
        demoReflections: [
          "I chose the OpenWeatherMap API because it's free, well-documented, and provides reliable weather data. It has good CORS support and doesn't require complex authentication for basic usage.",
          "The main async challenge was handling race conditions where multiple API calls could complete out of order. I solved this by using abort controllers and proper state management to ensure the latest request updates the UI.",
          "For offline support, I would implement a service worker to cache API responses, use IndexedDB for larger datasets, and provide a 'last known' state when offline. Background sync could queue requests for when connection returns."
        ],
        demoFollowups: [
          "Always use try-catch blocks with async/await, check response.ok status, show user-friendly error messages, and implement retry logic with exponential backoff for transient errors.",
          "async/await is syntactic sugar over Promises, making code more readable and easier to debug. Promises are the underlying mechanism, while async/await provides a synchronous-looking syntax.",
          "Cache API responses in localStorage for simple data, IndexedDB for larger datasets, or use a service worker for more advanced caching strategies. Always set cache expiration times and invalidate stale data."
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
        ],
        demoCode: `// Todo App with Local Storage
class TodoApp {
  constructor() {
    this.todos = this.loadTodos();
    this.bindEvents();
    this.render();
  }

  loadTodos() {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  }

  saveTodos() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  addTodo(text) {
    const todo = {
      id: Date.now(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    };
    this.todos.push(todo);
    this.saveTodos();
    this.render();
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.saveTodos();
    this.render();
  }

  toggleTodo(id) {
    const todo = this.todos.find(todo => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
      this.render();
    }
  }

  filterTodos(filter) {
    let filtered = [...this.todos];
    switch(filter) {
      case 'active':
        filtered = this.todos.filter(t => !t.completed);
        break;
      case 'completed':
        filtered = this.todos.filter(t => t.completed);
        break;
      default:
        break;
    }
    this.render(filtered);
  }

  render(filteredTodos = null) {
    const todoList = document.getElementById('todo-list');
    const todos = filteredTodos || this.todos;
    
    todoList.innerHTML = todos.map(todo => \`
      <li class="todo-item \${todo.completed ? 'completed' : ''}" data-id="\${todo.id}">
        <input type="checkbox" \${todo.completed ? 'checked' : ''}>
        <span class="todo-text">\${escapeHtml(todo.text)}</span>
        <button class="delete-btn">Delete</button>
      </li>
    \`).join('');
  }

  bindEvents() {
    const form = document.getElementById('todo-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('todo-input');
      if (input.value.trim()) {
        this.addTodo(input.value.trim());
        input.value = '';
      }
    });
  }
}

// Initialize app
const app = new TodoApp();
`,
        demoReflections: [
          "I chose a class-based MVC-like architecture to separate concerns and make the code more maintainable. The TodoApp class handles data, logic, and rendering, while the DOM handles presentation.",
          "State management was challenging because the UI needed to sync with data changes. I solved this by centralizing state in the class and re-rendering on any change, which ensures consistency.",
          "To add user accounts, I'd implement authentication (JWT), replace localStorage with a backend API, add user-specific collections in a database, and implement proper session management with OAuth."
        ],
        demoFollowups: [
          "localStorage persists until explicitly cleared and survives browser restarts, while sessionStorage clears when the tab is closed. localStorage is for long-term storage, sessionStorage for temporary session data.",
          "Use the storage event listener to detect changes in other tabs, implement a shared state management system, or use BroadcastChannel API for cross-tab communication.",
          "localStorage is vulnerable to XSS attacks, has no data encryption, and is synchronous. Never store sensitive data like tokens or passwords. Always validate and sanitize data before use."
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
        ],
        demoCode: `# Git Workflow Commands
# Initialize repository
git init
git remote add origin https://github.com/username/repo.git

# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: Add new feature component"

# Push to remote
git push origin feature/new-feature

# Create pull request ( GitHub UI )

# Merge to main
git checkout main
git pull origin main
git merge feature/new-feature
git push origin main

# Delete feature branch
git branch -d feature/new-feature
`,
        demoReflections: [
          "I use GitFlow branching strategy with main, develop, feature, release, and hotfix branches. This provides clear isolation for different types of work and makes releases predictable.",
          "Merge conflicts often occur when multiple developers modify the same file, especially package.json or configuration files. Using smaller, focused PRs and regular rebasing helps minimize conflicts.",
          "Code review process includes automated checks (linting, tests), at least two reviewer approvals, checking for code standards, performance implications, security issues, and ensuring proper documentation."
        ],
        demoFollowups: [
          "Merge creates a merge commit preserving history, while rebase rewrites commit history for a linear view. Rebase is cleaner but dangerous on shared branches.",
          "Use 'git revert <commit-hash>' to create an inverse commit, or 'git reset --hard <commit-hash>' for local changes only (never on shared branches).",
          "CI/CD pipeline: code push → run tests → build → deploy to staging → run integration tests → deploy to production → monitor. Tools: GitHub Actions, Jenkins, GitLab CI."
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
        ],
        demoCode: demoAnswers.demoTemplate,
        demoReflections: demoAnswers.demoReflections,
        demoFollowups: demoAnswers.demoFollowups
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
        ],
        demoCode: `# vercel.json configuration
{
  "version": 2,
  "builds": [
    { "src": "index.html", "use": "@vercel/static" }
  ],
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ],
  "env": {
    "API_URL": "@api_url",
    "NODE_ENV": "production"
  }
}

# Deploy command
vercel --prod

# Set up environment variables
vercel env add API_URL production
vercel env add SECRET_KEY production
`,
        demoReflections: [
          "I chose Vercel because it offers seamless Git integration, automatic SSL, global CDN, and preview deployments for every PR. The developer experience is excellent with zero-config setup.",
          "The main challenge was managing environment variables for different environments (dev, staging, prod). I solved this using Vercel's environment variable system and .env files version control.",
          "Preview deployments are automatically created for each PR by connecting Vercel to GitHub. Each PR gets a unique URL where stakeholders can review changes before merging to main."
        ],
        demoFollowups: [
          "API endpoints, database connection strings, secret keys, feature flags, and environment-specific configuration. Never commit sensitive values to version control.",
          "Blue-green deployment maintains two identical environments (blue=live, green=idle). Deploy to green, test, then switch traffic by updating the load balancer/ router configuration.",
          "Rollback strategy includes keeping previous deployment artifacts, using Git tags for versioning, automated deployment scripts that can revert to previous version, and database migration rollback plans."
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
        ],
        demoCode: demoAnswers.demoTemplate,
        demoReflections: [
          "I chose a clean, minimalist portfolio structure that puts projects front and center. Using a grid layout showcases work effectively, while the about section adds personality and context.",
          "My projects stand out because they solve real problems, have clean code, include case studies explaining my thought process, and demonstrate modern best practices like responsive design and accessibility.",
          "To improve for job applications, I would add testimonials, quantify project impacts with metrics, create a blog to show thought leadership, and ensure the site is optimized for recruiters with clear contact info and resume download."
        ],
        demoFollowups: [
          "Success metrics: time on site, project click-through rates, contact form submissions, resume downloads, and recruiter outreach. Also track GitHub stars and social shares of projects.",
          "Add Google Analytics for traffic, Hotjar for heatmaps, custom events for project interactions, and conversion tracking for contact form submissions. Also monitor Core Web Vitals in Search Console.",
          "Optimize Core Web Vitals by reducing Largest Contentful Paint (optimize images, use SSR), minimizing First Input Delay (defer non-critical JS), and eliminating Cumulative Layout Shift (set image dimensions, reserve space for ads)."
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
        ],
        demoCode: `// Express server architecture
const express = require('express');
const app = express();

// Middleware layer
app.use(express.json());
app.use(logger());

// Route handlers
app.get('/api/users', authenticate, getUserHandler);
app.post('/api/users', validateUser, createUserHandler);

// Service layer
async function getUserHandler(req, res) {
  try {
    const users = await userService.getUsers(req.query);
    res.json(users);
  } catch (error) {
    errorHandler(error, res);
  }
}

// Database layer
const db = require('./database');
app.listen(3000);
`,
        demoReflections: [
          "I chose a layered architecture (presentation → business logic → data access) for clear separation of concerns. This makes the code maintainable and testable.",
          "The database query layer would be the first bottleneck. I'd add indexes, implement query optimization, and add a caching layer (Redis) before scaling.",
          "Scale by adding a load balancer, multiple server instances, database read replicas, message queues for async tasks, and CDN for static assets."
        ],
        demoFollowups: [
          "Vertical scaling adds more power (CPU/RAM) to existing servers. Horizontal scaling adds more servers. Horizontal is more cost-effective and provides better fault tolerance.",
          "Implement Redis cache between the service and database layers. Cache frequently accessed data with TTL, use cache-aside pattern for updates, and implement cache invalidation strategies.",
          "Implement logging (Winston), metrics (Prometheus), tracing (Jaeger), alerts (PagerDuty), dashboards (Grafana), health checks, and performance monitoring (New Relic)."
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
        ],
        demoCode: `// Event loop demonstration
// Blocking code (bad)
function blockingOperation() {
  const start = Date.now();
  while (Date.now() - start < 5000) {
    // Blocks event loop for 5 seconds
  }
  console.log('Done blocking');
}

// Non-blocking (good)
async function nonBlockingOperation() {
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log('Done non-blocking');
}

// nextTick vs setImmediate
process.nextTick(() => {
  console.log('Runs before I/O');
});

setImmediate(() => {
  console.log('Runs after I/O callbacks');
});

// Worker threads for CPU tasks
const { Worker } = require('worker_threads');

function runCPUIntensiveTask(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./cpu-task.js');
    worker.postMessage(data);
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}
`,
        demoReflections: [
          "I chose async/await because it's more readable and maintainable than raw Promises or callbacks. It makes asynchronous code look synchronous while maintaining non-blocking behavior.",
          "A synchronous file read operation (readFileSync) was blocking the event loop. I replaced it with the async version (readFile) to allow other operations to run concurrently.",
          "Measure performance using Node's built-in perf_hooks module, event loop lag detection, CLI tools like autocannon for load testing, and APM tools like DataDog for production monitoring."
        ],
        demoFollowups: [
          "nextTick executes before any I/O operations, at the current phase. setImmediate runs in the check phase, after I/O callbacks. nextTick has higher priority.",
          "Use Worker Threads for CPU-intensive operations, offload to microservices, or use a job queue with external workers. Never block the main event loop with synchronous CPU work.",
          "Large JSON parsing, heavy crypto operations, synchronous file reads, infinite loops, too many nested callbacks, or poorly optimized database queries all cause event loop lag."
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
        ],
        demoCode: `const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();

// Security middleware
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
});
app.use('/api/', limiter);

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'No token' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes
app.get('/api/users', authenticate, (req, res) => {
  res.json({ users: [] });
});

app.post('/api/users', validateUser, (req, res) => {
  res.status(201).json({ message: 'User created' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(3000);
`,
        demoReflections: [
          "I chose a modular route structure with separate files for each resource (users, products, orders). This scales well and makes the codebase maintainable as the API grows.",
          "Middleware needed: body-parser for JSON, cors for cross-origin, helmet for security, morgan for logging, compression for performance, and custom auth middleware.",
          "Document API using OpenAPI/Swagger for interactive docs, JSDoc comments for code documentation, Postman collections for testing, and a README with setup instructions."
        ],
        demoFollowups: [
          "app.METHOD is for specific HTTP methods (GET, POST, etc.). app.use matches any HTTP method and the beginning of the path, useful for middleware.",
          "Use express-rate-limit package, store rate data in Redis for distributed systems, implement per-user or per-IP limits, and return Retry-After headers.",
          "Add Helmet.js for security headers: X-Frame-Options (clickjacking), X-XSS-Protection, Strict-Transport-Security (HSTS), Content-Security-Policy, and X-Content-Type-Options."
        ]
      }
    }
  };

  // =========================
  // GET ENHANCED ASSIGNMENT
  // =========================
  const course = assignments[courseKey];
  const selectedAssignment = course?.[lessonId];

  // If demo answers are requested, return them
  if (wantDemoAnswers && selectedAssignment) {
    return res.status(200).json({
      success: true,
      demoAnswers: {
        code: selectedAssignment.demoCode || demoAnswers.demoTemplate,
        reflections: selectedAssignment.demoReflections || demoAnswers.demoReflections,
        followups: selectedAssignment.demoFollowups || demoAnswers.demoFollowups
      }
    });
  }

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
    ],
    demoCode: demoAnswers.demoTemplate,
    demoReflections: demoAnswers.demoReflections,
    demoFollowups: demoAnswers.demoFollowups
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
      
      // Demo answers (available via separate request)
      hasDemoAnswers: true,
      
      // Grading Information
      rubric: {
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
      },
      
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
        tip: "Be specific in your answers. Show your thinking process.",
        demo: "Click 'Load Demo Answers' to see quality examples"
      }
    }
  });
}