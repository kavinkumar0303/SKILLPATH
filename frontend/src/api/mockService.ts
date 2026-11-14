import {
  MOCK_ROLES,
  MOCK_USER,
  MOCK_READINESS,
  MOCK_REVISION,
  MOCK_PROGRESS,
  MOCK_STREAKS,
  MOCK_ANALYSIS,
  MOCK_MATCH,
  MOCK_SIMULATOR,
  MOCK_RESUME,
  MOCK_VERSIONS,
  MOCK_ROADMAP,
  MOCK_QUESTIONS,
  MOCK_EVENTS,
} from './mockData';

// Helper to get or initialize persistent user profile
function getStoredProfile(): any {
  try {
    const raw = localStorage.getItem('sb-user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.skills) {
        parsed.skills = MOCK_USER.skills;
        localStorage.setItem('sb-user', JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch {}
  localStorage.setItem('sb-user', JSON.stringify(MOCK_USER));
  return MOCK_USER;
}

// Helper to get or initialize persistent roadmap
function getStoredRoadmap(): any {
  try {
    const raw = localStorage.getItem('sb-roadmap');
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem('sb-roadmap', JSON.stringify(MOCK_ROADMAP));
  return MOCK_ROADMAP;
}

export function getMockResponse(url: string, method: string = 'get', data?: any): any {
  const cleanUrl = url.split('?')[0].replace(/^\/api/, '').replace(/^\/+/, '/');
  const lowerMethod = method.toLowerCase();

  // 1. Auth routes
  if (cleanUrl.startsWith('/auth/google') || cleanUrl.startsWith('/auth/demo')) {
    const user = getStoredProfile();
    return { user, token: 'demo-token-123' };
  }
  if (cleanUrl.startsWith('/auth/me')) {
    return getStoredProfile();
  }
  if (cleanUrl.startsWith('/auth/logout')) {
    return { status: 'ok' };
  }

  // 2. Dashboard routes
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

  // 3. Skill Analysis & Skill Graph
  if (cleanUrl === '/analysis') {
    return MOCK_ANALYSIS;
  }
  if (cleanUrl.startsWith('/skill-graph')) {
    return { success: true };
  }

  // 4. Assessments (MCQ Question Battery & Grading)
  if (cleanUrl.startsWith('/assessment/submit')) {
    return {
      grade: {
        score: 3,
        total: 4,
        percentage: 75,
      },
      score: 75,
      passed: true,
      adaptation: {
        weak_topics: ['Advanced Closure Scoping & Memory Retention'],
        recommendation: 'Completed diagnostic with 75% score. Roadmap updated to solidify concepts.',
      }
    };
  }
  if (cleanUrl.startsWith('/assessment/')) {
    const skillId = cleanUrl.replace('/assessment/', '');
    const found = MOCK_QUESTIONS[skillId];
    if (found && found.length > 0) {
      return found;
    }
    // Generic fallback questions for any other skill so the test battery is never empty
    const skillName = skillId.replace('skill_', '').replace('_', ' ').toUpperCase();
    return [
      {
        id: `${skillId}_1`,
        question: `What is the primary industry standard pattern when working with ${skillName}?`,
        options: [
          `Applying separation of concerns, defensive validation, and modular structure.`,
          `Bundling all application logic into a single unminified global execution block.`,
          `Bypassing type checks and relying strictly on client-side caching.`,
          `Disabling asynchronous processing in favor of synchronous blocking execution.`
        ],
        correct: 0,
        difficulty: "Intermediate",
        topic: `${skillName} Core Standards`
      },
      {
        id: `${skillId}_2`,
        question: `How does an engineering team maintain scalability and testability in ${skillName}?`,
        options: [
          `Continuous integration with automated test suites, linting rules, and decoupled dependencies.`,
          `Writing tests only after production deployment.`,
          `Avoiding source control branches.`,
          `Using undocumented runtime hacks.`
        ],
        correct: 0,
        difficulty: "Intermediate",
        topic: `${skillName} Architecture`
      },
      {
        id: `${skillId}_3`,
        question: `Which diagnostic signal indicates high technical proficiency in ${skillName}?`,
        options: [
          `Consistently passing benchmark assessments with ≥ 70% score.`,
          `Writing code without documentation.`,
          `Ignoring framework upgrade warnings.`,
          `Avoiding error boundary handlers.`
        ],
        correct: 0,
        difficulty: "Beginner",
        topic: "Competency Measurement"
      }
    ];
  }

  // 5. Learning Path & Time Estimator
  if (cleanUrl.startsWith('/explain/')) {
    return {
      agent_name: 'LearningPathAgent',
      rationale: 'Sequenced as a critical milestone to resolve topological prerequisite dependencies for target career role (Full Stack Developer).',
      confidence: '96%',
      collaborators: ['SkillAnalyzerAgent', 'CareerMatchingAgent'],
      data_used: [
        'Learner demonstrated competency: JavaScript Core (75%)',
        'Industry target requirement: React Architecture (High Priority, Weight 4)',
        'Calibrated study velocity: 3.4 modules / week'
      ],
      rule_triggered: 'PREREQUISITE_SATISFIED: Direct dependency chain resolved.'
    };
  }
  if (cleanUrl.startsWith('/time-estimate')) {
    const hours = Number(data?.hours_per_week) || 8;
    const weeks = Math.max(1, Math.round(68 / hours));
    return {
      total_hours: 68,
      weeks_needed: weeks,
      hours_per_week: hours,
      target_completion_date: 'March 2027',
      feasibility: hours >= 10 ? 'Optimal' : 'Standard Cadence',
    };
  }
  if (cleanUrl.startsWith('/roadmap/complete')) {
    const roadmap = getStoredRoadmap();
    const itemId = data?.item_id;
    if (roadmap?.phases && itemId) {
      for (const p of roadmap.phases) {
        for (const item of p.items) {
          if (item.id === itemId || String(item.id) === String(itemId)) {
            item.status = item.status === 'completed' ? 'in_progress' : 'completed';
          }
        }
      }
      localStorage.setItem('sb-roadmap', JSON.stringify(roadmap));
    }
    return { success: true, roadmap };
  }
  if (cleanUrl.startsWith('/roadmap/diff')) {
    return { items_added: [], items_reordered: [], items_removed: [] };
  }
  if (cleanUrl.startsWith('/roadmap')) {
    return getStoredRoadmap();
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

  // 6. Profile Operations (+ icon skill add, delete, save details, resume parse)
  if (cleanUrl === '/profile' && lowerMethod === 'get') {
    return getStoredProfile();
  }
  if (cleanUrl === '/profile' && (lowerMethod === 'put' || lowerMethod === 'post')) {
    const current = getStoredProfile();
    const updated = { ...current, ...data };
    localStorage.setItem('sb-user', JSON.stringify(updated));
    return updated;
  }
  if (cleanUrl.startsWith('/profile/skills/') && lowerMethod === 'delete') {
    const skillIdToDelete = cleanUrl.replace('/profile/skills/', '');
    const current = getStoredProfile();
    const filtered = (current.skills || []).filter((s: any) => s.skill_id !== skillIdToDelete);
    current.skills = filtered;
    localStorage.setItem('sb-user', JSON.stringify(current));
    return { success: true, skills: filtered };
  }
  if (cleanUrl.startsWith('/profile/skills') && lowerMethod === 'post') {
    const current = getStoredProfile();
    const sid = data?.skill_id;
    const lvl = Number(data?.level) || 60;
    const skillNames: Record<string, { name: string; cat: string }> = {
      skill_javascript: { name: 'JavaScript', cat: 'Frontend' },
      skill_react: { name: 'React', cat: 'Frontend' },
      skill_nodejs: { name: 'Node.js', cat: 'Backend' },
      skill_typescript: { name: 'TypeScript', cat: 'Frontend' },
      skill_docker: { name: 'Docker', cat: 'DevOps' },
      skill_git: { name: 'Git', cat: 'DevOps' },
      skill_python: { name: 'Python', cat: 'Backend' },
      skill_sql: { name: 'SQL', cat: 'Database' },
      skill_css: { name: 'CSS', cat: 'Frontend' },
      skill_html: { name: 'HTML', cat: 'Frontend' },
    };
    const meta = skillNames[sid] || { name: sid.replace('skill_', '').toUpperCase(), cat: 'General' };

    const skills = [...(current.skills || [])];
    const existingIdx = skills.findIndex((s: any) => s.skill_id === sid);
    if (existingIdx >= 0) {
      skills[existingIdx].level = lvl;
    } else {
      skills.push({
        skill_id: sid,
        name: meta.name,
        category: meta.cat,
        level: lvl,
      });
    }
    current.skills = skills;
    localStorage.setItem('sb-user', JSON.stringify(current));
    return { success: true, skills };
  }
  if (cleanUrl.startsWith('/profile/resume') && lowerMethod === 'post') {
    const current = getStoredProfile();
    const text = data?.text || '';
    const extracted = [];
    if (/python/i.test(text)) extracted.push('Python');
    if (/sql|postgres|database/i.test(text)) extracted.push('SQL');
    if (/javascript|js/i.test(text)) extracted.push('JavaScript');
    if (/react/i.test(text)) extracted.push('React');
    if (/git/i.test(text)) extracted.push('Git');
    return {
      success: true,
      extracted_skills: extracted,
      message: `Extracted ${extracted.length} capabilities from transcript.`,
    };
  }

  // 7. Career & Roles
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

  // 8. Resume
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

  // 9. Mentor Chat & Agent Telemetry
  if (cleanUrl.startsWith('/mentor/chat')) {
    return {
      reply: "Great progress! Your React and Python foundations are solid. I recommend focusing on building a REST API project with authentication to boost your Full Stack readiness score.",
      suggestions: ["How do I structure my project?", "Explain JWT authentication", "Practice technical quiz"]
    };
  }
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

  // Default array fallback if url ends with 's'
  if (cleanUrl.endsWith('s')) {
    return [];
  }

  return { success: true, url: cleanUrl };
}
