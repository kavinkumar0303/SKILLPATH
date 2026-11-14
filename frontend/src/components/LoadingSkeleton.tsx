import React from 'react';

export default function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-6 w-full animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-44 bg-[#E8E4D2]/70 rounded-[20px] w-full" />

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-28 bg-[#E8E4D2]/60 rounded-[20px]" />
        <div className="h-28 bg-[#E8E4D2]/60 rounded-[20px]" />
        <div className="h-28 bg-[#E8E4D2]/60 rounded-[20px]" />
        <div className="h-28 bg-[#E8E4D2]/60 rounded-[20px]" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-3 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 bg-[#E8E4D2]/40 rounded-xl w-full" />
        ))}
      </div>
    </div>
  );
}
