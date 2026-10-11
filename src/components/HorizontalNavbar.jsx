import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Settings,
  ShieldCheck,
  Sparkles,
  Clock,
  Calendar,
  Send,
  CheckSquare,
  DollarSign,
  FileText,
  Award,
  Target,
  Bell,
  Shield,
  User,
  ChevronDown,
  Search,
  Command,
  Sun,
  Moon,
  Menu,
  X,
  Database,
  LogOut,
  SlidersHorizontal,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../api';

export default function HorizontalNavbar({
  onOpenSearch,
  isBackendLive = false,
  layoutMode = 'horizontal',
  onToggleLayout,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isAdmin, isHR, isEmployee, demoLogin, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { showSuccess } = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'time' | 'growth' | 'admin'
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setNotificationsOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleRoleSwitch = async (targetRole) => {
    await demoLogin(targetRole);
    showSuccess(`Switched to ${targetRole.toUpperCase()} permissions.`);
    setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isTimeActive = ['/attendance', '/attendance/calendar', '/leave/apply', '/leave/approvals'].some(p => location.pathname.startsWith(p));
  const isGrowthActive = ['/announcements', '/performance/reviews', '/performance/goals', '/departments', '/reports'].some(p => location.pathname.startsWith(p));
  const isAdminActive = ['/users', '/settings'].some(p => location.pathname.startsWith(p));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-950/90 backdrop-blur-2xl transition-colors shadow-sm">
      {/* Top Header Row: Branding, Quick Tools, Search, User */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: 3D Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-2 shadow-md shadow-indigo-500/25 ring-1 ring-white/20 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <svg viewBox="0 0 32 32" fill="none" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 26V6L13 10.5V17.5L26 26H18L11 21.5V26H6Z" fill="#FFFFFF" />
                  <path d="M26 6V26L19 21.5V14.5L6 6H14L21 10.5V6H26Z" fill="#C7D2FE" fillOpacity="0.9" />
                  <circle cx="6" cy="6" r="1.75" fill="#38BDF8" />
                  <circle cx="26" cy="26" r="1.75" fill="#C084FC" />
                </svg>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                    NEXUS <span className="text-indigo-600 dark:text-indigo-400">HR</span>
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-500/30">
                    2.0
                  </span>
                </div>
                <span className="text-[10px] tracking-tight text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                  People. Performance. Connected.
                </span>
              </div>
            </Link>

            {/* Layout Toggle Button (Horizontal / Vertical Sidebar) */}
            {onToggleLayout && (
              <button
                onClick={onToggleLayout}
                className="hidden xl:inline-flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Toggle between Horizontal Navbar and Vertical Sidebar layout"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                <span>Layout: Horizontal</span>
              </button>
            )}
          </div>

          {/* Right Controls: Database status, Search, Theme, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Backend / Atlas Status */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/90 dark:bg-indigo-950/30 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <Database className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[11px]">{isBackendLive ? 'MongoDB Atlas Live' : 'NEXUS Hybrid Engine'}</span>
            </div>

            {/* Quick Search */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
              title="Search Workforce (Ctrl+K)"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden md:inline text-slate-400">Search...</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1 py-0.5 text-[9px] font-mono text-slate-500">
                <Command className="h-2.5 w-2.5" /> K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
              title={isDark ? 'Switch to Light' : 'Switch to Dark'}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white font-mono shadow-sm">
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
                      className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-4"
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

            {/* User Profile & Role Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-xl p-1 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 font-bold text-xs text-white shadow-sm ring-2 ring-indigo-500/30 overflow-hidden">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={user?.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[100px]">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {role}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
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
                          Active Role: {role}
                        </div>
                      </div>

                      {/* Quick 1-Click Role Switcher */}
                      <div className="py-2 border-b border-slate-100 dark:border-white/5 space-y-1">
                        <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Quick Demo Role Switch
                        </span>
                        <button
                          onClick={() => handleRoleSwitch('admin')}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            role === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Switch to Admin</span>
                        </button>
                        <button
                          onClick={() => handleRoleSwitch('hr')}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            role === 'hr' ? 'bg-purple-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>Switch to HR Lead</span>
                        </button>
                        <button
                          onClick={() => handleRoleSwitch('employee')}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            role === 'employee' ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                          <span>My Account Profile</span>
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

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-slate-500 dark:text-slate-400"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Horizontal Navigation Bar (Desktop & Tablet) */}
      <div className="hidden md:block border-t border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 py-1.5 overflow-x-auto no-scrollbar text-xs font-semibold">
            {/* 1. Dashboard */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                }`
              }
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </NavLink>

            {/* 2. Employee Directory */}
            <NavLink
              to="/employees"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                }`
              }
            >
              <Users className="w-3.5 h-3.5" />
              <span>Employees</span>
            </NavLink>

            {/* 3. Time & Leave Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'time' ? null : 'time')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isTimeActive
                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Time & Leave</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'time' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'time' && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setActiveDropdown(null)} />
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 top-11 z-40 w-56 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl p-2 space-y-1"
                    >
                      <NavLink
                        to="/attendance"
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                            isActive ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <div>
                          <div className="font-semibold">Attendance Punch</div>
                          <div className="text-[10px] text-slate-400">Live clock & shifts</div>
                        </div>
                      </NavLink>

                      <NavLink
                        to="/attendance/calendar"
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                            isActive ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <div>
                          <div className="font-semibold">Monthly Calendar</div>
                          <div className="text-[10px] text-slate-400">Status badges & shifts</div>
                        </div>
                      </NavLink>

                      <div className="border-t border-slate-100 dark:border-white/5 my-1" />

                      <NavLink
                        to="/leave/apply"
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                            isActive ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        <Send className="w-4 h-4 text-purple-500" />
                        <div>
                          <div className="font-semibold">Apply for Leave</div>
                          <div className="text-[10px] text-slate-400">Balances & request form</div>
                        </div>
                      </NavLink>

                      {(isAdmin || isHR) && (
                        <NavLink
                          to="/leave/approvals"
                          className={({ isActive }) =>
                            `flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
                              isActive ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`
                          }
                        >
                          <div className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-amber-500" />
                            <div>
                              <div className="font-semibold">Leave Approvals</div>
                              <div className="text-[10px] text-slate-400">HR review queue</div>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 uppercase">HR</span>
                        </NavLink>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* 4. Payroll */}
            <NavLink
              to="/payroll"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                }`
              }
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Payroll & Salary Slips</span>
            </NavLink>

            {/* 5. Growth & Culture Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'growth' ? null : 'growth')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isGrowthActive
                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Growth & Culture</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'growth' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'growth' && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setActiveDropdown(null)} />
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 top-11 z-40 w-56 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl p-2 space-y-1"
                    >
                      <NavLink
                        to="/announcements"
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                            isActive ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        <Bell className="w-4 h-4 text-indigo-400" />
                        <div>
                          <div className="font-semibold">Announcements</div>
                          <div className="text-[10px] text-slate-400">Bulletins & holiday notices</div>
                        </div>
                      </NavLink>

                      <NavLink
                        to="/performance/reviews"
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                            isActive ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        <Award className="w-4 h-4 text-amber-400" />
                        <div>
                          <div className="font-semibold">Performance Reviews</div>
                          <div className="text-[10px] text-slate-400">Evaluations & scores</div>
                        </div>
                      </NavLink>

                      <NavLink
                        to="/performance/goals"
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                            isActive ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        <Target className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="font-semibold">Goals & OKRs</div>
                          <div className="text-[10px] text-slate-400">Quarterly milestone trackers</div>
                        </div>
                      </NavLink>

                      <NavLink
                        to="/departments"
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                            isActive ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="font-semibold">Departments</div>
                          <div className="text-[10px] text-slate-400">Headcounts & budgets</div>
                        </div>
                      </NavLink>

                      {(isAdmin || isHR) && (
                        <NavLink
                          to="/reports"
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                              isActive ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`
                          }
                        >
                          <BarChart3 className="w-4 h-4 text-purple-400" />
                          <div>
                            <div className="font-semibold">Executive Reports</div>
                            <div className="text-[10px] text-slate-400">Analytics & CSV exports</div>
                          </div>
                        </NavLink>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* 6. Admin Governance Dropdown (Admin only) */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'admin' ? null : 'admin')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                    isAdminActive
                      ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>Admin</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'admin' ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'admin' && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setActiveDropdown(null)} />
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute left-0 top-11 z-40 w-56 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl p-2 space-y-1"
                      >
                        <NavLink
                          to="/users"
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                              isActive ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`
                          }
                        >
                          <Shield className="w-4 h-4 text-blue-400" />
                          <div>
                            <div className="font-semibold">User & Role Access</div>
                            <div className="text-[10px] text-slate-400">Permissions & provisioning</div>
                          </div>
                        </NavLink>

                        <NavLink
                          to="/settings"
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                              isActive ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`
                          }
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="font-semibold">System Settings</div>
                            <div className="text-[10px] text-slate-400">Fixed-time policy & cutoff</div>
                          </div>
                        </NavLink>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 7. Profile */}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
                }`
              }
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Navigation (When hamburger clicked on mobile) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 px-4 py-4 space-y-3 overflow-y-auto max-h-[80vh]"
          >
            <div className="space-y-1 text-sm font-semibold">
              <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink to="/employees" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Employees</span>
              </NavLink>

              <NavLink to="/attendance" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Attendance Punch</span>
              </NavLink>

              <NavLink to="/attendance/calendar" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Attendance Calendar</span>
              </NavLink>

              <NavLink to="/leave/apply" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <Send className="w-4 h-4 text-purple-500" />
                <span>Apply for Leave</span>
              </NavLink>

              {(isAdmin || isHR) && (
                <NavLink to="/leave/approvals" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                  <CheckSquare className="w-4 h-4 text-amber-500" />
                  <span>Leave Approvals (HR)</span>
                </NavLink>
              )}

              <NavLink to="/payroll" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Payroll & Salary Slips</span>
              </NavLink>

              <NavLink to="/announcements" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <Bell className="w-4 h-4 text-indigo-400" />
                <span>Announcements</span>
              </NavLink>

              <NavLink to="/performance/reviews" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Performance Reviews</span>
              </NavLink>

              <NavLink to="/performance/goals" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Goals & OKRs</span>
              </NavLink>

              <NavLink to="/departments" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Departments</span>
              </NavLink>

              {(isAdmin || isHR) && (
                <NavLink to="/reports" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span>Executive Reports</span>
                </NavLink>
              )}

              {isAdmin && (
                <>
                  <NavLink to="/users" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>User Governance</span>
                  </NavLink>

                  <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>System Settings</span>
                  </NavLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
