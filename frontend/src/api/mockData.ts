export const MOCK_ROLES = [
  {
    "id": "role_fullstack",
    "name": "Full Stack Developer",
    "description": "Builds both client-side and server-side software, handling the entire web application stack from database to UI.",
    "required_skills": [
      {"skill_id": "skill_html", "weight": 4, "priority": "High"},
      {"skill_id": "skill_css", "weight": 4, "priority": "High"},
      {"skill_id": "skill_javascript", "weight": 5, "priority": "High"},
      {"skill_id": "skill_react", "weight": 4, "priority": "High"},
      {"skill_id": "skill_nodejs", "weight": 5, "priority": "High"},
      {"skill_id": "skill_sql", "weight": 4, "priority": "High"},
      {"skill_id": "skill_git", "weight": 3, "priority": "Medium"},
      {"skill_id": "skill_docker", "weight": 2, "priority": "Low"},
      {"skill_id": "skill_typescript", "weight": 3, "priority": "Medium"}
    ]
  },
  {
    "id": "role_data_scientist",
    "name": "Data Scientist",
    "description": "Analyzes complex data sets to find patterns, builds predictive models, and communicates insights to drive business decisions.",
    "required_skills": [
      {"skill_id": "skill_python", "weight": 5, "priority": "High"},
      {"skill_id": "skill_statistics", "weight": 5, "priority": "High"},
      {"skill_id": "skill_pandas", "weight": 5, "priority": "High"},
      {"skill_id": "skill_data_analysis", "weight": 5, "priority": "High"},
      {"skill_id": "skill_machine_learning", "weight": 5, "priority": "High"},
      {"skill_id": "skill_sql", "weight": 4, "priority": "Medium"}
    ]
  },
  {
    "id": "role_frontend",
    "name": "Frontend Developer",
    "description": "Specializes in building user interfaces and interactive web applications with modern frameworks and design principles.",
    "required_skills": [
      {"skill_id": "skill_html", "weight": 5, "priority": "High"},
      {"skill_id": "skill_css", "weight": 5, "priority": "High"},
      {"skill_id": "skill_javascript", "weight": 5, "priority": "High"},
      {"skill_id": "skill_typescript", "weight": 4, "priority": "High"},
      {"skill_id": "skill_react", "weight": 5, "priority": "High"},
      {"skill_id": "skill_git", "weight": 3, "priority": "Medium"}
    ]
  },
  {
    "id": "role_backend",
    "name": "Backend Developer",
    "description": "Designs and implements server-side logic, databases, and APIs that power web and mobile applications.",
    "required_skills": [
      {"skill_id": "skill_python", "weight": 5, "priority": "High"},
      {"skill_id": "skill_nodejs", "weight": 4, "priority": "High"},
      {"skill_id": "skill_sql", "weight": 5, "priority": "High"},
      {"skill_id": "skill_docker", "weight": 3, "priority": "Medium"},
      {"skill_id": "skill_git", "weight": 3, "priority": "Medium"}
    ]
  },
  {
    "id": "role_devops",
    "name": "DevOps Engineer",
    "description": "Bridges development and operations, automating infrastructure, deployments, and monitoring for reliable software delivery.",
    "required_skills": [
      {"skill_id": "skill_docker", "weight": 5, "priority": "High"},
      {"skill_id": "skill_git", "weight": 4, "priority": "High"},
      {"skill_id": "skill_python", "weight": 3, "priority": "Medium"}
    ]
  },
  {
    "id": "role_ml_engineer",
    "name": "ML Engineer",
    "description": "Designs, builds, and deploys machine learning models at scale, bridging data science research and production systems.",
    "required_skills": [
      {"skill_id": "skill_python", "weight": 5, "priority": "High"},
      {"skill_id": "skill_machine_learning", "weight": 5, "priority": "High"},
      {"skill_id": "skill_sql", "weight": 3, "priority": "Medium"}
    ]
  }
];

export const MOCK_USER = {
  id: 1,
  name: "Arjun Kumar",
  email: "arjun@example.com",
  bio: "B.Tech Computer Science student specializing in full-stack architecture, React interfaces, and distributed backends.",
  phone: "+91 98765 43210",
  location: "Bangalore, India",
  linkedin: "linkedin.com/in/arjun-kumar-dev",
  github: "github.com/arjun-kumar",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  education_level: "B.Tech",
  branch: "Computer Science",
  target_role: "role_fullstack",
  is_new: false,
  skills: [
    { skill_id: 'skill_python', name: 'Python', level: 85, category: 'Backend' },
    { skill_id: 'skill_sql', name: 'SQL', level: 80, category: 'Database' },
    { skill_id: 'skill_html', name: 'HTML5', level: 85, category: 'Frontend' },
    { skill_id: 'skill_javascript', name: 'JavaScript', level: 75, category: 'Frontend' },
    { skill_id: 'skill_react', name: 'React.js', level: 70, category: 'Frontend' },
    { skill_id: 'skill_nodejs', name: 'Node.js', level: 65, category: 'Backend' },
    { skill_id: 'skill_git', name: 'Git', level: 75, category: 'Tools' },
  ]
};

export const MOCK_READINESS = {
  readiness_score: 72,
  target_role: "Full Stack Developer",
  breakdown: {
    role_match: { score: 68, weight: 40 },
    assessment_mastery: { score: 85, weight: 30 },
    curriculum_progress: { score: 28, weight: 20 },
    consistency_index: { score: 90, weight: 10 }
  }
};

export const MOCK_REVISION = {
  count: 2,
  items: [
    {
      id: 1,
      skill_name: "React Hooks & Dependency Arrays",
      interval_days: 3,
      question: "When does useEffect trigger an infinite loop when referencing non-primitive objects?",
      explanation: "Objects recreate references on every render unless memoized with useMemo or placed outside the component scope."
    },
    {
      id: 2,
      skill_name: "SQL Composite Indexing",
      interval_days: 7,
      question: "How do B-tree multi-column indexes behave when leading columns are skipped in WHERE clauses?",
      explanation: "B-tree indexes require leftmost prefix columns to perform range scans efficiently, otherwise a full scan is triggered."
    }
  ]
};

export const MOCK_PROGRESS = {
  completion_percentage: 28,
  completed_items: 4,
  total_items: 16,
  weekly_activity: [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 3.0 },
    { day: "Wed", hours: 1.5 },
    { day: "Thu", hours: 4.0 },
    { day: "Fri", hours: 2.0 },
    { day: "Sat", hours: 5.5 },
    { day: "Sun", hours: 3.5 },
  ],
  assessment_history: [
    { date: "Nov 01", score_pct: 60, skill: "Python Fundamentals" },
    { date: "Nov 05", score_pct: 70, skill: "SQL Queries & Joins" },
    { date: "Nov 09", score_pct: 55, skill: "HTML Semantic Elements" },
    { date: "Nov 12", score_pct: 50, skill: "JavaScript Closures" },
    { date: "Nov 14", score_pct: 75, skill: "JavaScript Async/Await" },
  ],
  skills_progress: [
    { skill_id: "skill_html", name: "HTML & CSS", level: 90, assessments_taken: 4, trend: "mastered" },
    { skill_id: "skill_js", name: "JavaScript Core", level: 82, assessments_taken: 5, trend: "improving" },
    { skill_id: "skill_react", name: "React Architecture", level: 74, assessments_taken: 3, trend: "improving" },
    { skill_id: "skill_node", name: "Node.js REST APIs", level: 60, assessments_taken: 2, trend: "developing" },
  ]
};

export const MOCK_STREAKS = {
  current_streak_days: 7,
  longest_streak_days: 14,
  completion_velocity: "3.4 / wk",
  total_active_days: 26,
  milestones: [
    { id: 1, title: "7-Day Consistent Study Streak", description: "Completed active revision sessions 7 consecutive days", achieved: true, date: "Nov 2026" },
    { id: 2, title: "Frontend Core Certified", description: "Passed HTML, CSS and JS Technical Assessments", achieved: true, date: "Nov 2026" },
    { id: 3, title: "Full Stack Ready", description: "Achieve 80%+ Career Readiness Score", achieved: false, progress: 72 }
  ]
};

export const MOCK_ANALYSIS = {
  radar_data: [
    { skill: "Frontend", value: 85 },
    { skill: "Backend", value: 75 },
    { skill: "Database", value: 80 },
    { skill: "DevOps", value: 45 },
    { skill: "Architecture", value: 70 },
    { skill: "Testing", value: 60 }
  ],
  skills: [
    { name: "Python", proficiency: 85 },
    { name: "HTML & CSS", proficiency: 85 },
    { name: "SQL", proficiency: 80 },
    { name: "JavaScript", proficiency: 75 },
    { name: "Git", proficiency: 75 },
    { name: "React.js", proficiency: 70 },
    { name: "Node.js", proficiency: 65 },
    { name: "Docker", proficiency: 45 },
  ],
  strengths: ["skill_python", "skill_html", "skill_sql", "skill_javascript", "skill_git", "skill_react"],
  strengths_detail: [
    { skill_id: "skill_python", name: "Python", category: "Backend" },
    { skill_id: "skill_html", name: "HTML & CSS", category: "Frontend" },
    { skill_id: "skill_sql", name: "SQL Relational Modeling", category: "Database" },
    { skill_id: "skill_javascript", name: "JavaScript (ES6+)", category: "Frontend" },
    { skill_id: "skill_react", name: "React.js State & Hooks", category: "Frontend" },
  ],
  weaknesses_detail: [
    { skill_id: "skill_docker", name: "Docker Containerization", category: "DevOps" },
    { skill_id: "skill_typescript", name: "TypeScript Generics & Types", category: "Frontend" },
    { skill_id: "skill_testing", name: "Integration & Unit Testing", category: "DevOps" },
  ]
};

export const MOCK_MATCH = {
  role_id: "role_fullstack",
  role_name: "Full Stack Developer",
  match_score: 68,
  matched_skills: [
    { skill_id: "skill_html", name: "HTML", level: 85, weight: 4, priority: "High" },
    { skill_id: "skill_css", name: "CSS", level: 80, weight: 4, priority: "High" },
    { skill_id: "skill_javascript", name: "JavaScript", level: 75, weight: 5, priority: "High" },
    { skill_id: "skill_react", name: "React", level: 70, weight: 4, priority: "High" },
    { skill_id: "skill_sql", name: "SQL", level: 80, weight: 4, priority: "High" },
    { skill_id: "skill_git", name: "Git", level: 75, weight: 3, priority: "Medium" }
  ],
  missing_skills: [
    { skill_id: "skill_nodejs", name: "Node.js", level: 0, weight: 5, priority: "High" },
    { skill_id: "skill_typescript", name: "TypeScript", level: 0, weight: 3, priority: "Medium" },
    { skill_id: "skill_docker", name: "Docker", level: 0, weight: 2, priority: "Low" }
  ]
};

export const MOCK_SIMULATOR = {
  current_role: "Full Stack Developer",
  simulated_role: "Data Scientist",
  current_match: {
    score: 68,
    matched_skills: [
      { name: "HTML", level: 85 },
      { name: "CSS", level: 80 },
      { name: "JavaScript", level: 75 },
      { name: "SQL", level: 80 }
    ],
    missing_skills: [
      { name: "Node.js", weight: 5 },
      { name: "TypeScript", weight: 3 }
    ]
  },
  simulated_match: {
    score: 45,
    matched_skills: [
      { name: "Python", level: 85 },
      { name: "SQL", level: 80 }
    ],
    missing_skills: [
      { name: "Statistics", weight: 5 },
      { name: "Machine Learning", weight: 5 },
      { name: "Pandas", weight: 5 }
    ]
  }
};

export const MOCK_RESUME = {
  candidate: {
    name: "Arjun Kumar",
    email: "arjun@example.com",
    phone: "+91 98765 43210",
    location: "Bangalore, India",
    linkedin: "linkedin.com/in/arjun-kumar-dev",
    github: "github.com/arjun-kumar",
    target_role: "Full Stack Developer",
    education_level: "B.Tech",
    branch: "Computer Science"
  },
  summary: "B.Tech student in Computer Science with skills in Python, SQL, and JavaScript, aiming for a Full Stack Developer role.",
  skills: [
    {
      category: "Frontend",
      skills: [{ name: "HTML", level: 85 }, { name: "CSS", level: 80 }, { name: "JavaScript", level: 75 }, { name: "React", level: 70 }]
    },
    {
      category: "Backend & Database",
      skills: [{ name: "Python", level: 85 }, { name: "Node.js", level: 65 }, { name: "SQL", level: 80 }]
    },
    {
      category: "Tools & DevOps",
      skills: [{ name: "Git", level: 75 }, { name: "Docker", level: 50 }]
    }
  ],
  education: [
    {
      degree: "B.Tech in Computer Science and Engineering",
      institution: "IIIT Bangalore",
      period: "2023 - 2027",
      score: "CGPA 8.7 / 10"
    }
  ],
  projects: [
    {
      title: "Skillpath Learning Intelligence Platform",
      organization: "Independent Project",
      period: "2026",
      description: "Multi-agent adaptive learning and skill graph sequencing application with real-time career readiness analytics.",
      skills: ["React", "FastAPI", "SQLite", "Tailwind CSS"]
    },
    {
      title: "Algorithmic Market Data Pipeline",
      organization: "Academic Project",
      period: "2025",
      description: "High-throughput data ingestion worker computing technical indicators and anomaly scores.",
      skills: ["Python", "SQL", "Pandas"]
    }
  ],
  certifications: [
    {
      name: "Python Core Architecture Assessment",
      issuer: "Skillpath Adaptive Assessment",
      date: "Nov 2026",
      score: "88% Mastery"
    },
    {
      name: "JavaScript Modern Standards Assessment",
      issuer: "Skillpath Adaptive Assessment",
      date: "Nov 2026",
      score: "82% Mastery"
    }
  ],
  sections: [
    { id: "summary", name: "Summary", enabled: true },
    { id: "skills", name: "Technical Competencies", enabled: true },
    { id: "projects", name: "Selected Projects", enabled: true },
    { id: "education", name: "Education", enabled: true },
    { id: "certifications", name: "Certifications & Assessments", enabled: true }
  ],
  ats_match: {
    match_percentage: 82,
    matched_keywords: ["Python", "SQL", "JavaScript", "React", "HTML", "CSS", "Git", "Node.js"],
    missing_keywords: ["Docker", "Kubernetes", "TypeScript", "CI/CD"]
  },
  missing_checklist: [
    "Include Docker containerization project to increase DevOps score",
    "Complete TypeScript assessment to raise Full Stack match to 90%"
  ]
};

export const MOCK_VERSIONS = [
  {
    id: "v1",
    version_id: "v1",
    role_id: "role_fullstack",
    template: "modern",
    created_at: new Date().toISOString(),
    ats_score: 82,
    resume_data: MOCK_RESUME
  }
];

export const MOCK_ROADMAP = {
  completion_percentage: 28,
  phases: [
    {
      phase: 1,
      title: "Frontend Foundations",
      name: "Frontend Foundations",
      status: "In Progress",
      items: [
        {
          id: 1,
          title: "HTML5 Semantic Markup",
          skill_name: "HTML5",
          provider: "W3C Standards",
          difficulty: "beginner",
          duration_hours: 6,
          status: "completed",
          is_revision: false,
          resource_url: "https://developer.mozilla.org/en-US/docs/Web/HTML"
        },
        {
          id: 2,
          title: "CSS3 Flexbox, Grid & Responsive Layouts",
          skill_name: "CSS3",
          provider: "Modern Web",
          difficulty: "intermediate",
          duration_hours: 8,
          status: "completed",
          is_revision: false,
          resource_url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/"
        },
        {
          id: 3,
          title: "Modern JavaScript (ES6+, Async/Await)",
          skill_name: "JavaScript",
          provider: "ECMAScript",
          difficulty: "intermediate",
          duration_hours: 12,
          status: "completed",
          is_revision: false,
          resource_url: "https://javascript.info/"
        },
        {
          id: 4,
          title: "React Components & State Management",
          skill_name: "React.js",
          provider: "React Docs",
          difficulty: "intermediate",
          duration_hours: 14,
          status: "in_progress",
          is_revision: false,
          resource_url: "https://react.dev/"
        }
      ]
    },
    {
      phase: 2,
      title: "Backend & Data Persistence",
      name: "Backend & Data Persistence",
      status: "Upcoming",
      items: [
        {
          id: 5,
          title: "Node.js Runtime & Express Router",
          skill_name: "Node.js",
          provider: "NodeJS Org",
          difficulty: "intermediate",
          duration_hours: 10,
          status: "upcoming",
          is_revision: false,
          resource_url: "https://nodejs.org/en/docs/"
        },
        {
          id: 6,
          title: "Relational Modeling & PostgreSQL Queries",
          skill_name: "SQL",
          provider: "PostgreSQL Global",
          difficulty: "intermediate",
          duration_hours: 12,
          status: "completed",
          is_revision: false,
          resource_url: "https://www.postgresql.org/docs/"
        },
        {
          id: 7,
          title: "JWT & OAuth2 Authentication Pipelines",
          skill_name: "Security",
          provider: "OAuth WG",
          difficulty: "advanced",
          duration_hours: 8,
          status: "upcoming",
          is_revision: false,
          resource_url: "https://oauth.net/2/"
        }
      ]
    }
  ]
};

export const MOCK_QUESTIONS: Record<string, any[]> = {
  skill_javascript: [
    {
      id: "js_1",
      question: "What is the key functional difference between Promise.all() and Promise.allSettled()?",
      options: [
        "Promise.all rejects immediately upon any rejection; allSettled waits for all promises to resolve or reject.",
        "Promise.all executes in parallel; allSettled executes sequentially.",
        "Promise.all returns an array of values; allSettled returns a single merged object.",
        "Promise.all only works with asynchronous functions; allSettled works with synchronous functions."
      ],
      correct: 0,
      difficulty: "Intermediate",
      topic: "Asynchronous JavaScript"
    },
    {
      id: "js_2",
      question: "Which mechanism prevents garbage collection of outer variables when an inner function retains access?",
      options: [
        "Hoisting",
        "Closure",
        "Prototypal Inheritance",
        "Event Bubbling"
      ],
      correct: 1,
      difficulty: "Intermediate",
      topic: "Closures & Scope"
    },
    {
      id: "js_3",
      question: "What will `typeof NaN` evaluate to in JavaScript?",
      options: ["'undefined'", "'nan'", "'number'", "'object'"],
      correct: 2,
      difficulty: "Beginner",
      topic: "Type System"
    },
    {
      id: "js_4",
      question: "How does the JavaScript event loop prioritize microtasks vs macrotasks?",
      options: [
        "Macrotasks execute first, followed by microtasks.",
        "Microtasks (Promises, queueMicrotask) execute immediately after the current script and before the next macrotask (setTimeout).",
        "They are executed in alternating order via round-robin scheduler.",
        "The browser chooses based on available CPU cycles."
      ],
      correct: 1,
      difficulty: "Advanced",
      topic: "Event Loop"
    }
  ],
  skill_react: [
    {
      id: "react_1",
      question: "Why should keys assigned to items in a React list be stable, unique, and predictable?",
      options: [
        "They enable React's reconciliation engine to identify which items have changed, been added, or removed.",
        "They set the CSS z-index order of rendered DOM nodes.",
        "They automatically bind event listeners to each list element.",
        "They cache component props in local storage."
      ],
      correct: 0,
      difficulty: "Intermediate",
      topic: "Reconciliation"
    },
    {
      id: "react_2",
      question: "When does the dependency array in useEffect trigger a re-run if it contains an object literal?",
      options: [
        "Only when the object's properties change value.",
        "On every single render pass because object literals create a new memory reference each time.",
        "Never, because React does deep equality comparison on objects.",
        "Only when explicitly instructed by useCallback."
      ],
      correct: 1,
      difficulty: "Intermediate",
      topic: "Hooks Lifecycle"
    },
    {
      id: "react_3",
      question: "What is the primary benefit of using useMemo in performance optimization?",
      options: [
        "Memoizes expensive calculation results between renders until specified dependencies change.",
        "Prevents the component from rendering on the client.",
        "Automatically debounces state updates.",
        "Caches network API responses in browser memory."
      ],
      correct: 0,
      difficulty: "Advanced",
      topic: "Performance"
    }
  ],
  skill_python: [
    {
      id: "py_1",
      question: "What is the difference between a shallow copy and a deep copy in Python?",
      options: [
        "A shallow copy constructs a new compound object and inserts references to the original objects; a deep copy recursively copies the objects.",
        "Shallow copy works on lists; deep copy only works on dictionaries.",
        "Deep copy executes faster than shallow copy.",
        "Shallow copy modifies the original object in place."
      ],
      correct: 0,
      difficulty: "Intermediate",
      topic: "Memory Model"
    },
    {
      id: "py_2",
      question: "What does the `yield` keyword turn a standard Python function into?",
      options: [
        "A Generator function that produces values lazily when iterated.",
        "An asynchronous Coroutine running on uvloop.",
        "A static ClassMethod.",
        "A compiled C-extension module."
      ],
      correct: 0,
      difficulty: "Intermediate",
      topic: "Generators"
    }
  ],
  skill_sql: [
    {
      id: "sql_1",
      question: "What is the fundamental difference between WHERE and HAVING in SQL?",
      options: [
        "WHERE filters rows before aggregation; HAVING filters groups after GROUP BY aggregation.",
        "WHERE only works on numeric columns; HAVING works on string columns.",
        "WHERE is standard SQL; HAVING is proprietary to PostgreSQL.",
        "HAVING is an alias for WHERE with better performance."
      ],
      correct: 0,
      difficulty: "Intermediate",
      topic: "Aggregation"
    },
    {
      id: "sql_2",
      question: "Which index type is best suited for equality and range query operations in relational databases?",
      options: ["B-Tree Index", "Hash Index", "GIN Index", "BRIN Index"],
      correct: 0,
      difficulty: "Intermediate",
      topic: "Indexing"
    }
  ]
};

export const MOCK_EVENTS = [
  {
    id: "evt_1",
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    agent: "Mentor",
    action: "Assisted learner",
    result: "Replied to learner with 3 guidance suggestions for React Hooks",
    confidence: "94%",
    status: "Success"
  },
  {
    id: "evt_2",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    agent: "Orchestrator",
    action: "Dispatched calibration",
    result: "Dispatched LearningPathAgent to recalibrate Full Stack curriculum",
    confidence: "98%",
    status: "Success"
  },
  {
    id: "evt_3",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    agent: "Resume",
    action: "Generated resume",
    result: "Assembled grounded resume for Arjun Kumar with 82% ATS role match",
    confidence: "96%",
    status: "Success"
  }
];
