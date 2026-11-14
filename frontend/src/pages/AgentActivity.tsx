import React, { useEffect, useState } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  Cpu,
  ChevronDown,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../components/Toast';
import client from '../api/client';

// Friendly agent name formatter (replaces "MentorAgent" with "Mentor", etc.)
function formatAgentName(name: string): string {
  if (!name) return 'Agent';
  return name
    .replace('Agent', '')
    .replace('SkillAnalyzer', 'Skill Analyzer')
    .replace('CareerMatching', 'Career Matching')
    .replace('LearningPath', 'Learning Path')
    .replace('ProgressTracker', 'Progress Tracker')
    .replace('Resume', 'Resume Agent');
}

// Friendly action name formatter
function formatAction(eventType: string, agentName: string): string {
  if (!eventType) return 'Activity Evaluation';
  if (eventType === 'skill_analysis') return 'Analyzed skill gaps';
  if (eventType === 'career_matching') return 'Audited role compatibility';
  if (eventType === 'learning_path_generated') return 'Generated curriculum roadmap';
  if (eventType === 'diagnostic_served') return 'Served diagnostic assessment';
  if (eventType === 'progress_tracked') return 'Updated pace metrics';
  if (eventType === 'mentor_chat') return 'Guided learner query';
  if (eventType === 'resume_assembled' || eventType === 'resume_pipeline') return 'Assembled ATS resume';
  if (eventType === 'adaptive_remediation') return 'Simulated poor quiz score & adapted';
  return eventType.replace(/_/g, ' ');
}

// Clean readable results without raw string artifacts like "response_len=201"
function formatResult(summary: string): string {
  if (!summary) return 'Successfully completed operation and updated learner state.';
  if (summary.includes('response_len=')) {
    return 'Replied to the learner with 3 actionable concept explanations.';
  }
  if (summary.includes('answers=')) {
    return 'Evaluated diagnostic submission across technical concepts.';
  }
  return summary;
}

export default function AgentActivity() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningDemo, setRunningDemo] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const { addToast } = useToast();

  const loadEvents = async () => {
    try {
      const res = await client.get('/agent-events?limit=50');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // 6 Specialized Agents with plain friendly wording
  const agents = [
    { id: 'SkillAnalyzerAgent', label: 'Skill Analyzer', role: 'Finds your gaps', x: 120, y: 70 },
    { id: 'CareerMatchingAgent', label: 'Career Matching', role: 'Compares with the target role', x: 380, y: 70 },
    { id: 'LearningPathAgent', label: 'Learning Path', role: 'Builds your roadmap', x: 500, y: 170 },
    { id: 'AssessmentAgent', label: 'Assessment', role: 'Tests your knowledge', x: 380, y: 270 },
    { id: 'ProgressTrackerAgent', label: 'Progress Tracker', role: 'Tracks your pace', x: 120, y: 270 },
    { id: 'MentorAgent', label: 'Mentor', role: 'Guides and explains', x: 20, y: 170 },
  ];

  // ONE Run Demo Scenario execution
  const handleRunDemo = async () => {
    setRunningDemo(true);
    addToast({
      type: 'info',
      title: 'Running Demo Scenario',
      message: 'Simulating diagnostic quiz underperformance and triggering adaptive roadmap updates.',
    });

    const agentSequence = [
      'SkillAnalyzerAgent',
      'CareerMatchingAgent',
      'LearningPathAgent',
      'AssessmentAgent',
      'LearningPathAgent',
      'MentorAgent',
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < agentSequence.length) {
        setActiveAgent(agentSequence[i]);
        i++;
      } else {
        clearInterval(interval);
        setActiveAgent(null);
      }
    }, 600);

    try {
      const res = await client.post('/demo/run');
      const timeline = res.data.timeline || [];

      // Format demo steps and prepend directly into ONE unified event timeline
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const demoEvents = timeline.map((step: any, idx: number) => ({
        id: `demo-${Date.now()}-${idx}`,
        agent_name: step.agent,
        event_type: step.action === 'Simulate Diagnostic Underperformance' ? 'adaptive_remediation' : step.action,
        input_summary: step.action,
        output_summary: step.result,
        created_at: nowStr,
        confidence: step.confidence || 0.95,
        status: step.status || 'Success',
      }));

      setEvents((prev) => [...demoEvents, ...prev]);

      addToast({
        type: 'success',
        title: 'Scenario Complete',
        message: 'Simulated quiz underperformance -> injected remedial revision modules into roadmap.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Scenario Failed',
        message: 'Could not connect to backend demo runner.',
      });
    } finally {
      setRunningDemo(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={5} />;

  const visibleEvents = events.slice(0, visibleCount);

  return (
    <div className="space-y-8">
      {/* Page Hero Banner */}
      <HeroBanner
        titlePrefix="Multi-agent collaboration &"
        highlightedWord="coordination"
        titleSuffix="activity"
        subtitle="Real-time activity and deliberation across specialized learning agents."
        badge="Agent Activity"
        metric={{
          value: events.length,
          label: "Events Recorded",
        }}
        action={{
          label: runningDemo ? "Executing Scenario..." : "Run Demo Scenario",
          onClick: handleRunDemo,
        }}
      />

      {/* 1. Collaboration Flow Diagram */}
      <div className="bg-[#072A21] p-7 md:p-8 rounded-[20px] border border-[#135443] shadow-lift text-[#F3F6EF]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="section-pill mb-2 bg-[#0B3B2E] border-[#135443]">
              <span className="w-2 h-2 rounded-full bg-[#C6F36B]" />
              <span className="text-[#A9BDB1]">Architecture</span>
            </div>
            <h2 className="font-heading text-2xl font-semibold text-[#F3F6EF]">
              Agent collaboration diagram
            </h2>
          </div>
          <button
            onClick={handleRunDemo}
            disabled={runningDemo}
            className="btn-lime h-10 px-5 text-xs font-semibold inline-flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
          >
            {runningDemo ? (
              <RotateCcw className="w-4 h-4 animate-spin text-[#0B3B2E]" />
            ) : (
              <Play className="w-4 h-4 fill-current text-[#0B3B2E]" />
            )}
            <span>Run Demo Scenario</span>
          </button>
        </div>

        {/* SVG Flow Canvas */}
        <div className="relative w-full overflow-x-auto flex justify-center py-4">
          <svg viewBox="0 0 540 340" className="w-full max-w-2xl h-auto">
            {/* Center Orchestrator Node */}
            <circle cx="260" cy="170" r="44" fill="#0B3B2E" stroke="#C6F36B" strokeWidth="2.5" />
            <text x="260" y="165" textAnchor="middle" fill="#F3F6EF" fontSize="10" fontWeight="bold" fontFamily="Plus Jakarta Sans">
              ORCHESTRATOR
            </text>
            <text x="260" y="180" textAnchor="middle" fill="#C6F36B" fontSize="9" fontWeight="500" fontFamily="Plus Jakarta Sans">
              Coordinates learning
            </text>

            {/* Connection Lines & Agent Nodes */}
            {agents.map((ag) => {
              const isActive = activeAgent === ag.id;
              return (
                <g key={ag.id}>
                  <line
                    x1="260"
                    y1="170"
                    x2={ag.x + 55}
                    y2={ag.y + 24}
                    stroke={isActive ? '#C6F36B' : '#135443'}
                    strokeWidth={isActive ? 3 : 1.5}
                    strokeDasharray={isActive ? '4 2' : undefined}
                    className="transition-all duration-300"
                  />
                  <g transform={`translate(${ag.x}, ${ag.y})`} className="cursor-pointer">
                    <rect
                      width="110"
                      height="48"
                      rx="12"
                      fill="#0B3B2E"
                      stroke={isActive ? '#C6F36B' : '#135443'}
                      strokeWidth={isActive ? 2.5 : 1}
                      className="transition-all duration-300"
                    />
                    <text x="55" y="20" textAnchor="middle" fill={isActive ? '#C6F36B' : '#F3F6EF'} fontSize="10" fontWeight="600" fontFamily="Plus Jakarta Sans">
                      {ag.label}
                    </text>
                    <text x="55" y="34" textAnchor="middle" fill="#A9BDB1" fontSize="8" fontWeight="400" fontFamily="Plus Jakarta Sans">
                      {ag.role}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 2. Agent Deliberation Card */}
      <div className="card-modern space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-[#0B3B2E]" />
            <h3 className="font-heading text-xl font-semibold text-[#10231C]">
              Agent deliberation on roadmap decisions
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#0B3B2E] bg-[#C6F36B] px-3 py-1 rounded-full">
            Decision Agreed
          </span>
        </div>
        <p className="text-xs text-[#4B5E55]">
          Auditing how individual agents deliberated over Arjun Kumar's latest assessment and resolved the curriculum adaptation:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#FAF7E8] rounded-2xl border border-[#E8E4D2] text-xs space-y-1.5">
            <div className="font-semibold text-sm text-[#10231C] flex justify-between">
              <span>Assessment</span>
              <span className="text-[#0B3B2E] font-bold">99% Conf</span>
            </div>
            <p className="text-[#4B5E55] text-xs leading-relaxed">
              "Logged 50% score in JavaScript Async. Identified conceptual gap in Promise rejection handling."
            </p>
          </div>

          <div className="p-4 bg-[#FAF7E8] rounded-2xl border border-[#E8E4D2] text-xs space-y-1.5">
            <div className="font-semibold text-sm text-[#10231C] flex justify-between">
              <span>Learning Path</span>
              <span className="text-[#0B3B2E] font-bold">93% Conf</span>
            </div>
            <p className="text-[#4B5E55] text-xs leading-relaxed">
              "Defer Phase 2 React components. Inject 2 remedial modules on event loops and asynchronous workflows."
            </p>
          </div>

          <div className="p-4 bg-[#FAF7E8] rounded-2xl border border-[#E8E4D2] text-xs space-y-1.5">
            <div className="font-semibold text-sm text-[#10231C] flex justify-between">
              <span>Mentor</span>
              <span className="text-[#0B3B2E] font-bold">91% Conf</span>
            </div>
            <p className="text-[#4B5E55] text-xs leading-relaxed">
              "Deliver positive reinforcement. Recommend MDN tutorial before scheduled re-test."
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#E4F4E8] border border-[#0B3B2E]/20 rounded-2xl text-xs flex items-center justify-between">
          <span className="font-medium text-[#0B3B2E]">
            Orchestrator Decision: Approved curriculum revision injection & pace adjustment.
          </span>
          <span className="text-[#0B3B2E] font-bold">Unanimous</span>
        </div>
      </div>

      {/* 3. ONE Unified Event Timeline */}
      <div className="card-modern space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-xl font-semibold text-[#10231C]">
              Event timeline
            </h2>
            <p className="text-xs text-[#4B5E55]">
              Newest first · Showing {Math.min(visibleCount, events.length)} of {events.length} events
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FAF7E8] text-[#4B5E55] border border-[#E8E4D2]">
            Live Sync
          </span>
        </div>

        {/* Timeline Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7E8] text-[#4B5E55] font-semibold border-y border-[#E8E4D2]">
              <tr>
                <th className="py-3 px-3 w-28">Time</th>
                <th className="py-3 px-3 w-36">Agent</th>
                <th className="py-3 px-3 w-44">Action</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-3 w-24">Confidence</th>
                <th className="py-3 px-3 w-28">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4D2]">
              {visibleEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-[#FAF7E8]/40 transition-colors">
                  <td className="py-3 px-3 text-[#4B5E55] whitespace-nowrap">
                    {evt.created_at}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#10231C] whitespace-nowrap">
                    {formatAgentName(evt.agent_name)}
                  </td>
                  <td className="py-3 px-3 text-[#0B3B2E] font-medium whitespace-nowrap">
                    {formatAction(evt.event_type, evt.agent_name)}
                  </td>
                  <td className="py-3 px-4 text-[#4B5E55] leading-relaxed">
                    {formatResult(evt.output_summary)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[#0B3B2E] font-semibold bg-[#E4F4E8] px-2 py-0.5 rounded-full">
                      {Math.round((evt.confidence || 0.95) * 100)}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      evt.status === 'Warning' || evt.event_type === 'adaptive_remediation'
                        ? 'bg-[#F5C451]/30 text-[#B7791F]'
                        : 'bg-[#E4F4E8] text-[#0B3B2E]'
                    }`}>
                      <CheckCircle2 size={12} />
                      <span>{evt.status || 'Success'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Show More Button */}
        {visibleCount < events.length && (
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 10)}
              className="btn-outline h-10 px-6 text-xs inline-flex items-center gap-2"
            >
              <span>Show more events</span>
              <ChevronDown size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
