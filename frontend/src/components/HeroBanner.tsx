import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  titlePrefix: string;
  highlightedWord: string;
  titleSuffix?: string;
  subtitle?: string;
  badge?: string;
  metric?: {
    value: string | number;
    label: string;
  };
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function HeroBanner({
  titlePrefix,
  highlightedWord,
  titleSuffix = '',
  subtitle,
  badge = 'Active Learning Workspace',
  metric,
  action,
}: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-[#0B3B2E] p-6 md:p-7 text-[#F3F6EF] border border-[#135443] shadow-lift">
      {/* Soft Lime Glow in Top-Right Corner */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, #C6F36B 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Decorative Subtle Line Ornaments */}
      <div className="absolute top-6 right-1/3 opacity-20 pointer-events-none hidden sm:block">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" stroke="#C6F36B" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      </div>
      <div className="absolute bottom-6 left-1/2 opacity-20 pointer-events-none hidden sm:block">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="4" stroke="#C6F36B" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="max-w-2xl space-y-2.5">
          {/* Section Label Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#135443] text-[11px] font-semibold tracking-wide uppercase text-[#A9BDB1] bg-[#072A21]/60">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6F36B]" />
            <span>{badge}</span>
          </div>

          {/* Bricolage Grotesque Headline, Sentence Case, with Lime Word Highlight */}
          <h1 className="font-heading text-2xl sm:text-[28px] font-bold text-white tracking-tight leading-[1.15]">
            {titlePrefix}{' '}
            <span className="highlight-word">
              {highlightedWord}
            </span>
            {titleSuffix ? ` ${titleSuffix}` : ''}
          </h1>

          {subtitle && (
            <p className="font-sans text-[14px] text-[#A9BDB1] max-w-xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Metric & Action on Right */}
        <div className="flex items-center gap-4 flex-wrap">
          {metric && (
            <div className="bg-[#072A21] border border-[#135443] rounded-2xl px-5 py-3 text-center min-w-[130px]">
              <div className="font-heading text-[40px] font-bold text-[#C6F36B] leading-none mb-1">
                {metric.value}
              </div>
              <div className="text-[12px] font-medium text-[#A9BDB1]">
                {metric.label}
              </div>
            </div>
          )}

          {action && (
            <button
              onClick={action.onClick}
              className="btn-lime gap-2"
            >
              <span>{action.label}</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
