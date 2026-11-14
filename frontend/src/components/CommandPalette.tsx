import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  User,
  BarChart3,
  Target,
  Route,
  ClipboardCheck,
  TrendingUp,
  MessageSquare,
  Activity,
  Award,
  FlaskConical,
  LineChart,
  Users,
  Play,
  X,
} from 'lucide-react';
import { useToast } from './Toast';
import client from '../api/client';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    const handleCustomOpen = () => setOpen((prev) => !prev);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleCustomOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, []);

  const commands = [
    { name: 'Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard'), category: 'Navigation' },
    { name: 'My Profile', icon: User, action: () => navigate('/profile'), category: 'Navigation' },
    { name: 'Skill Analysis', icon: BarChart3, action: () => navigate('/skill-analysis'), category: 'Navigation' },
    { name: 'Career Match', icon: Target, action: () => navigate('/career-match'), category: 'Navigation' },
    { name: 'Learning Path', icon: Route, action: () => navigate('/learning-path'), category: 'Navigation' },
    { name: 'Assessments', icon: ClipboardCheck, action: () => navigate('/assessments'), category: 'Navigation' },
    { name: 'Progress Tracking', icon: TrendingUp, action: () => navigate('/progress'), category: 'Navigation' },
    { name: 'Agent Activity', icon: Activity, action: () => navigate('/agent-activity'), category: 'Navigation' },
    { name: 'Skill Passport', icon: Award, action: () => navigate('/skill-passport'), category: 'Navigation' },
    { name: 'Role Simulator', icon: FlaskConical, action: () => navigate('/simulator'), category: 'Navigation' },
    { name: 'Market Insights', icon: LineChart, action: () => navigate('/insights'), category: 'Navigation' },
    { name: 'Cohort Analytics', icon: Users, action: () => navigate('/cohort-analytics'), category: 'Navigation' },
    {
      name: 'Run Multi-Agent Demo Scenario',
      icon: Play,
      category: 'Actions',
      action: async () => {
        addToast({
          type: 'info',
          title: 'Initiating Multi-Agent Demo',
          message: 'Executing profile load -> analysis -> match -> roadmap -> simulated quiz -> adaptation.',
        });
        try {
          await client.post('/demo/run');
          addToast({
            type: 'success',
            title: 'Demo Flow Completed',
            message: 'Adaptive revisions applied based on assessment evaluation.',
          });
          navigate('/agent-activity');
        } catch {
          addToast({
            type: 'error',
            title: 'Demo Error',
            message: 'Could not connect to backend demo runner.',
          });
        }
      },
    },
  ];

  const filtered = commands.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#072A21]/60 backdrop-blur-xs flex items-start justify-center pt-24 px-4">
      <div className="bg-white rounded-[24px] border border-[#E8E4D2] shadow-2xl w-full max-w-lg overflow-hidden font-sans">
        <div className="flex items-center px-5 border-b border-[#E8E4D2]">
          <Search size={18} className="text-[#4B5E55]" />
          <input
            type="text"
            placeholder="Search pages, tools, or run agent scenario..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full px-3.5 py-4 text-sm outline-none text-[#10231C] placeholder-[#4B5E55]/60 bg-transparent"
          />
          <button
            onClick={() => setOpen(false)}
            className="text-[#4B5E55] hover:text-[#10231C] p-1 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#4B5E55]">
              No matching pages or commands found.
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    cmd.action();
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-[#FAF7E8] text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className="text-[#4B5E55] group-hover:text-[#0B3B2E]" />
                    <span className="text-sm font-medium text-[#10231C]">
                      {cmd.name}
                    </span>
                  </div>
                  <span className="text-xs text-[#4B5E55]/70">
                    {cmd.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="px-5 py-3 border-t border-[#E8E4D2] bg-[#FAF7E8] text-[11px] text-[#4B5E55] flex justify-between">
          <span>Press Esc to close</span>
          <span>Shortcut: Ctrl + K</span>
        </div>
      </div>
    </div>
  );
}
