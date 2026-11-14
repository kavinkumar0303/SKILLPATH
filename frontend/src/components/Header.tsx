import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, User, Info, LogOut, Search } from 'lucide-react';
import { useClickOutside, useLocalStorage } from '../lib/hooks';
import { useAuth } from '../context/AuthContext';

const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/profile': 'My Profile',
  '/skill-analysis': 'Skill Analysis',
  '/career-match': 'Career Match',
  '/learning-path': 'Learning Path',
  '/assessments': 'Assessments',
  '/progress': 'Progress Tracking',
  '/resume': 'Resume Builder',
  '/agent-activity': 'Agent Activity',
  '/skill-passport': 'Skill Passport',
  '/simulator': 'Role Simulator',
  '/insights': 'Market Insights',
  '/cohort-analytics': 'Cohort Analytics',
  '/weekly-planner': 'Weekly Planner',
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [role, setRole] = useLocalStorage('sb-role', 'Learner');
  const [roleOpen, setRoleOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [aiMode] = useLocalStorage('sb-ai-mode', 'live');

  useClickOutside(roleRef, () => setRoleOpen(false));
  useClickOutside(avatarRef, () => setAvatarOpen(false));

  const currentPage = breadcrumbMap[location.pathname] || 'Workspace';
  const isLive = aiMode === 'live';

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#FAF7E8] border-b border-[#E8E4D2] flex items-center justify-between px-6 md:px-8">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[#4B5E55] pl-10 md:pl-0 font-medium">
        <span>Skillpath</span>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-[#10231C]">{currentPage}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Command Palette Trigger */}
        <button
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
          }}
          className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-full bg-white border border-[#E8E4D2] text-xs font-medium text-[#4B5E55] hover:border-[#0B3B2E] transition-colors"
          title="Search anything (Ctrl+K)"
        >
          <Search size={14} />
          <span>Search</span>
          <kbd className="text-[10px] bg-[#FAF7E8] px-1.5 py-0.5 rounded border border-[#E8E4D2] font-sans">
            Ctrl+K
          </kbd>
        </button>

        {/* Role Selector Pill */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setRoleOpen(!roleOpen)}
            className="h-9 px-3 rounded-full bg-white border border-[#E8E4D2] text-xs font-semibold text-[#10231C] inline-flex items-center gap-1.5 hover:border-[#0B3B2E] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#1F8A4C]" />
            <span>{role}</span>
            <ChevronDown size={14} className="text-[#4B5E55]" />
          </button>
          {roleOpen && (
            <div className="absolute right-0 top-full mt-1.5 bg-white border border-[#E8E4D2] rounded-2xl shadow-lift z-40 w-48 p-1.5">
              {['Learner', 'Admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setRoleOpen(false);
                    if (r === 'Admin') navigate('/cohort-analytics');
                    else navigate('/dashboard');
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    r === role
                      ? 'bg-[#C6F36B] text-[#10231C] font-semibold'
                      : 'text-[#10231C] hover:bg-[#FAF7E8]'
                  }`}
                >
                  {r} {r === 'Admin' ? 'Mode (Cohort View)' : 'Mode (Personal)'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Mode Badge */}
        <span
          className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
            isLive
              ? 'bg-[#E4F4E8] text-[#1F8A4C] border-[#1F8A4C]/20'
              : 'bg-[#F5C451]/20 text-[#B7791F] border-[#B7791F]/30'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-[#1F8A4C]' : 'bg-[#B7791F]'}`} />
          {isLive ? 'Live AI' : 'Offline'}
        </span>

        {/* Notifications Icon Button */}
        <button
          className="relative h-9 w-9 rounded-full bg-white border border-[#E8E4D2] flex items-center justify-center text-[#10231C] hover:border-[#0B3B2E] transition-colors"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#1F8A4C] rounded-full" />
        </button>

        {/* Avatar Menu */}
        <div className="relative" ref={avatarRef}>
          <button
            onClick={() => setAvatarOpen(!avatarOpen)}
            className="w-9 h-9 rounded-full bg-[#0B3B2E] text-[#C6F36B] flex items-center justify-center text-xs font-bold hover:ring-2 hover:ring-[#C6F36B] transition-all overflow-hidden"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AK'}</span>
            )}
          </button>
          {avatarOpen && (
            <div className="absolute right-0 top-full mt-1.5 bg-white border border-[#E8E4D2] rounded-2xl shadow-lift z-40 w-52 p-2">
              <div className="px-3 py-2 border-b border-[#E8E4D2]">
                <div className="text-xs font-bold text-[#10231C] truncate">{user?.name || 'Arjun Kumar'}</div>
                <div className="text-[11px] text-[#4B5E55] truncate">{user?.email || 'arjun@example.com'}</div>
              </div>
              <button
                onClick={() => {
                  setAvatarOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#10231C] hover:bg-[#FAF7E8] rounded-xl text-left transition-colors"
              >
                <User size={14} /> My Profile
              </button>
              <button
                onClick={() => {
                  setAvatarOpen(false);
                  window.dispatchEvent(new CustomEvent('open-about-modal'));
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#10231C] hover:bg-[#FAF7E8] rounded-xl text-left transition-colors"
              >
                <Info size={14} /> About Multi-Agent AI
              </button>
              <hr className="border-[#E8E4D2] my-1" />
              <button
                onClick={async () => {
                  setAvatarOpen(false);
                  await logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#B91C1C] hover:bg-red-50 rounded-xl text-left transition-colors"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
