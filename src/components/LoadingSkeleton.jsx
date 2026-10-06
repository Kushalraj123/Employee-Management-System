import React from 'react';

export default function LoadingSkeleton({ variant = 'table', count = 5 }) {
  if (variant === 'stats') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 p-5 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3 w-20 rounded-md animate-shimmer" />
                <div className="h-8 w-28 rounded-lg animate-shimmer" />
              </div>
              <div className="h-10 w-10 rounded-xl animate-shimmer" />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
              <div className="h-3 w-24 rounded-md animate-shimmer" />
              <div className="h-5 w-16 rounded-md animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 p-5 backdrop-blur-xl"
          >
            <div>
              <div className="flex justify-between">
                <div className="h-5 w-20 rounded-full animate-shimmer" />
                <div className="h-4 w-14 rounded-full animate-shimmer" />
              </div>
              <div className="mt-5 flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl animate-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded-md animate-shimmer" />
                  <div className="h-3 w-24 rounded-md animate-shimmer" />
                </div>
              </div>
              <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
                <div className="h-3 w-40 rounded-md animate-shimmer" />
                <div className="h-3 w-28 rounded-md animate-shimmer" />
              </div>
            </div>
            <div className="mt-5 flex justify-between border-t border-white/5 pt-3">
              <div className="h-7 w-20 rounded-xl animate-shimmer" />
              <div className="h-7 w-16 rounded-xl animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: Table variant
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-xl">
      <div className="border-b border-white/5 bg-slate-950/40 p-4 flex gap-4">
        <div className="h-4 w-10 rounded animate-shimmer" />
        <div className="h-4 w-40 rounded animate-shimmer" />
        <div className="h-4 w-28 rounded animate-shimmer hidden sm:block" />
        <div className="h-4 w-32 rounded animate-shimmer hidden md:block" />
      </div>
      <div className="divide-y divide-white/5 p-2 space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl animate-shimmer shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-36 rounded-md animate-shimmer" />
                <div className="h-3 w-48 rounded-md animate-shimmer" />
              </div>
            </div>
            <div className="h-6 w-24 rounded-full animate-shimmer hidden sm:block" />
            <div className="h-4 w-28 rounded-md animate-shimmer hidden md:block" />
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded-lg animate-shimmer" />
              <div className="h-8 w-8 rounded-lg animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
