import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import EmployeeDashboard from './EmployeeDashboard';
import HRDashboard from './HRDashboard';
import AdminDashboard from './AdminDashboard';
import Employee3DCanvas from '../components/Employee3DCanvas';
import { Shield, Briefcase, UserCheck, Eye, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { role } = useAuth();
  // Allow toggling view for evaluator convenience, default to authenticated role
  const [activeView, setActiveView] = useState(role || 'admin');

  return (
    <div className="space-y-6">
      {/* Role View Switcher for Evaluation */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-2 px-3 py-1 text-xs text-slate-400 font-semibold">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Active Role Portal:</span>
          <span className="text-white uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {role}
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveView('employee')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeView === 'employee'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Employee View</span>
          </button>

          <button
            onClick={() => setActiveView('hr')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeView === 'hr'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>HR View</span>
          </button>

          <button
            onClick={() => setActiveView('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeView === 'admin'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin View</span>
          </button>
        </div>
      </div>

      {/* Render Dynamic Role Dashboard */}
      {activeView === 'employee' && <EmployeeDashboard />}
      {activeView === 'hr' && <HRDashboard />}
      {activeView === 'admin' && <AdminDashboard />}
    </div>
  );
}
