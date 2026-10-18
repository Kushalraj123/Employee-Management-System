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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const { user, role, isAdmin, isHR, isEmployee } = useAuth();

  const navSections = [
    {
      title: 'Core Workspace',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Employee Directory', path: '/employees', icon: Users },
      ],
    },
    {
      title: 'Time & Leave',
      items: [
        { name: 'Attendance Punch', path: '/attendance', icon: Clock },
        { name: 'Monthly Calendar', path: '/attendance/calendar', icon: Calendar },
        { name: 'Apply for Leave', path: '/leave/apply', icon: Send },
        ...((isAdmin || isHR) ? [{ name: 'Leave Approvals', path: '/leave/approvals', icon: CheckSquare, badge: 'HR' }] : []),
      ],
    },
    {
      title: 'Compensation',
      items: [
        { name: 'Payroll & Salary Slips', path: '/payroll', icon: DollarSign },
      ],
    },
    {
      title: 'Growth & Culture',
      items: [
        { name: 'Announcements', path: '/announcements', icon: Bell },
        { name: 'Performance Reviews', path: '/performance/reviews', icon: Award },
        { name: 'Goals & OKRs', path: '/performance/goals', icon: Target },
        { name: 'Departments', path: '/departments', icon: Building2 },
        ...((isAdmin || isHR) ? [{ name: 'Executive Reports', path: '/reports', icon: BarChart3 }] : []),
      ],
    },
    ...((isAdmin) ? [{
      title: 'Administration',
      items: [
        { name: 'User & Role Access', path: '/users', icon: Shield },
        { name: 'System Settings', path: '/settings', icon: Settings },
      ],
    }] : [{
      title: 'Preferences',
      items: [
        { name: 'My Profile', path: '/profile', icon: User },
      ],
    }]),
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
              <svg viewBox="0 0 32 32" fill="none" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 26V6L13 10.5V17.5L26 26H18L11 21.5V26H6Z" fill="#FFFFFF" />
                <path d="M26 6V26L19 21.5V14.5L6 6H14L21 10.5V6H26Z" fill="#C7D2FE" fillOpacity="0.9" />
                <circle cx="6" cy="6" r="1.75" fill="#38BDF8" />
                <circle cx="26" cy="26" r="1.75" fill="#C084FC" />
              </svg>
            </div>

            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                    NEXUS <span className="text-indigo-600 dark:text-indigo-400">HR</span>
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

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono mb-1.5">
                  {section.title}
                </p>
              )}

              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                    } ${collapsed ? 'justify-center px-0 py-2.5' : ''}`
                  }
                  title={collapsed ? item.name : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="activeNavPill"
                          className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-gradient-to-b from-indigo-500 to-purple-600"
                        />
                      )}
                      <item.icon
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                            : 'text-slate-500 dark:text-slate-400 group-hover:scale-110 group-hover:text-slate-900 dark:group-hover:text-white'
                        }`}
                      />
                      {!collapsed && (
                        <span className="flex-1 truncate tracking-tight">{item.name}</span>
                      )}
                      {!collapsed && item.badge && (
                        <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/15 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom Current User & Role Pill */}
        <div className="p-3 border-t border-slate-200/80 dark:border-white/5 bg-slate-50/80 dark:bg-slate-950/60">
          <NavLink
            to="/profile"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group ${
              collapsed ? 'justify-center p-1' : ''
            }`}
          >
            <div className="relative shrink-0">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(user?.name || 'User')}`}
                alt={user?.name || 'User'}
                className="h-9 w-9 rounded-xl object-cover ring-2 ring-indigo-500/30"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-950 bg-emerald-500 shadow-sm" />
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {user?.name || 'Admin User'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {role}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    Profile &rarr;
                  </span>
                </div>
              </div>
            )}
          </NavLink>
        </div>
      </aside>
    </>
  );
}
