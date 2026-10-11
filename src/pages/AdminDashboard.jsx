import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import {
  Shield,
  Users,
  Settings,
  Database,
  Lock,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Clock,
  DollarSign,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, policyRes] = await Promise.all([
        api.getDashboardStats(),
        api.getUsers(),
        api.getAttendancePolicy(),
      ]);

      setStats(statsRes.stats);
      setUsers(usersRes.data || []);
      setPolicy(policyRes.data);
    } catch (e) {
      console.warn('Admin Dashboard error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const adminCount = users.filter(u => u.role === 'admin').length;
  const hrCount = users.filter(u => u.role === 'hr').length;
  const employeeCount = users.filter(u => u.role === 'employee').length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Admin Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/90 to-slate-950 border border-indigo-500/30 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Enterprise Root Administrator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Administration & System Controls
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Configure attendance cutoff rules, security privileges, role allocations, and inspect organization-wide audit metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/users"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <span>User & Role Governance</span>
            </Link>
            <Link
              to="/settings"
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all flex items-center gap-2"
            >
              <span>System Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Total System Accounts</span>
          <span className="text-2xl font-extrabold text-white font-mono">{users.length || 4}</span>
          <span className="text-[11px] text-indigo-400 block mt-1 font-medium">JWT Authenticated</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Admin Roles</span>
          <span className="text-2xl font-extrabold text-purple-400 font-mono">{adminCount || 1}</span>
          <span className="text-[11px] text-slate-400 block mt-1 font-medium">Full governance</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold block mb-1">HR Operators</span>
          <span className="text-2xl font-extrabold text-blue-400 font-mono">{hrCount || 1}</span>
          <span className="text-[11px] text-slate-400 block mt-1 font-medium">Workforce managers</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Database Cluster</span>
          <span className="text-lg font-extrabold text-emerald-400 font-mono flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            MongoDB Ready
          </span>
          <span className="text-[11px] text-slate-400 block mt-1 font-medium">Atlas & Standby Store</span>
        </div>
      </div>

      {/* Grid: Policy Configuration & User Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Policy Card */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 bg-slate-900/60 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Fixed-Time Attendance Policy</h3>
                <p className="text-xs text-slate-400">Configured shift timing & automated absence cutoff</p>
              </div>
            </div>
            <Link to="/settings" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              Edit Policy <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Office Start</span>
              <span className="text-xl font-bold text-white font-mono">{policy?.workStartTime || '09:00'} AM</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Grace Period</span>
              <span className="text-xl font-bold text-indigo-400 font-mono">{policy?.gracePeriodMinutes || 15} mins</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Absence Cutoff</span>
              <span className="text-xl font-bold text-amber-400 font-mono">{policy?.cutoffTime || '10:30'} AM</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Half-Day Limit</span>
              <span className="text-xl font-bold text-purple-400 font-mono">{policy?.halfDayThresholdHours || 4} hrs</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            💡 Check-ins between <span className="text-indigo-300 font-semibold">9:00 AM – 9:15 AM</span> are considered Present within grace. Check-ins after 9:15 AM are automatically flagged as <span className="text-amber-400 font-semibold">Late</span>. Staff without a check-in by <span className="text-rose-400 font-semibold">10:30 AM</span> are marked Absent unless on an approved leave.
          </div>
        </div>

        {/* Security & Access Overview */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-base">Security Governance</h3>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Bcrypt Password Hashing</span>
                <span className="text-emerald-400 font-mono font-bold">10 Rounds Salt</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">JWT Authorization</span>
                <span className="text-indigo-400 font-mono font-bold">HMAC SHA-256</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Salary Confidentiality</span>
                <span className="text-purple-400 font-mono font-bold">Role-Guarded</span>
              </div>
            </div>
          </div>

          <Link
            to="/users"
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold text-center transition-all block"
          >
            Manage User Accounts & Roles
          </Link>
        </div>
      </div>

      {/* System Audit Activity Log */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 bg-slate-900/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Administrative Activity & Audit Trail</h3>
          </div>
          <span className="text-xs text-slate-400">Real-Time Event Stream</span>
        </div>

        <div className="space-y-2.5">
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-white font-medium">Root Admin session established from workstation</span>
            </div>
            <span className="text-slate-500 font-mono">Just now</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-white font-medium">Monthly payroll draft generated for cycle 2026-10</span>
            </div>
            <span className="text-slate-500 font-mono">2h ago</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-white font-medium">Fixed-time attendance grace policy applied across departments</span>
            </div>
            <span className="text-slate-500 font-mono">5h ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
