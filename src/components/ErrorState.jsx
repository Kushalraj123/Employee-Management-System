import React from 'react';
import { AlertOctagon, RefreshCw, Database } from 'lucide-react';

export default function ErrorState({
  title = 'Unable to load employees',
  message = 'Something went wrong while connecting to the server. Check your connection or verify backend service.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-rose-500/20 bg-slate-900/50 p-10 sm:p-14 text-center backdrop-blur-xl shadow-2xl">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-950/40">
        <AlertOctagon className="h-8 w-8" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-400 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <RefreshCw className="h-4 w-4 text-indigo-400" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
