import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Bot,
  Brain,
  Compass,
  CheckCircle2,
  ChevronDown,
  Layers,
  GraduationCap,
  Building2,
  Menu,
  X,
  Code2,
  Database,
  Cpu,
  ShieldCheck,
  TrendingUp,
  FileCode2,
} from 'lucide-react';
import Logo from '../components/Logo';

export default function Landing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'PERSONALIZED' | 'ADAPTIVE' | 'AGENTIC'>('ADAPTIVE');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Skillpath diagnose my existing technical abilities?',
      a: 'The Skill Analyzer continuously evaluates your self-rated skill inventory combined with diagnostic assessments, computing an objective 0–100 proficiency score across 35+ industry technologies.',
    },
    {
      q: 'How does the curriculum adapt when a learner struggles or excels?',
      a: 'When an assessment score is under 60%, the orchestrator injects focused revision modules, slows the learning velocity, and schedules spaced-repetition cards. Scores of 85%+ mark competencies as mastered and accelerate future phases.',
    },
    {
      q: 'Where is the learning content sourced from?',
      a: 'All roadmap resources are curated strictly from authoritative, free open-access documentation and official tutorials: MDN Web Docs, freeCodeCamp, React Official Docs, Node.js Docs, Python.org, and Harvard CS50.',
    },
    {
      q: 'Can academic institutions and enterprises monitor student cohort gaps?',
      a: 'Yes. The Cohort Analytics admin console tracks aggregate skill deficit heatmaps across dozens or hundreds of learners, identifies at-risk students, and exports complete CSV audit reports.',
    },
    {
      q: 'What is the Career Readiness Score?',
      a: 'It is a composite headline metric (0–100) combining your target role coverage (40%), verified assessment scores (30%), completed roadmap milestones (20%), and study cadence consistency (10%).',
    },
    {
      q: 'Does the application operate if no external AI API key is configured?',
      a: 'Yes. Skillpath incorporates a complete deterministic rule-based multi-agent fallback engine that calculates exact topological prerequisites, grades quizzes, re-sequences roadmaps, and provides mentorship offline.',
    },
  ];

  const agentCards = [
    {
      name: 'SkillAnalyzerAgent',
      role: 'Skill Diagnostics & Profiling',
      icon: Cpu,
      color: 'bg-pastel-pink',
      desc: 'Evaluates proficiency from diagnostics, computing continuous 0–100 radar indices and isolating blind spots.',
    },
    {
      name: 'CareerMatchingAgent',
      role: 'Role Taxonomy Alignment',
      icon: Compass,
      color: 'bg-pastel-yellow',
      desc: 'Audits profile capabilities against industry role weights to calculate exact percentage matches.',
    },
    {
      name: 'LearningPathAgent',
      role: 'Topological Path Sequencer',
      icon: Layers,
      color: 'bg-pastel-orange',
      desc: 'Curates and sequences vetted free resources into phased roadmaps based on prerequisite graphs.',
    },
    {
      name: 'AssessmentAgent',
      role: 'Diagnostic Test Harness',
      icon: ShieldCheck,
      color: 'bg-pastel-lavender',
      desc: 'Dispatches real technical MCQs, evaluates conceptual understanding, and feeds weak topics back to the planner.',
    },
    {
      name: 'ProgressTrackerAgent',
      role: 'Tracks your pace',
      icon: TrendingUp,
      color: 'bg-pastel-sky',
      desc: 'Calculates completion percentages, daily study streaks, pace metrics, and tracks corporate milestones.',
    },
    {
      name: 'MentorAgent',
      role: 'Contextual Pedagogical Advisor',
      icon: Bot,
      color: 'bg-mint',
      desc: 'Delivers conversational guidance, clarifies complex concepts, and triggers dynamic roadmap updates.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7E8] text-[#10231C] font-sans selection:bg-[#C6F36B] selection:text-[#10231C]">
      
      {/* =========================================================================
          1. HERO SECTION (Deep Forest-Green with Soft Lime Corner Glow)
      ========================================================================= */}
      <section className="relative overflow-hidden bg-[#0B3B2E] text-white pt-6 pb-16 md:pb-[72px]">
        
        {/* Soft Lime Glow in Single Corner */}
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none opacity-20"
          style={{
            background: 'radial-gradient(circle, #C6F36B 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Floating Decorative Vector Accents */}
        <div className="absolute top-24 right-16 opacity-25 pointer-events-none hidden md:block">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="#C6F36B" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </div>
        <div className="absolute bottom-20 left-12 opacity-25 pointer-events-none hidden md:block">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="4" y="4" width="20" height="20" rx="6" stroke="#C6F36B" strokeWidth="2" />
          </svg>
        </div>

        {/* Top Navigation */}
        <div className="max-w-[1200px] mx-auto px-6 mb-16 relative z-20">
          <header className="flex items-center justify-between py-4 border-b border-[#135443]">
            {/* Logo Left */}
            <Logo size="md" variant="light" tagline={true} />

            {/* Desktop Nav Links Centered */}
            <nav className="hidden lg:flex items-center gap-8 text-[13px] font-semibold text-[#A9BDB1]">
              <a href="#why" className="hover:text-white transition-colors">Why Skillpath</a>
              <a href="#how" className="hover:text-white transition-colors">How It Works</a>
              <a href="#agents" className="hover:text-white transition-colors">Specialized Agents</a>
              <a href="#universities" className="hover:text-white transition-colors">For Institutions</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </nav>

            {/* Right Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="hidden sm:inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#C6F36B] hover:bg-[#B2E84F] text-[#10231C] font-bold text-xs uppercase tracking-wider transition-all"
              >
                Sign In
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden h-9 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2"
              >
                {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
                <span>Menu</span>
              </button>
            </div>
          </header>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-3 p-5 bg-[#072A21] border border-[#135443] rounded-2xl flex flex-col gap-3 text-sm font-medium">
              <a href="#why" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#A9BDB1] hover:text-white">Why Skillpath</a>
              <a href="#how" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#A9BDB1] hover:text-white">How It Works</a>
              <a href="#agents" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#A9BDB1] hover:text-white">Specialized Agents</a>
              <a href="#universities" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#A9BDB1] hover:text-white">For Institutions</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-2 text-[#A9BDB1] hover:text-white">FAQ</a>
              <button
                onClick={() => navigate('/login')}
                className="btn-lime w-full mt-2 h-10 text-xs"
              >
                Sign in to Platform
              </button>
            </div>
          )}
        </div>

        {/* Hero Content Grid */}
        <div className="max-w-[1200px] mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#135443] text-[11px] font-semibold tracking-wide uppercase text-[#A9BDB1] bg-[#072A21]/70">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6F36B]" />
              <span>Your path from skills to career</span>
            </div>

            {/* Headline with Signature Highlighted Word: 48px desktop, 34px mobile */}
            <h1 className="font-heading text-[34px] sm:text-[40px] lg:text-[48px] font-bold text-white tracking-tight leading-[1.15] max-w-xl">
              Find the right path to grow your{' '}
              <span className="highlight-word">skills</span>{' '}
              and define your career.
            </h1>

            <p className="font-sans text-[14px] text-[#A9BDB1] max-w-xl leading-relaxed">
              Standard curricula give everyone the same rigid courses. Skillpath deploys six specialized agents to understand your exact competencies, target career gaps, and construct self-healing roadmaps.
            </p>

            <div className="pt-1 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-lime gap-2"
              >
                <span>Get started with demo</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => navigate('/login')}
                className="btn-outline border-white/20 text-white hover:bg-white/10"
              >
                <span>Sign in as Arjun</span>
              </button>
            </div>
          </div>

          {/* Right Hero Column: Collage of Rounded & Arch-Shaped Pastel Tiles */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-[420px] h-[400px] flex items-center justify-center animate-[floatTiles_6s_ease-in-out_infinite]">
              <style>{`
                @keyframes floatTiles {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-6px); }
                }
              `}</style>

              {/* Grid of Pastel Tiles Collage */}
              <div className="grid grid-cols-3 gap-3 w-full">
                
                {/* Tile 1: Arch Pink - Python */}
                <div className="bg-pastel-pink rounded-t-full rounded-b-2xl p-4 flex flex-col items-center justify-center text-center shadow-soft h-32">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0B3B2E] mb-2 shadow-xs">
                    <FileCode2 size={18} />
                  </div>
                  <span className="text-xs font-bold text-[#10231C]">Python</span>
                  <span className="text-[10px] text-[#10231C]/70">70% Mastered</span>
                </div>

                {/* Tile 2: Rounded Yellow - SQL */}
                <div className="bg-pastel-yellow rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-soft h-32">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0B3B2E] mb-2 shadow-xs">
                    <Database size={18} />
                  </div>
                  <span className="text-xs font-bold text-[#10231C]">SQL</span>
                  <span className="text-[10px] text-[#10231C]/70">60% Mastered</span>
                </div>

                {/* Tile 3: Arch Orange - HTML */}
                <div className="bg-pastel-orange rounded-t-full rounded-b-2xl p-4 flex flex-col items-center justify-center text-center shadow-soft h-32">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0B3B2E] mb-2 shadow-xs">
                    <Code2 size={18} />
                  </div>
                  <span className="text-xs font-bold text-[#10231C]">HTML</span>
                  <span className="text-[10px] text-[#10231C]/70">55% Foundational</span>
                </div>

                {/* Center Large Tile: Target Career Banner */}
                <div className="col-span-3 bg-white rounded-2xl p-5 border-2 border-[#C6F36B] shadow-lift flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B3B2E]">Target Role</span>
                    <h3 className="font-heading text-lg font-semibold text-[#10231C]">Full Stack Developer</h3>
                    <p className="text-xs text-[#4B5E55]">Path to mastery: JavaScript, React, Node.js</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#E4F4E8] flex items-center justify-center text-[#0B3B2E]">
                    <Sparkles size={20} />
                  </div>
                </div>

                {/* Tile 4: Arch Lavender - JavaScript */}
                <div className="bg-pastel-lavender rounded-t-full rounded-b-2xl p-4 flex flex-col items-center justify-center text-center shadow-soft h-32">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0B3B2E] mb-2 shadow-xs">
                    <Code2 size={18} />
                  </div>
                  <span className="text-xs font-bold text-[#10231C]">JavaScript</span>
                  <span className="text-[10px] font-semibold text-[#B7791F]">High Priority</span>
                </div>

                {/* Tile 5: Rounded Sky - React */}
                <div className="bg-pastel-sky rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-soft h-32">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0B3B2E] mb-2 shadow-xs">
                    <Layers size={18} />
                  </div>
                  <span className="text-xs font-bold text-[#10231C]">React</span>
                  <span className="text-[10px] font-semibold text-[#B7791F]">Phase 2</span>
                </div>

                {/* Tile 6: Arch Mint - Node.js */}
                <div className="bg-mint rounded-t-full rounded-b-2xl p-4 flex flex-col items-center justify-center text-center shadow-soft h-32">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0B3B2E] mb-2 shadow-xs">
                    <Cpu size={18} />
                  </div>
                  <span className="text-xs font-bold text-[#10231C]">Node.js</span>
                  <span className="text-[10px] font-semibold text-[#B7791F]">Phase 2</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          2. LOGO STRIP ON CREAM
      ========================================================================= */}
      <section className="border-b border-[#E8E4D2] bg-[#FAF7E8] py-8">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-[#4B5E55] font-semibold mb-6">
            Learning content sourced from verified open curricula
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 font-heading text-lg font-medium text-[#4B5E55]/80">
            <span className="hover:text-[#10231C] transition-colors">MDN Web Docs</span>
            <span className="hover:text-[#10231C] transition-colors">freeCodeCamp</span>
            <span className="hover:text-[#10231C] transition-colors">React Docs</span>
            <span className="hover:text-[#10231C] transition-colors">Node.js Docs</span>
            <span className="hover:text-[#10231C] transition-colors">Python.org</span>
            <span className="hover:text-[#10231C] transition-colors">Harvard CS50</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. WHY SKILLPATH (Tabbed Experience + Large Rounded Card)
      ========================================================================= */}
      <section id="why" className="py-20 md:py-28 bg-[#FAF7E8]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="section-pill mb-4">
            <span className="section-pill-dot" />
            <span>Why Skillpath</span>
          </div>
          
          <h2 className="font-heading text-2xl font-bold text-[#10231C] mb-12">
            Why <span className="highlight-word">personalized</span> learning outperforms standard courses
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Tab Toggles & Descriptions */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex gap-2 p-1.5 bg-[#E8E4D2]/60 rounded-full w-fit">
                {(['PERSONALIZED', 'ADAPTIVE', 'AGENTIC'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`h-10 px-5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      activeTab === tab
                        ? 'bg-[#0B3B2E] text-white shadow-xs'
                        : 'text-[#4B5E55] hover:text-[#10231C]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'PERSONALIZED' && (
                <div className="card-modern space-y-4">
                  <h3 className="font-heading text-base font-semibold text-[#10231C]">
                    Targeted Skill-Gap Elimination
                  </h3>
                  <p className="font-sans text-[15px] text-[#4B5E55] leading-relaxed">
                    Instead of a generic 40-hour boot camp, Skillpath profiles what you already know (like Python and SQL) and only assigns the exact missing technologies required for your destination career.
                  </p>
                  <ul className="space-y-2 pt-2 text-sm text-[#10231C]">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#1F8A4C]" />
                      Continuous 0–100 skill proficiency scoring
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#1F8A4C]" />
                      Dynamic time-to-ready schedule recalculations
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'ADAPTIVE' && (
                <div className="card-modern space-y-4">
                  <h3 className="font-heading text-base font-semibold text-[#10231C]">
                    Self-Healing Curriculum Optimization
                  </h3>
                  <p className="font-sans text-[15px] text-[#4B5E55] leading-relaxed">
                    Struggled on a JavaScript asynchronous quiz? The platform detects the failure instantly, slows down pacing, and injects spaced-repetition revision modules until mastery is proven.
                  </p>
                  <ul className="space-y-2 pt-2 text-sm text-[#10231C]">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#1F8A4C]" />
                      Automatic remediation when quiz scores dip below 60%
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#1F8A4C]" />
                      Prerequisite acceleration on 85%+ mastery confirmations
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'AGENTIC' && (
                <div className="card-modern space-y-4">
                  <h3 className="font-heading text-base font-semibold text-[#10231C]">
                    Collaborative Multi-Agent Architecture
                  </h3>
                  <p className="font-sans text-[15px] text-[#4B5E55] leading-relaxed">
                    Six specialized learning agents continuously deliberate over diagnostics, curriculum graphs, market salaries, and pacing. Every decision carries an auditable reasoning trail.
                  </p>
                  <ul className="space-y-2 pt-2 text-sm text-[#10231C]">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#1F8A4C]" />
                      Explainable AI drawer for every recommendation
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-[#1F8A4C]" />
                      Deterministic offline mode fallback for full enterprise reliability
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Right: Forest Green Card with Re-Ordering Roadmap Visual */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-[20px] bg-[#0B3B2E] p-8 text-white border border-[#135443] shadow-lift">
                <div
                  className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none opacity-20"
                  style={{
                    background: 'radial-gradient(circle, #C6F36B 0%, transparent 70%)',
                    filter: 'blur(50px)',
                  }}
                />

                <div className="relative z-10 space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#C6F36B]">
                    Self-Adapting Roadmap Sequence
                  </div>
                  <h4 className="font-heading text-base font-semibold text-white">
                    {activeTab} Engine in Action
                  </h4>

                  <div className="space-y-3 pt-2 text-xs">
                    <div className="p-3.5 bg-[#072A21] border border-[#135443] rounded-xl flex items-center justify-between">
                      <span className="text-[#C6F36B] font-semibold">01. JavaScript Asynchronous Core</span>
                      <span className="text-[#C6F36B] text-[11px] font-bold px-2 py-0.5 rounded bg-[#C6F36B]/10">
                        Remediation Injected
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#072A21] border border-[#135443] rounded-xl flex items-center justify-between">
                      <span className="text-white">02. React Functional Components</span>
                      <span className="text-[#F5C451] text-[11px] font-bold px-2 py-0.5 rounded bg-[#F5C451]/10">
                        Paced / Deferred
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#072A21] border border-[#135443] rounded-xl flex items-center justify-between">
                      <span className="text-[#A9BDB1]">03. Node.js REST API Architecture</span>
                      <span className="text-[#A9BDB1] text-[11px]">Phase 2</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#135443] flex items-center justify-between text-xs text-[#A9BDB1]">
                    <span>Orchestrator Consensus: Unanimous</span>
                    <span className="text-[#C6F36B] font-semibold">Confidence: 94%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          4. HOW IT WORKS (4 Steps)
      ========================================================================= */}
      <section id="how" className="py-20 md:py-28 bg-white border-y border-[#E8E4D2]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="section-pill">
              <span className="section-pill-dot" />
              <span>How It Works</span>
            </div>
            <h2 className="font-heading text-2xl font-bold text-[#10231C]">
              Four steps to <span className="highlight-word">readiness</span>
            </h2>
            <p className="text-sm text-[#4B5E55]">
              A continuous loop of diagnostics, gap analysis, sequenced learning, and self-healing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Profile Ingestion',
                desc: 'Upload a resume or select skills to build a verified baseline across 35+ technologies.',
                color: 'bg-pastel-pink',
              },
              {
                step: '2',
                title: 'Role Gap Audit',
                desc: 'CareerMatchingAgent evaluates current skills against target industry requirements.',
                color: 'bg-pastel-yellow',
              },
              {
                step: '3',
                title: 'Roadmap Synthesis',
                desc: 'LearningPathAgent orders courses and capstones strictly respecting directional prerequisites.',
                color: 'bg-pastel-sky',
              },
              {
                step: '4',
                title: 'Adaptive Calibration',
                desc: 'Diagnostic assessments dynamically pace the plan, inject revision items, and prove mastery.',
                color: 'bg-mint',
              },
            ].map((s) => (
              <div key={s.step} className="card-modern p-6 flex flex-col justify-between space-y-4">
                <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center font-heading text-xl font-bold text-[#10231C]`}>
                  {s.step}
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-heading text-lg font-semibold text-[#10231C]">
                    {s.title}
                  </h3>
                  <p className="text-xs text-[#4B5E55] leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. MEET THE AGENTS (Six Arch Cards in Pastel Colors)
      ========================================================================= */}
      <section id="agents" className="py-20 md:py-28 bg-[#FAF7E8]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="section-pill">
              <span className="section-pill-dot" />
              <span>Our Agents</span>
            </div>
            <h2 className="font-heading text-2xl font-bold text-[#10231C]">
              Meet the six specialized <span className="highlight-word">agents</span>
            </h2>
            <p className="text-sm text-[#4B5E55]">
              Each agent owns a dedicated pedagogical domain and deliberates under the master Orchestrator.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agentCards.map((ag) => {
              const Icon = ag.icon;
              return (
                <div key={ag.name} className={`card-arch ${ag.color}`}>
                  {/* Circular Line Icon Badge */}
                  <div className="w-14 h-14 rounded-full bg-white mx-auto flex items-center justify-center text-[#0B3B2E] shadow-soft mb-4">
                    <Icon size={24} strokeWidth={1.75} />
                  </div>

                  <h3 className="font-heading text-lg font-semibold text-[#10231C]">
                    {ag.name}
                  </h3>
                  <div className="text-xs font-semibold text-[#0B3B2E] mt-0.5 mb-3">
                    {ag.role}
                  </div>
                  <p className="text-xs text-[#10231C]/80 leading-relaxed px-2">
                    {ag.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. FOR UNIVERSITIES & ORGANIZATIONS
      ========================================================================= */}
      <section id="universities" className="py-20 bg-white border-y border-[#E8E4D2]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <div className="section-pill">
                <span className="section-pill-dot" />
                <span>For Institutions</span>
              </div>
              
              <h2 className="font-heading text-2xl font-bold text-[#10231C] leading-tight">
                Cohort skill-gap analysis at <span className="highlight-word">institutional</span> scale
              </h2>
              
              <p className="text-[15px] text-[#4B5E55] leading-relaxed">
                Empower academic deans, career service leaders, and engineering managers to monitor learners across classrooms or departments. Identify curriculum blind spots early and export accredited verification CSV records.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="card-modern p-4 bg-[#FAF7E8]">
                  <div className="font-heading text-[32px] font-bold text-[#0B3B2E]">40+</div>
                  <div className="text-xs text-[#4B5E55] mt-1">Seeded Student Cohort</div>
                </div>
                <div className="card-modern p-4 bg-[#FAF7E8]">
                  <div className="font-heading text-[32px] font-bold text-[#0B3B2E]">100%</div>
                  <div className="text-xs text-[#4B5E55] mt-1">Exportable Audit CSV Logs</div>
                </div>
              </div>

              <button
                onClick={() => navigate('/cohort-analytics')}
                className="btn-forest gap-2"
              >
                <span>Explore cohort analytics</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="lg:col-span-6">
              <div className="card-modern p-6 bg-[#FAF7E8] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E4D2]">
                  <span className="font-heading text-base font-semibold text-[#10231C]">Cohort Gap Matrix (Sample)</span>
                  <span className="text-xs font-semibold text-[#1F8A4C] bg-[#E4F4E8] px-2.5 py-0.5 rounded-full">
                    Active Audit
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-medium text-[#10231C] mb-1">
                      <span>JavaScript Asynchronous Execution</span>
                      <span className="text-[#B91C1C] font-semibold">62% Missing in Cohort</span>
                    </div>
                    <div className="w-full h-2 bg-[#E8E4D2] rounded-full overflow-hidden">
                      <div className="h-full bg-[#B91C1C] rounded-full w-[62%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium text-[#10231C] mb-1">
                      <span>React State Management & Lifecycles</span>
                      <span className="text-[#B7791F] font-semibold">48% Missing in Cohort</span>
                    </div>
                    <div className="w-full h-2 bg-[#E8E4D2] rounded-full overflow-hidden">
                      <div className="h-full bg-[#F5C451] rounded-full w-[48%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-medium text-[#10231C] mb-1">
                      <span>Node.js REST Services & Microservices</span>
                      <span className="text-[#B7791F] font-semibold">41% Missing in Cohort</span>
                    </div>
                    <div className="w-full h-2 bg-[#E8E4D2] rounded-full overflow-hidden">
                      <div className="h-full bg-[#F59E5B] rounded-full w-[41%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FAQ ACCORDION
      ========================================================================= */}
      <section id="faq" className="py-20 md:py-28 bg-[#FAF7E8]">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <div className="section-pill">
              <span className="section-pill-dot" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="font-heading text-2xl font-bold text-[#10231C]">
              Frequently asked <span className="highlight-word">questions</span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="card-modern p-0 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 bg-white hover:bg-[#FAF7E8]/50 transition-colors"
                  >
                    <span className="font-heading text-base font-semibold text-[#10231C]">
                      {faq.q}
                    </span>
                    <ChevronDown size={18} className={`text-[#4B5E55] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-[#4B5E55] leading-relaxed border-t border-[#E8E4D2] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FINAL CTA BAND
      ========================================================================= */}
      <section className="py-20 bg-[#0B3B2E] text-white text-center">
        <div className="max-w-[700px] mx-auto px-6 space-y-6">
          <h2 className="font-heading text-2xl font-bold text-white leading-tight">
            Accelerate your career readiness <span className="highlight-word">today</span>
          </h2>
          <p className="text-[15px] text-[#A9BDB1] leading-relaxed">
            Experience multi-agent educational intelligence. Preloaded with demo student Arjun Kumar targeting Full Stack Development.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-lime gap-2"
            >
              <span>Launch interactive demo</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. FOOTER
      ========================================================================= */}
      <footer className="py-12 bg-[#072A21] text-[#A9BDB1] text-xs border-t border-[#135443]">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="md" variant="light" tagline={true} />
          
          <div className="flex items-center gap-6 text-[13px] font-medium">
            <a href="#why" className="hover:text-white transition-colors">Why Skillpath</a>
            <a href="#how" className="hover:text-white transition-colors">How It Works</a>
            <a href="#agents" className="hover:text-white transition-colors">Agents</a>
            <a href="#universities" className="hover:text-white transition-colors">Institutions</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="text-[12px] text-[#A9BDB1]/70">
            © 2026 Skillpath. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
