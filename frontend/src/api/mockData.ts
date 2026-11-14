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
  bio: "B.Tech student passionate about full-stack development.",
  phone: "+91 98765 43210",
  location: "Bangalore, India",
  linkedin: "linkedin.com/in/arjun-kumar-dev",
  github: "github.com/arjun-kumar",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  education_level: "B.Tech",
  branch: "Computer Science",
  is_new: false,
};

export const MOCK_READINESS = {
  readiness_score: 72,
  target_role: "Full Stack Developer",
  breakdown: {
    role_match: { score: 49, weight: 40 },
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
      skill_name: "React Hooks & Dependencies",
      interval_days: 3,
      question: "When does useEffect trigger an infinite loop when referencing non-primitive objects?",
      explanation: "Objects recreate references on every render unless memoized with useMemo."
    },
    {
      id: 2,
      skill_name: "SQL Composite Indexing",
      interval_days: 7,
      question: "How do B-tree multi-column indexes behave when leading columns are skipped in WHERE?",
      explanation: "B-tree indexes require leftmost columns to perform index range scans efficiently."
    }
  ]
};

export const MOCK_PROGRESS = {
  completion_percentage: 28,
  completed_items: 4,
  total_items: 16,
  skills_progress: [
    { skill_name: "HTML & CSS", level: 90, status: "Mastered" },
    { skill_name: "JavaScript Core", level: 82, status: "Proficient" },
    { skill_name: "React Architecture", level: 74, status: "In Progress" },
    { skill_name: "Node.js REST APIs", level: 60, status: "In Progress" }
  ]
};

export const MOCK_STREAKS = {
  current_streak_days: 7,
  longest_streak_days: 14,
  completion_velocity: "3.4 / wk",
  milestones: [
    { id: 1, title: "7-Day Consistent Study Streak", description: "Completed active revision sessions 7 consecutive days", achieved: true, date: "Nov 2026" },
    { id: 2, title: "Frontend Core Certified", description: "Passed HTML, CSS and JS Technical Assessments", achieved: true, date: "Nov 2026" },
    { id: 3, title: "Full Stack Ready", description: "Achieve 80%+ Career Readiness Score", achieved: false, progress: 72 }
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
  phases: [
    {
      phase: 1,
      name: "Frontend Foundations",
      status: "In Progress",
      items: [
        { id: "item_html", title: "HTML5 Semantic Markup", status: "completed", estimated_hours: 6 },
        { id: "item_css", title: "CSS3 Flexbox, Grid & Responsive Layouts", status: "completed", estimated_hours: 8 },
        { id: "item_js", title: "Modern JavaScript (ES6+, Async/Await)", status: "completed", estimated_hours: 12 },
        { id: "item_react", title: "React Components & State Management", status: "in_progress", estimated_hours: 14 }
      ]
    },
    {
      phase: 2,
      name: "Backend & Data Persistence",
      status: "Upcoming",
      items: [
        { id: "item_node", title: "Node.js Runtime & Express Router", status: "upcoming", estimated_hours: 10 },
        { id: "item_sql", title: "Relational Modeling & PostgreSQL Queries", status: "completed", estimated_hours: 12 },
        { id: "item_auth", title: "JWT & OAuth2 Authentication Pipelines", status: "upcoming", estimated_hours: 8 }
      ]
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

