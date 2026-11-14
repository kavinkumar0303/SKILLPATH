import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="card-modern flex flex-col items-center justify-center p-10 text-center">
      <div className="w-14 h-14 rounded-full bg-[#E4F4E8] flex items-center justify-center text-[#0B3B2E] mb-4">
        <Icon size={24} strokeWidth={1.75} />
      </div>
      <h3 className="font-heading text-xl font-semibold text-[#10231C] mb-1.5">
        {title}
      </h3>
      <p className="font-sans text-[14px] text-[#4B5E55] max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-forest"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
