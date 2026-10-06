import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Building2,
  BarChart3,
  Settings,
  X,
  ArrowRight,
  User,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { getInitials, getAvatarGradient } from '../utils/avatar';

export default function CommandPalette({ isOpen, onClose, onAddEmployee }) {
  const [query, setQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      api.getEmployees().then((res) => {
        setEmployees(res.data || []);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(false); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredEmployees = employees
    .filter(
      (e) =>
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.email.toLowerCase().includes(query.toLowerCase()) ||
        e.department.toLowerCase().includes(query.toLowerCase()) ||
        e.designation.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 6);

  const quickNav = [
    { title: 'Dashboard Overview', path: '/', icon: BarChart3 },
    { title: 'Employee Directory', path: '/employees', icon: Users },
    { title: 'Department Analytics', path: '/departments', icon: Building2 },
    { title: 'Executive Reports', path: '/reports', icon: BarChart3 },
    { title: 'Settings & Integrations', path: '/settings', icon: Settings },
  ].filter((n) => n.title.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 backdrop-blur-2xl shadow-2xl z-10"
        >
          {/* Search Input Bar */}
          <div className="flex items-center border-b border-white/10 px-4 py-3.5">
            <Search className="h-5 w-5 text-indigo-400 shrink-0 mr-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search employees, roles, departments, or quick pages..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-3 space-y-4">
            {/* Quick Action */}
            <div className="space-y-1">
              <button
                onClick={() => {
                  onClose();
                  if (onAddEmployee) onAddEmployee();
                }}
                className="flex w-full items-center justify-between rounded-xl p-2.5 text-xs text-indigo-300 hover:bg-indigo-600/20 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">+ Add New Employee to Directory</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </div>

            {/* Employees Search Results */}
            {filteredEmployees.length > 0 && (
              <div>
                <p className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                  Employees ({filteredEmployees.length})
                </p>
                <div className="space-y-1">
                  {filteredEmployees.map((emp) => {
                    const empId = emp._id || emp.id;
                    return (
                      <button
                        key={empId}
                        onClick={() => handleSelect(`/employees/${empId}`)}
                        className="flex w-full items-center justify-between rounded-xl p-2 hover:bg-white/5 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-8 w-8 rounded-lg bg-gradient-to-br ${getAvatarGradient(
                              emp.name
                            )} flex items-center justify-center font-bold text-[11px] ring-1 ring-white/10 shrink-0`}
                          >
                            {getInitials(emp.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">
                              {emp.name}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {emp.designation} • {emp.department}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 shrink-0">
                          {emp.department}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation Pages */}
            {quickNav.length > 0 && (
              <div>
                <p className="px-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                  Pages & Navigation
                </p>
                <div className="space-y-1">
                  {quickNav.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleSelect(item.path)}
                      className="flex w-full items-center justify-between rounded-xl p-2 hover:bg-white/5 transition-colors text-left text-xs text-slate-300 hover:text-white"
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className="h-4 w-4 text-indigo-400" />
                        <span className="font-medium">{item.title}</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredEmployees.length === 0 && quickNav.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                No matching results found for "{query}"
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
