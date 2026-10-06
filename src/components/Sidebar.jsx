import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Departments', path: '/departments', icon: Building2 },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-white/5 dark:border-white/10 bg-slate-950/90 dark:bg-slate-950/90 backdrop-blur-2xl transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Logo & Branding */}
        <div className="flex h-20 items-center justify-between px-5 border-b border-white/5">
          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 group overflow-hidden"
          >
            {/* Geometric "N" connected nodes Logo */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950/40 backdrop-blur-sm">
                <svg
                  viewBox="0 0 40 40"
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 30 V10 L30 30 V10" stroke="url(#logoGradient)" />
                  <circle cx="10" cy="10" r="2.5" fill="#38BDF8" stroke="none" />
                  <circle cx="10" cy="30" r="2.5" fill="#6366F1" stroke="none" />
                  <circle cx="30" cy="10" r="2.5" fill="#8B5CF6" stroke="none" />
                  <circle cx="30" cy="30" r="2.5" fill="#C084FC" stroke="none" />
                  <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38BDF8" />
                      <stop offset="50%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-wider text-white text-base font-mono">
                    NEXUS<span className="text-indigo-400 font-sans">HR</span>
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                    3D
                  </span>
                </div>
                <span className="text-[10px] tracking-tight text-slate-400 font-medium truncate max-w-[130px]">
                  People. Performance.
                </span>
              </motion.div>
            )}
          </NavLink>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-6 space-y-1.5">
          <div className="px-3 mb-2">
            {!collapsed && (
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
                Workspace
              </p>
            )}
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-950/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-indigo-400 to-purple-500"
                    />
                  )}
                  <item.icon
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                      isActive ? 'text-indigo-400 scale-110' : 'text-slate-400 group-hover:scale-110 group-hover:text-white'
                    }`}
                  />
                  {!collapsed && (
                    <span className="flex-1 truncate tracking-tight">{item.name}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Live System Indicator Badge */}
        {!collapsed && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-2.5 rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-indigo-950/40 dark:to-slate-900/60 p-3 shadow-sm dark:shadow-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30">
                <Zap className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Digital Workplace</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Connected System Active</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom User Profile */}
        <div className="p-3 border-t border-slate-200/80 dark:border-white/5 bg-slate-50/80 dark:bg-slate-950/60">
          <div
            className={`flex items-center gap-3 rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${
              collapsed ? 'justify-center p-1' : ''
            }`}
          >
            <div className="relative shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Admin Avatar"
                className="h-10 w-10 rounded-xl object-cover ring-2 ring-indigo-500/30 shadow-sm"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-950 bg-emerald-500 shadow-sm" />
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">Administrator</p>
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">admin@nexus.io</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
