import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandPalette from './CommandPalette';
import AboutModal from './AboutModal';
import FloatingAIMentor from './FloatingAIMentor';
import Logo from './Logo';

export default function AppLayout() {
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleOpenAbout = () => setAboutModalOpen(true);
    window.addEventListener('open-about-modal', handleOpenAbout);
    return () => {
      window.removeEventListener('open-about-modal', handleOpenAbout);
    };
  }, []);

  // Update tab title in sentence case
  useEffect(() => {
    const pageTitleMap: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/profile': 'My Profile',
      '/skill-analysis': 'Skill Analysis',
      '/career-match': 'Career Match',
      '/learning-path': 'Learning Path',
      '/assessments': 'Assessments',
      '/progress': 'Progress Tracking',
      '/agent-activity': 'Agent Activity',
      '/skill-passport': 'Skill Passport',
      '/simulator': 'Role Simulator',
      '/insights': 'Market Insights',
      '/cohort-analytics': 'Cohort Analytics',
      '/weekly-planner': 'Weekly Planner',
    };
    const title = pageTitleMap[location.pathname] || 'Workspace';
    document.title = `${title} | Skillpath`;
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#FAF7E8] text-[#10231C] font-sans antialiased flex">
      {/* 240px Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area - offset by 240px on md+ screens */}
      <div className="flex-1 flex flex-col md:pl-[240px] min-w-0">
        <Header />

        {/* Constrained 1200px container with 32px padding and 88px bottom padding for floating button */}
        <main className="flex-1 w-full max-w-[1200px] mx-auto p-6 md:p-8 space-y-6 pb-[88px]">
          <Outlet />
        </main>

        {/* Clean Corporate Footer */}
        <footer className="no-print mt-auto border-t border-[#E8E4D2] bg-white py-6 px-8 text-xs text-[#4B5E55]">
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Logo size="sm" variant="dark" showText={true} />
              <span className="text-gray-300">|</span>
              <span className="font-medium">Skillpath | Your path from skills to career | v1.0</span>
            </div>
            <div className="flex items-center gap-4 text-[#4B5E55]/80">
              <span>Enterprise Edition</span>
              <span>© 2026 Skillpath</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating AI Mentor (Bottom-right chat) */}
      <FloatingAIMentor />

      {/* Command Modals */}
      <AboutModal open={aboutModalOpen} onClose={() => setAboutModalOpen(false)} />
      <CommandPalette />
    </div>
  );
}
