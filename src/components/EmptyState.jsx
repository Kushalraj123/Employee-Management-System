import React from 'react';
import { UserPlus, Users, SearchX, Sparkles } from 'lucide-react';

export default function EmptyState({
  title = 'No employees found',
  message = 'Try changing your search or filter, or add a new employee to your organization.',
  onAction,
  actionText = 'Add Employee',
  isFilter = false,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/40 p-10 sm:p-16 text-center backdrop-blur-xl shadow-sm">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-50 to-purple-50 dark:from-indigo-500/20 dark:to-purple-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-sm">
        {isFilter ? <SearchX className="h-9 w-9" /> : <Users className="h-9 w-9" />}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="relative inline-flex h-4 w-4 rounded-full bg-indigo-600 dark:bg-indigo-500/80 items-center justify-center text-[10px] text-white">
            +
          </span>
        </span>
      </div>

      <h3 className="mt-6 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {message}
      </p>

      {onAction && (
        <button
          onClick={onAction}
          className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}
