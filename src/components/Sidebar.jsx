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
          className="fixed inset-0 z-40 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-950/90 backdrop-blur-2xl transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Logo & Branding */}
        <div
          className={`flex h-20 items-center ${
            collapsed ? 'justify-center px-2' : 'justify-between px-5'
          } border-b border-slate-200/80 dark:border-white/5 relative`}
        >
          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 group"
          >
            {/* Modern 3D Ribbon NEXUS Logo */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-2 shadow-md shadow-indigo-500/25 ring-1 ring-white/20 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                className="h-full w-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* 3D Geometric N Facets */}
                <path
                  d="M6 26V6L13 10.5V17.5L26 26H18L11 21.5V26H6Z"
                  fill="url(#nexusGrad1)"
                />
                <path
                  d="M26 6V26L19 21.5V14.5L6 6H14L21 10.5V6H26Z"
                  fill="url(#nexusGrad2)"
                  fillOpacity="0.95"
                />
                <circle cx="6" cy="6" r="1.75" fill="#38BDF8" />
                <circle cx="26" cy="26" r="1.75" fill="#C084FC" />
                <defs>
                  <linearGradient
                    id="nexusGrad1"
                    x1="6"
                    y1="6"
                    x2="26"
                    y2="26"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#FFFFFF" />
                    <stop offset="0.6" stopColor="#EEF2FF" />
                    <stop offset="1" stopColor="#C7D2FE" />
                  </linearGradient>
                  <linearGradient
                    id="nexusGrad2"
                    x1="26"
                    y1="6"
                    x2="6"
                    y2="26"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#38BDF8" />
                    <stop offset="0.5" stopColor="#818CF8" />
                    <stop offset="1" stopColor="#C084FC" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-wider text-slate-900 dark:text-white text-base font-mono">
                    NEXUS<span className="text-indigo-600 dark:text-indigo-400 font-sans">HR</span>
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-500/30">
                    3D
                  </span>
                </div>
                <span className="text-[10px] tracking-tight text-slate-500 dark:text-slate-400 font-medium truncate max-w-[130px]">
                  People. Performance.
                </span>
              </motion.div>
            )}
          </NavLink>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              collapsed
                ? 'absolute -right-3.5 top-6.5 z-50 bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-700'
                : ''
            }`}
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
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
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
                    ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-indigo-500 to-purple-600"
                    />
                  )}
                  <item.icon
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400 scale-110' : 'text-slate-500 dark:text-slate-400 group-hover:scale-110 group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}
                  />
                  {!collapsed && (
                    <span className="flex-1 truncate tracking-tight">{item.name}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
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
            <div className="flex items-center gap-2.5 rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/80 dark:bg-indigo-950/40 p-3 shadow-sm dark:shadow-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 font-bold text-xs text-white shadow-sm ring-2 ring-indigo-500/20">
                AD
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-950 bg-emerald-500 shadow-sm" />
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">Administrator</p>
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
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
