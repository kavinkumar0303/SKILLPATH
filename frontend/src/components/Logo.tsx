import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'dark';
  tagline?: boolean;
}

const sizeMap = {
  sm: 28,
  md: 36,
  lg: 44,
  xl: 52,
};

// 20px in sidebar ('md'), 24px on login and landing ('lg', 'xl')
const textSizes = {
  sm: 'text-[16px]',
  md: 'text-[20px]',
  lg: 'text-[24px]',
  xl: 'text-[24px]',
};

export default function Logo({ size = 'md', showText = true, variant = 'dark', tagline = false }: LogoProps) {
  const dim = sizeMap[size];
  const skillColor = variant === 'light' ? 'text-white' : 'text-[#10231C]';
  const pathColor = variant === 'light' ? 'text-[#C6F36B]' : 'text-[#0B3B2E]';
  const taglineColor = variant === 'light' ? 'text-[#A9BDB1]' : 'text-[#4B5E55]';

  return (
    <div className="inline-flex items-center gap-3 select-none">
      {/* Mark with 1px rgba(255,255,255,0.18) outline on dark surfaces */}
      <div
        className={`flex-shrink-0 rounded-[10px] overflow-hidden ${
          variant === 'light' ? 'ring-1 ring-white/20' : ''
        }`}
        style={{ width: dim, height: dim }}
      >
        <svg
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Skillpath logo"
          width={dim}
          height={dim}
          className="w-full h-full block"
        >
          <rect width="48" height="48" rx="10" fill="#0B3B2E" />
          {/* Tassel */}
          <path d="M10 24 C10 28 8.5 30 8.5 33" stroke="#FFFFFF" strokeWidth="1.75" strokeLinecap="round" fill="none" />
          <circle cx="8.5" cy="34" r="2" fill="#C6F36B" />
          <polygon points="6,42 11,42 9.5,36 7.5,36" fill="#C6F36B" />
          {/* Cap Skullcap Base */}
          <path d="M14 26 C14 35 34 35 34 26 Z" fill="#FFFFFF" />
          {/* Mortarboard Diamond Top */}
          <polygon points="24,15 44,23 24,31 4,23" fill="#FFFFFF" />
          {/* Mortarboard Opening / Depth */}
          <polygon points="24,17 38,23 24,28 10,23" fill="#0B3B2E" />
          {/* Ladder Rising through Cap */}
          <g stroke="#C6F36B" strokeWidth="2" strokeLinecap="round">
            <line x1="21" y1="25" x2="16" y2="7" />
            <line x1="27" y1="23" x2="22" y2="5" />
            <line x1="19.5" y1="20" x2="25.5" y2="18" strokeWidth="1.5" />
            <line x1="18" y1="15" x2="24" y2="13" strokeWidth="1.5" />
            <line x1="16.5" y1="10" x2="22.5" y2="8" strokeWidth="1.5" />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className={`font-heading font-bold tracking-[-0.02em] ${textSizes[size]}`}>
            <span className={skillColor}>Skill</span>
            <span className={pathColor}>path</span>
          </div>
          {tagline && (
            <span className={`text-[12px] font-sans font-medium leading-normal ${taglineColor}`}>
              Your path from skills to career
            </span>
          )}
        </div>
      )}
    </div>
  );
}
