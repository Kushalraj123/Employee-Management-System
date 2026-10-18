import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
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
  LogOut,
  User,
  Clock,
  Briefcase,
  UserCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

export default function Header({ setMobileOpen, onOpenSearch, isBackendLive = false, onToggleLayout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, role, demoLogin, logout } = useAuth();
  const { showSuccess } = useToast();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.getNotifications();
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      } catch (e) {}
    };
    fetchNotifs();
  }, [location.pathname]);

  // Dynamic breadcrumb & page titles
  const getPageMeta = () => {
    const path = location.pathname;
    if (path === '/') return { title: 'Dashboard Overview', breadcrumb: 'Overview' };
    if (path === '/employees') return { title: 'Workforce Directory', breadcrumb: 'Employees / Directory' };
    if (path.startsWith('/employees/')) return { title: 'Employee Profile', breadcrumb: 'Employees / Details' };
    if (path === '/attendance') return { title: 'Attendance Time Tracker', breadcrumb: 'Time & Absence / Punch' };
    if (path === '/attendance/calendar') return { title: 'Monthly Attendance Calendar', breadcrumb: 'Time / Calendar' };
    if (path === '/leave/apply') return { title: 'Leave Application & Balances', breadcrumb: 'Leaves / Apply' };
    if (path === '/leave/approvals') return { title: 'Leave Approval Management', breadcrumb: 'Leaves / Approvals' };
    if (path === '/payroll') return { title: 'Payroll & Compensation', breadcrumb: 'Finance / Payroll' };
    if (path.startsWith('/payroll/slips/')) return { title: 'Official Salary Slip', breadcrumb: 'Payroll / Slip' };
    if (path === '/announcements') return { title: 'Company Announcements', breadcrumb: 'Company / Bulletins' };
    if (path === '/performance/reviews') return { title: 'Performance Evaluations', breadcrumb: 'Growth / Reviews' };
    if (path === '/performance/goals') return { title: 'Goals & OKRs', breadcrumb: 'Growth / Goals' };
    if (path === '/notifications') return { title: 'Notification Center', breadcrumb: 'System / Notifications' };
    if (path === '/users') return { title: 'User Governance & Roles', breadcrumb: 'Admin / Users' };
    if (path === '/departments') return { title: 'Department Analytics', breadcrumb: 'Organization / Departments' };
    if (path === '/reports') return { title: 'Executive Intelligence Reports', breadcrumb: 'Analytics / Reports' };
    if (path === '/settings') return { title: 'System Settings & Policy', breadcrumb: 'System / Settings' };
    if (path === '/profile') return { title: 'My Account Profile', breadcrumb: 'Account / Profile' };
    return { title: 'NEXUS HR Enterprise', breadcrumb: 'Platform' };
  };

  const { title, breadcrumb } = getPageMeta();

  const handleRoleSwitch = async (targetRole) => {
    await demoLogin(targetRole);
    showSuccess(`Switched to ${targetRole.toUpperCase()} permissions.`);
    setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
          <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
            {title}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Backend Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/90 dark:bg-indigo-950/30 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <Database className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>{isBackendLive ? 'MongoDB Atlas Live' : 'NEXUS Hybrid Engine'}</span>
        </div>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          title="Search Workforce (Ctrl+K)"
        >
          <Search className="h-4 w-4" />
          <span className="hidden lg:inline text-slate-400">Search...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
            <Command className="h-2.5 w-2.5" /> K
          </kbd>
        </button>

        {/* Layout Toggle Button */}
        {onToggleLayout && (
          <button
            onClick={onToggleLayout}
            className="flex h-10 items-center gap-1.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
            title="Switch to Horizontal Navigation"
          >
            <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
            <span className="hidden sm:inline">Horizontal Menu</span>
          </button>
        )}

        {/* Light / Dark Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm font-mono">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Notifications
                    </span>
                    <Link
                      to="/notifications"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[11px] text-indigo-500 hover:text-indigo-400 font-semibold"
                    >
                      View All &rarr;
                    </Link>
                  </div>

                  <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                    {notifications.slice(0, 3).map((n) => (
                      <div key={n._id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white block">{n.title}</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Dropdown & Quick Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 font-bold text-xs text-white shadow-sm ring-2 ring-indigo-500/30 overflow-hidden">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(user?.name || 'User')}`}
                alt={user?.name || 'User'}
                className="w-full h-full object-cover"
              />
            </div>
            <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {userDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-2.5"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name || 'Enterprise User'}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{user?.email}</p>
                    <div className="mt-1.5 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      Active: {role}
                    </div>
                  </div>

                  {/* Switch Demo Roles in 1-Click */}
                  <div className="py-2 border-b border-slate-100 dark:border-white/5 space-y-1">
                    <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Quick Demo Role Switch
                    </span>
                    <button
                      onClick={() => handleRoleSwitch('admin')}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        role === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Switch to Admin</span>
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('hr')}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        role === 'hr' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Switch to HR Lead</span>
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('employee')}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        role === 'employee' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Switch to Employee</span>
                    </button>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      <User className="h-3.5 w-3.5 text-indigo-400" />
                      <span>My Profile</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
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
