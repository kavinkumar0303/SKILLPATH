import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  BarChart3,
  Target,
  Route,
  ClipboardCheck,
  TrendingUp,
  FileText,
  Activity,
  Award,
  FlaskConical,
  LineChart,
  Users,
  Menu,
  X,
} from 'lucide-react';
import Logo from './Logo';

// Core primary navigation items
const coreNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'My Profile', icon: User },
  { to: '/skill-analysis', label: 'Skill Analysis', icon: BarChart3 },
  { to: '/career-match', label: 'Career Match', icon: Target },
  { to: '/learning-path', label: 'Learning Path', icon: Route },
  { to: '/assessments', label: 'Assessments', icon: ClipboardCheck },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/resume', label: 'Resume', icon: FileText },
  { to: '/agent-activity', label: 'Agent Activity', icon: Activity },
];

// Advanced items hidden behind feature flag
const advancedNavItems = [
  { to: '/skill-passport', label: 'Skill Passport', icon: Award },
  { to: '/simulator', label: 'Simulator', icon: FlaskConical },
  { to: '/insights', label: 'Insights', icon: LineChart },
  { to: '/cohort-analytics', label: 'Cohort Analytics', icon: Users },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  // Feature flag check (hidden by default)
  const showAdvanced = typeof window !== 'undefined' && localStorage.getItem('sb_show_advanced') === 'true';

  const visibleNavItems = showAdvanced ? [...coreNavItems, ...advancedNavItems] : coreNavItems;

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-full bg-[#0B3B2E] text-[#C6F36B] shadow-md hover:bg-[#072A21] transition-colors"
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#072A21]/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Fixed 240px Forest-Green Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-[240px] bg-[#0B3B2E] text-[#F3F6EF] z-40 flex flex-col justify-between transition-transform duration-200 border-r border-[#135443] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 px-6 flex items-center border-b border-[#135443]">
            <Logo size="md" variant="light" showText={true} />
          </div>

          {/* Navigation Links List */}
          <nav className="p-3 space-y-1.5" aria-label="Main Navigation">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#C6F36B] text-[#10231C] font-semibold shadow-xs'
                        : 'text-[#F3F6EF]/90 hover:bg-[#135443] hover:text-white'
                    }`
                  }
                >
                  <Icon size={20} className="shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Pinned Bottom Version Text */}
        <div className="p-4 border-t border-[#135443] text-xs text-[#A9BDB1]">
          <div className="flex items-center justify-between">
            <span>Skillpath Enterprise</span>
            <span className="font-semibold text-[#C6F36B]">v1.0</span>
          </div>
          <div className="text-[11px] text-[#A9BDB1]/70 mt-0.5">
            Your path from skills to career
          </div>
        </div>
      </aside>
    </>
  );
}
