import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HorizontalNavbar from './components/HorizontalNavbar';
import CommandPalette from './components/CommandPalette';
import EmployeeModal from './components/EmployeeModal';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import HRDashboard from './pages/HRDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeDetails from './pages/EmployeeDetails';
import Attendance from './pages/Attendance';
import AttendanceCalendar from './pages/AttendanceCalendar';
import LeaveApply from './pages/LeaveApply';
import LeaveApprovals from './pages/LeaveApprovals';
import PayrollDashboard from './pages/PayrollDashboard';
import SalarySlip from './pages/SalarySlip';
import Announcements from './pages/Announcements';
import PerformanceReviews from './pages/PerformanceReviews';
import GoalsProgress from './pages/GoalsProgress';
import Notifications from './pages/Notifications';
import UserManagement from './pages/UserManagement';
import Departments from './pages/Departments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

import { useToast } from './context/ToastContext';
import { useAuth } from './context/AuthContext';
import api from './api';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBackendLive, setIsBackendLive] = useState(false);
  const [layoutMode, setLayoutMode] = useState(() => {
    return localStorage.getItem('nexus_nav_layout') || 'horizontal';
  });
  const { showSuccess, showError } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleLayoutMode = () => {
    const next = layoutMode === 'horizontal' ? 'vertical' : 'horizontal';
    setLayoutMode(next);
    localStorage.setItem('nexus_nav_layout', next);
    showSuccess(`Switched to ${next === 'horizontal' ? 'Horizontal Top Menu' : 'Vertical Sidebar'} layout!`);
  };

  const isLoginPage = location.pathname === '/login';

  // Test backend status on initial load
  useEffect(() => {
    const checkLive = async () => {
      const res = await api.checkBackendHealth();
      setIsBackendLive(res.isLive);
    };
    checkLive();
  }, []);

  const handleGlobalCreate = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await api.createEmployee(formData);
      showSuccess(`Employee ${formData.name} added to directory!`);
      setAddModalOpen(false);
      navigate(`/employees/${res.data?._id || res.data?.id}`);
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="relative min-h-screen dark:bg-slate-950 bg-slate-50 dark:text-slate-100 text-slate-900 cyber-grid overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-300">
      {/* Background Ambience & Lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-indigo-600/10 to-purple-600/5 blur-[120px]" />
        <div className="absolute top-[40%] -right-[15%] h-[700px] w-[700px] rounded-full bg-gradient-to-bl from-blue-600/10 via-sky-600/5 to-transparent blur-[140px]" />
        <div className="absolute -bottom-[20%] left-[20%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-purple-600/10 to-indigo-600/5 blur-[120px]" />
      </div>

      {/* Responsive Sidebar (Rendered only in vertical layout mode) */}
      {layoutMode === 'vertical' && (
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
      )}

      {/* Main Content Layout Container */}
      <div
        className={`relative z-10 flex min-h-screen flex-col transition-all duration-300 ${
          layoutMode === 'vertical'
            ? collapsed ? 'lg:pl-20' : 'lg:pl-64'
            : 'w-full'
        }`}
      >
        {/* Navigation Bar: Horizontal Top Navbar or Vertical Header */}
        {layoutMode === 'horizontal' ? (
          <HorizontalNavbar
            onOpenSearch={() => setSearchOpen(true)}
            isBackendLive={isBackendLive}
            layoutMode={layoutMode}
            onToggleLayout={toggleLayoutMode}
          />
        ) : (
          <Header
            setMobileOpen={setMobileOpen}
            onOpenSearch={() => setSearchOpen(true)}
            isBackendLive={isBackendLive}
            onToggleLayout={toggleLayoutMode}
          />
        )}

        {/* Dynamic Route View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            {/* Core Dashboards */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/employee" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/hr" element={<ProtectedRoute allowedRoles={['hr', 'admin']}><HRDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            {/* Employee Management */}
            <Route path="/employees" element={<ProtectedRoute><EmployeeList /></ProtectedRoute>} />
            <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetails /></ProtectedRoute>} />

            {/* Attendance & Fixed-Time Policy */}
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            <Route path="/attendance/calendar" element={<ProtectedRoute><AttendanceCalendar /></ProtectedRoute>} />

            {/* Leave Management */}
            <Route path="/leave/apply" element={<ProtectedRoute><LeaveApply /></ProtectedRoute>} />
            <Route path="/leave/approvals" element={<ProtectedRoute allowedRoles={['hr', 'admin']}><LeaveApprovals /></ProtectedRoute>} />

            {/* Payroll & Compensation */}
            <Route path="/payroll" element={<ProtectedRoute><PayrollDashboard /></ProtectedRoute>} />
            <Route path="/payroll/slips/:id" element={<ProtectedRoute><SalarySlip /></ProtectedRoute>} />

            {/* Announcements & Culture */}
            <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />

            {/* Performance & Growth */}
            <Route path="/performance/reviews" element={<ProtectedRoute><PerformanceReviews /></ProtectedRoute>} />
            <Route path="/performance/goals" element={<ProtectedRoute><GoalsProgress /></ProtectedRoute>} />

            {/* Notifications */}
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

            {/* Admin Management */}
            <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
            <Route path="/departments" element={<ProtectedRoute><Departments /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['hr', 'admin']}><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />

            {/* Profile */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-slate-950/60 backdrop-blur-md px-6 py-5 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white font-mono">NEXUS HR</span>
              <span>— People. Performance. Connected.</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Enterprise Full-Stack HRMS &bull; Role-Based Authorization &bull; &copy; {new Date().getFullYear()} NEXUS Systems.
            </p>
          </div>
        </footer>
      </div>

      {/* Global Quick Search (Ctrl+K) */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onAddEmployee={() => setAddModalOpen(true)}
      />

      {/* Global Add Employee Modal */}
      <EmployeeModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleGlobalCreate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
