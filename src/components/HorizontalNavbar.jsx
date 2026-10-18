import React, { useState, useEffect, useRef } from 'react';
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
  Sun,
  Moon,
  Menu,
  X,
  Database,
  LogOut,
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

  const navRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.getNotifications();
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      } catch (e) {}
    };
    fetchNotifs();
    const timer = setInterval(fetchNotifs, 10000);
    return () => clearInterval(timer);
  }, [location.pathname]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setNotificationsOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Global click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
        setNotificationsOpen(false);
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = (name) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  const toggleDropdown = (name, e) => {
    e.stopPropagation();
    setActiveDropdown(prev => prev === name ? null : name);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isTimeActive = ['/attendance', '/attendance/calendar', '/leave/apply', '/leave/approvals'].some(p => location.pathname.startsWith(p));
  const isGrowthActive = ['/announcements', '/performance/reviews', '/performance/goals', '/departments', '/reports'].some(p => location.pathname.startsWith(p));
  const isAdminActive = ['/users', '/settings'].some(p => location.pathname.startsWith(p));

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-950/90 backdrop-blur-2xl transition-colors shadow-sm overflow-visible"
    >
      {/* Top Header Row: Branding, Quick Tools, Search, User */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 overflow-visible">
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Left: 3D Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-1.5 sm:p-2 shadow-md shadow-indigo-500/25 ring-1 ring-white/20 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <svg viewBox="0 0 32 32" fill="none" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 26V6L13 10.5V17.5L26 26H18L11 21.5V26H6Z" fill="#FFFFFF" />
                  <path d="M26 6V26L19 21.5V14.5L6 6H14L21 10.5V6H26Z" fill="#C7D2FE" fillOpacity="0.9" />
                  <circle cx="6" cy="6" r="1.75" fill="#38BDF8" />
                  <circle cx="26" cy="26" r="1.75" fill="#C084FC" />
                </svg>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                    NEXUS <span className="text-indigo-600 dark:text-indigo-400">HR</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold px-1 sm:px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-500/30">
                    2.0
                  </span>
                </div>
                <span className="text-[10px] tracking-tight text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                  People. Performance. Connected.
                </span>
              </div>
            </Link>
          </div>

          {/* Right Controls: Database status, Search, Theme, Notifications, Profile, Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 overflow-visible">
            {/* Backend / Atlas Status */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/90 dark:bg-indigo-950/30 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <Database className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[11px]">{isBackendLive ? 'MongoDB Atlas Live' : 'NEXUS Hybrid Engine'}</span>
            </div>

            {/* Quick Search */}
            <button
              onClick={onOpenSearch}
              className="flex h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 sm:py-1.5 items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer shrink-0"
              title="Search Workforce"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden md:inline text-slate-400">Search...</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer shrink-0"
              title={isDark ? 'Switch to Light' : 'Switch to Dark'}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
            </button>

            {/* Notification Bell */}
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNotificationsOpen(!notificationsOpen);
                  setUserDropdownOpen(false);
                }}
                className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
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
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">No new notifications</div>
                      ) : (
                        notifications.slice(0, 4).map((n) => (
                          <div key={n._id || n.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-xs">
                            <span className="font-bold text-slate-900 dark:text-white block">{n.title}</span>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile & Role Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl p-0.5 sm:p-1 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 font-bold text-xs text-white shadow-sm ring-1 sm:ring-2 ring-indigo-500/30 overflow-hidden shrink-0">
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(user?.name || 'User')}`}
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
                <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400" />
              </button>

              <AnimatePresence>
                {userDropdownOpen && (
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
                        className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center shrink-0 rounded-lg sm:rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer active:scale-95 ml-0.5"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Horizontal Navigation Bar (Desktop & Tablet) */}
      <div className="hidden md:block border-t border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/60 relative z-30 overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
          <nav className="flex items-center gap-1.5 py-1.5 text-xs font-semibold relative overflow-visible">
            {/* 1. Dashboard */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
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
                `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
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
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('time')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={(e) => toggleDropdown('time', e)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
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
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full pt-1.5 z-50 w-64"
                  >
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-2 space-y-1 ring-1 ring-black/5 dark:ring-white/10">
                      <NavLink
                        to="/attendance"
                        end
                        onClick={() => setActiveDropdown(null)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                            isActive
                              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Clock className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                            <div>
                              <div className="font-semibold">Attendance Punch</div>
                              <div className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>Live clock & shifts</div>
                            </div>
                          </>
                        )}
                      </NavLink>

                      <NavLink
                        to="/attendance/calendar"
                        onClick={() => setActiveDropdown(null)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                            isActive
                              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Calendar className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                            <div>
                              <div className="font-semibold">Monthly Calendar</div>
                              <div className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>Status badges & shifts</div>
                            </div>
                          </>
                        )}
                      </NavLink>

                      <div className="border-t border-slate-100 dark:border-white/5 my-1" />

                      <NavLink
                        to="/leave/apply"
                        onClick={() => setActiveDropdown(null)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                            isActive
                              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Send className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-purple-500'}`} />
                            <div>
                              <div className="font-semibold">Apply for Leave</div>
                              <div className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>Balances & request form</div>
                            </div>
                          </>
                        )}
                      </NavLink>

                      {(isAdmin || isHR) && (
                        <NavLink
                          to="/leave/approvals"
                          onClick={() => setActiveDropdown(null)}
                          className={({ isActive }) =>
                            `flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                              isActive
                                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <div className="flex items-center gap-2.5">
                                <CheckSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-amber-500'}`} />
                                <div>
                                  <div className="font-semibold">Leave Approvals</div>
                                  <div className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>HR review queue</div>
                                </div>
                              </div>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                isActive ? 'bg-white/20 text-white' : 'bg-purple-500/20 text-purple-300'
                              }`}>HR</span>
                            </>
                          )}
                        </NavLink>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. Payroll */}
            <NavLink
              to="/payroll"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
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
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('growth')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={(e) => toggleDropdown('growth', e)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
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
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full pt-1.5 z-50 w-64"
                  >
                    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-2 space-y-1 ring-1 ring-black/5 dark:ring-white/10">
                      <NavLink
                        to="/announcements"
                        onClick={() => setActiveDropdown(null)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                            isActive
                              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Bell className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                            <div>
                              <div className="font-semibold">Announcements</div>
                              <div className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>Bulletins & holiday notices</div>
                            </div>
                          </>
                        )}
                      </NavLink>

                      <NavLink
                        to="/performance/reviews"
                        onClick={() => setActiveDropdown(null)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                            isActive
                              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Award className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-amber-400'}`} />
                            <div>
                              <div className="font-semibold">Performance Reviews</div>
                              <div className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>Evaluations & scores</div>
                            </div>
                          </>
                        )}
                      </NavLink>

                      <NavLink
                        to="/performance/goals"
                        onClick={() => setActiveDropdown(null)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                            isActive
                              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Target className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                            <div>
                              <div className="font-semibold">Goals & OKRs</div>
                              <div className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>Quarterly milestone trackers</div>
                            </div>
                          </>
                        )}
                      </NavLink>

                      <NavLink
                        to="/departments"
                        onClick={() => setActiveDropdown(null)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                            isActive
                              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Building2 className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                            <div>
                              <div className="font-semibold">Departments</div>
                              <div className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>Headcounts & budgets</div>
                            </div>
                          </>
                        )}
                      </NavLink>

                      {(isAdmin || isHR) && (
                        <NavLink
                          to="/reports"
                          onClick={() => setActiveDropdown(null)}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                              isActive
                                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <BarChart3 className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                              <div>
                                <div className="font-semibold">Executive Reports</div>
                                <div className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>Analytics & CSV exports</div>
                              </div>
                            </>
                          )}
                        </NavLink>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 6. Admin Governance Dropdown (Admin only) */}
            {isAdmin && (
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('admin')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={(e) => toggleDropdown('admin', e)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
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
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full pt-1.5 z-50 w-64"
                    >
                      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-2 space-y-1 ring-1 ring-black/5 dark:ring-white/10">
                        <NavLink
                          to="/users"
                          onClick={() => setActiveDropdown(null)}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                              isActive
                                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <Shield className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                              <div>
                                <div className="font-semibold">User & Role Access</div>
                                <div className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>Permissions & provisioning</div>
                              </div>
                            </>
                          )}
                        </NavLink>

                        <NavLink
                          to="/settings"
                          onClick={() => setActiveDropdown(null)}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                              isActive
                                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <Settings className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                              <div>
                                <div className="font-semibold">System Settings</div>
                                <div className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>Fixed-time policy & cutoff</div>
                              </div>
                            </>
                          )}
                        </NavLink>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 7. Profile */}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
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
            {/* Search Workforce Quick Trigger */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearch();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-indigo-500" />
              <span className="font-semibold">Search Workforce...</span>
            </button>

            <div className="space-y-1 text-sm font-semibold">
              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/employees"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Employees</span>
              </NavLink>

              <NavLink
                to="/attendance"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Attendance Punch</span>
              </NavLink>

              <NavLink
                to="/attendance/calendar"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Attendance Calendar</span>
              </NavLink>

              <NavLink
                to="/leave/apply"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Send className="w-4 h-4 text-purple-500" />
                <span>Apply for Leave</span>
              </NavLink>

              {(isAdmin || isHR) && (
                <NavLink
                  to="/leave/approvals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <CheckSquare className="w-4 h-4 text-amber-500" />
                  <span>Leave Approvals (HR)</span>
                </NavLink>
              )}

              <NavLink
                to="/payroll"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>Payroll & Salary Slips</span>
              </NavLink>

              <NavLink
                to="/announcements"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Bell className="w-4 h-4 text-indigo-400" />
                <span>Announcements</span>
              </NavLink>

              <NavLink
                to="/performance/reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Performance Reviews</span>
              </NavLink>

              <NavLink
                to="/performance/goals"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Goals & OKRs</span>
              </NavLink>

              <NavLink
                to="/departments"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Departments</span>
              </NavLink>

              {(isAdmin || isHR) && (
                <NavLink
                  to="/reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span>Executive Reports</span>
                </NavLink>
              )}

              {isAdmin && (
                <>
                  <NavLink
                    to="/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>User Governance</span>
                  </NavLink>

                  <NavLink
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>System Settings</span>
                  </NavLink>
                </>
              )}

              <NavLink
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <User className="w-4 h-4 text-indigo-400" />
                <span>My Profile</span>
              </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
