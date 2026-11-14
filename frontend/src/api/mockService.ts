import {
  MOCK_ROLES,
  MOCK_USER,
  MOCK_READINESS,
  MOCK_REVISION,
  MOCK_PROGRESS,
  MOCK_STREAKS,
  MOCK_MATCH,
  MOCK_SIMULATOR,
  MOCK_RESUME,
  MOCK_VERSIONS,
  MOCK_ROADMAP,
  MOCK_EVENTS,
} from './mockData';

export function getMockResponse(url: string, method: string = 'get', data?: any): any {
  const cleanUrl = url.split('?')[0].replace(/^\/api/, '').replace(/^\/+/, '/');
  const lowerMethod = method.toLowerCase();

  // Auth routes
  if (cleanUrl.startsWith('/auth/google') || cleanUrl.startsWith('/auth/demo')) {
    return { user: MOCK_USER, token: 'demo-token-123' };
  }
  if (cleanUrl.startsWith('/auth/me')) {
    return MOCK_USER;
  }
  if (cleanUrl.startsWith('/auth/logout')) {
    return { status: 'ok' };
  }

  // Dashboard routes
  if (cleanUrl.startsWith('/readiness')) {
    return MOCK_READINESS;
  }
  if (cleanUrl.startsWith('/revision/due')) {
    return MOCK_REVISION;
  }
  if (cleanUrl.startsWith('/progress')) {
    return MOCK_PROGRESS;
  }
  if (cleanUrl.startsWith('/streaks')) {
    return MOCK_STREAKS;
  }

  // Career & Roles
  if (cleanUrl === '/roles') {
    return MOCK_ROLES;
  }
  if (cleanUrl.startsWith('/match')) {
    return MOCK_MATCH;
  }
  if (cleanUrl.startsWith('/career/select') || cleanUrl.startsWith('/career/target')) {
    const roleId = data?.role_id || 'role_fullstack';
    const matched = MOCK_ROLES.find((r) => r.id === roleId) || MOCK_ROLES[0];
    return { success: true, role: matched };
  }
  if (cleanUrl.startsWith('/simulate')) {
    return MOCK_SIMULATOR;
  }

  // Resume
  if (cleanUrl === '/resume' && lowerMethod === 'get') {
    return MOCK_RESUME;
  }
  if (cleanUrl === '/resume' && lowerMethod === 'put') {
    return { success: true, resume_data: data?.resume_data || MOCK_RESUME };
  }
  if (cleanUrl.startsWith('/resume/versions') && lowerMethod === 'get') {
    return MOCK_VERSIONS;
  }
  if (cleanUrl.startsWith('/resume/versions') && lowerMethod === 'post') {
    return { id: `v_${Date.now()}`, version_id: `v_${Date.now()}`, ...data };
  }
  if (cleanUrl.startsWith('/resume/export')) {
    return { download_url: '#', html: '<html><body>Skillpath Resume</body></html>' };
  }

  // Learning Path & Roadmap
  if (cleanUrl.startsWith('/roadmap/diff')) {
    return { items_added: [], items_reordered: [], items_removed: [] };
  }
  if (cleanUrl.startsWith('/roadmap')) {
    return MOCK_ROADMAP;
  }
  if (cleanUrl.startsWith('/planner')) {
    return {
      schedule: [
        { id: 1, day: 'Monday', topic: 'React Custom Hooks', time: '18:00', completed: true },
        { id: 2, day: 'Wednesday', topic: 'SQL Query Optimization', time: '19:00', completed: false },
        { id: 3, day: 'Saturday', topic: 'Full Stack Integration Project', time: '11:00', completed: false },
      ]
    };
  }

  // Profile
  if (cleanUrl.startsWith('/profile') && lowerMethod === 'get') {
    return {
      ...MOCK_USER,
      skills: [
        { skill_id: 'skill_python', name: 'Python', level: 85, category: 'Backend' },
        { skill_id: 'skill_sql', name: 'SQL', level: 80, category: 'Database' },
        { skill_id: 'skill_javascript', name: 'JavaScript', level: 75, category: 'Frontend' },
        { skill_id: 'skill_react', name: 'React', level: 70, category: 'Frontend' },
        { skill_id: 'skill_html', name: 'HTML', level: 85, category: 'Frontend' },
      ],
      education: MOCK_RESUME.education,
      projects: JSON.stringify(MOCK_RESUME.projects),
      certifications: MOCK_RESUME.certifications,
    };
  }
  if (cleanUrl.startsWith('/profile') && lowerMethod === 'put') {
    return { success: true, ...data };
  }
  if (cleanUrl.startsWith('/profile/skills')) {
    return { success: true };
  }

  // Assessment & Mentor
  if (cleanUrl.startsWith('/assessment/submit')) {
    return {
      score: 85,
      passed: true,
      adaptation: {
        weak_topics: ['Higher-Order Functions'],
        recommendation: 'Accelerate to Node.js backend integration',
      }
    };
  }
  if (cleanUrl.startsWith('/mentor/chat')) {
    return {
      reply: "Great progress! Your React and Python foundations are solid. I recommend focusing on building a REST API project with authentication to boost your Full Stack readiness score.",
      suggestions: ["How do I structure my project?", "Explain JWT authentication", "Practice technical quiz"]
    };
  }

  // Agent Events & Demo
  if (cleanUrl.startsWith('/agent-events')) {
    return MOCK_EVENTS;
  }
  if (cleanUrl.startsWith('/demo/run')) {
    return {
      scenario: 'Autonomous Remediation Triggered',
      events: MOCK_EVENTS,
      message: 'Assessment score 45% detected. Dispatched CurriculumAgent & SpacedRepetitionAgent.'
    };
  }

  // Default array fallback if url sounds like plural or listing
  if (cleanUrl.endsWith('s')) {
    return [];
  }

  return { success: true, url: cleanUrl };
}

