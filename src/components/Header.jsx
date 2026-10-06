import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  Database,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  Shield,
  Command,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ setMobileOpen, onOpenSearch, isBackendLive = false }) {
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Generate dynamic page title & breadcrumbs
  const getPageMeta = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Dashboard Overview', breadcrumb: 'Overview' };
    if (path.startsWith('/employees/new')) return { title: 'Add New Employee', breadcrumb: 'Employees / New' };
    if (path.includes('/edit')) return { title: 'Edit Employee', breadcrumb: 'Employees / Edit' };
    if (path.startsWith('/employees/')) return { title: 'Employee Profile', breadcrumb: 'Employees / Details' };
    if (path === '/employees') return { title: 'Employee Management', breadcrumb: 'Workforce / Directory' };
    if (path === '/departments') return { title: 'Department Analytics', breadcrumb: 'Organization / Departments' };
    if (path === '/reports') return { title: 'Executive Reports', breadcrumb: 'Intelligence / Reports' };
    if (path === '/settings') return { title: 'System Settings', breadcrumb: 'System / Configuration' };
    return { title: 'NEXUS Workplace', breadcrumb: 'Platform' };
  };

  const { title, breadcrumb } = getPageMeta();

  const notifications = [
    {
      id: 1,
      title: 'New Employee Onboarded',
      desc: 'Lucas Dupont joined Engineering as 3D/WebGL Developer',
      time: '12m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Performance Review Cycle',
      desc: 'Q3 engineering reviews have been submitted for 428 members',
      time: '1h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'System Synced',
      desc: 'Database state updated and synced with cloud clusters',
      time: '3h ago',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl px-4 sm:px-8 transition-colors">
      {/* Left Title & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white lg:hidden transition-colors shadow-sm"
          aria-label="Open Mobile Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <span>NEXUS</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500 dark:text-slate-400">{breadcrumb}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
            {title}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Backend / Hybrid Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/90 dark:bg-indigo-950/30 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <Database className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{isBackendLive ? 'MongoDB Atlas Live' : 'NEXUS Hybrid Engine'}</span>
        </div>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 px-3.5 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-indigo-500/40 shadow-sm transition-all duration-200"
          title="Search anything (Ctrl+K)"
        >
          <Search className="h-4 w-4 text-slate-400" />
          <span className="hidden sm:inline font-medium">Search directory...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-transparent">
            <Command className="h-2.5 w-2.5" /> K
          </kbd>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all duration-200"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          <motion.div
            initial={false}
            animate={{ rotate: isDark ? 0 : 180, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {isDark ? (
              <Sun className="h-4.5 w-4.5 text-amber-400" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-indigo-500" />
            )}
          </motion.div>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all duration-200"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
            </span>
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationsOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">Notifications</span>
                      <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/30">
                        2 New
                      </span>
                    </div>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`group flex items-start gap-3 rounded-xl p-2.5 transition-colors ${
                          notif.unread ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                            {notif.desc}
                          </p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {notif.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 text-center">
                    <Link
                      to="/reports"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1"
                    >
                      View All Activity
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Quick Menu */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 rounded-xl p-1 hover:bg-white/5 transition-colors"
            aria-label="User Profile"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Admin"
              className="h-9 w-9 rounded-xl object-cover ring-2 ring-indigo-500/40"
            />
            <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-2"
                >
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="text-xs font-bold text-white">Administrator</p>
                    <p className="text-[11px] text-slate-400">admin@nexus.io</p>
                  </div>
                  <div className="py-1 space-y-0.5">
                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                      <Shield className="h-3.5 w-3.5 text-indigo-400" />
                      Admin Governance
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                      <Database className="h-3.5 w-3.5 text-indigo-400" />
                      API & Database Config
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
