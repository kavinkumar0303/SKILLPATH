import React from 'react';
import { X, Bot, Compass } from 'lucide-react';
import Logo from './Logo';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutModal({ open, onClose }: AboutModalProps) {
  if (!open) return null;

  const agents = [
    {
      name: 'Skill Analyzer',
      role: 'Finds your gaps',
      desc: 'Evaluates proficiency from self-reported data and diagnostic quizzes, producing continuous 0–100 competency and strengths/weaknesses indices.',
    },
    {
      name: 'Career Matching',
      role: 'Compares with the target role',
      desc: 'Performs multi-criteria alignment against enterprise role requirements, computing precise compatibility scores and prioritized gap lists.',
    },
    {
      name: 'Learning Path',
      role: 'Builds your roadmap',
      desc: 'Generates sequenced, phased roadmaps from vetted learning resources, strictly adhering to directional prerequisite dependencies.',
    },
    {
      name: 'Assessment',
      role: 'Tests your knowledge',
      desc: 'Dispatches targeted multiple-choice question batteries, auto-grades submissions, and isolates root-cause conceptual weak points.',
    },
    {
      name: 'Progress Tracker',
      role: 'Tracks your pace',
      desc: 'Monitors completion percentages, daily learning cadences, streaks, velocity trends, and corporate career-readiness benchmarks.',
    },
    {
      name: 'Mentor',
      role: 'Guides and explains',
      desc: 'Provides structured feedback, clarifies technical questions, and suggests on-the-fly curriculum adaptations.',
    },
    {
      name: 'Orchestrator',
      role: 'Coordinates learning',
      desc: 'Coordinates the execution pipelines, handles goal shifts, triggers remediation routines, and logs auditable decisions.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#072A21]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF7E8] rounded-[24px] border border-[#E8E4D2] shadow-2xl max-w-2xl w-full overflow-hidden text-[#10231C]">
        {/* Header */}
        <div className="bg-[#0B3B2E] p-7 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-[#A9BDB1] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <Logo size="lg" variant="light" tagline={true} />
          <p className="text-[#A9BDB1] text-sm mt-3 leading-relaxed">
            Skillpath is an enterprise-grade learning platform powered by multi-agent coordination. It dynamically aligns individual skill profiles with target industry careers through continuous diagnosis, adaptive curriculum generation, and explainable AI.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4B5E55]">
            <Compass className="w-4 h-4 text-[#0B3B2E]" />
            Learning Agents
          </div>

          <div className="space-y-3">
            {agents.map((ag, i) => (
              <div key={i} className="card-modern p-4 bg-white space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-base font-semibold text-[#10231C] flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#0B3B2E]" />
                    {ag.name}
                  </span>
                  <span className="text-[11px] font-semibold text-[#0B3B2E] bg-[#E4F4E8] px-2.5 py-0.5 rounded-full">
                    {ag.role}
                  </span>
                </div>
                <p className="text-xs text-[#4B5E55] leading-relaxed">
                  {ag.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E8E4D2] text-xs text-[#4B5E55] flex items-center justify-between">
            <span>Version: 2.1 (Enterprise Release)</span>
            <span>Architecture: Multi-Agent System</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#E8E4D2] flex justify-end">
          <button
            onClick={onClose}
            className="btn-forest h-10 px-6 text-xs"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
}
