import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CommandPalette from './components/CommandPalette';
import EmployeeModal from './components/EmployeeModal';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeDetails from './pages/EmployeeDetails';
import Departments from './pages/Departments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { useToast } from './context/ToastContext';
import api from './api';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBackendLive, setIsBackendLive] = useState(false);
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

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

  return (
    <div className="relative min-h-screen dark:bg-slate-950 bg-slate-50 dark:text-slate-100 text-slate-900 cyber-grid overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-300">
      {/* Background Ambience & Lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-indigo-600/10 to-purple-600/5 blur-[120px]" />
        <div className="absolute top-[40%] -right-[15%] h-[700px] w-[700px] rounded-full bg-gradient-to-bl from-blue-600/10 via-sky-600/5 to-transparent blur-[140px]" />
        <div className="absolute -bottom-[20%] left-[20%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-purple-600/10 to-indigo-600/5 blur-[120px]" />
      </div>

      {/* Responsive Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Layout */}
      <div
        className={`relative z-10 flex min-h-screen flex-col transition-all duration-300 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Sticky Header */}
        <Header
          setMobileOpen={setMobileOpen}
          onOpenSearch={() => setSearchOpen(true)}
          isBackendLive={isBackendLive}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            {/* Fallback */}
            <Route path="*" element={<Dashboard />} />
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
              Next-Gen Enterprise Workforce Management &copy; {new Date().getFullYear()} NEXUS Systems.
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
