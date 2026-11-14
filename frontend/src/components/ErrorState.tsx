import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Unable to connect to service",
  message = "A temporary connection issue occurred while syncing with Skillpath backend services.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="card-modern flex flex-col items-center justify-center p-10 text-center border-red-200 bg-red-50/20">
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-[#B91C1C] mb-4">
        <AlertCircle size={24} strokeWidth={1.75} />
      </div>
      <h3 className="font-heading text-xl font-semibold text-[#10231C] mb-1.5">
        {title}
      </h3>
      <p className="font-sans text-[14px] text-[#4B5E55] max-w-md mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-outline gap-2 bg-white"
        >
          <RefreshCw size={15} />
          <span>Retry operation</span>
        </button>
      )}
    </div>
  );
}
