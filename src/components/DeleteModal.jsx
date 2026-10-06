import React from 'react';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getInitials, getAvatarGradient } from '../utils/avatar';

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  employee = null,
  isDeleting = false,
  count = 1,
}) {
  if (!isOpen) return null;

  const isBulk = count > 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-200 dark:border-rose-500/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-6 z-10"
        >
          {/* Danger Glow Icon */}
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <button
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-xl p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Heading and Description */}
          <div className="mt-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isBulk ? `Delete ${count} Employees?` : 'Delete Employee?'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {isBulk ? (
                `Are you sure you want to remove these ${count} employees from the organization directory? All associated workplace records will be permanently removed.`
              ) : (
                <>
                  Are you sure you want to remove{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {employee?.name || 'this employee'}
                  </span>
                  ? This action cannot be undone.
                </>
              )}
            </p>
          </div>

          {/* Employee Quick Info Badge */}
          {employee && !isBulk && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 p-3">
              <div
                className={`h-9 w-9 rounded-lg bg-gradient-to-br ${getAvatarGradient(
                  employee.name
                )} flex items-center justify-center font-bold text-xs ring-1 ring-slate-200 dark:ring-white/10 shrink-0`}
              >
                {getInitials(employee.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {employee.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {employee.designation} • {employee.department}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all disabled:opacity-50 shadow-sm"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>{isBulk ? `Delete ${count} Employees` : 'Delete Employee'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
