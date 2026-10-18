import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import {
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  Target,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Bell,
  Sun,
  Shield,
  Layers,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [attendance, setAttendance] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState({ casualTotal: 0, casualUsed: 0, sickTotal: 0, sickUsed: 0, earnedTotal: 0, earnedUsed: 0, unpaidUsed: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [slips, setSlips] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [attRes, leavesRes, annRes, slipsRes, goalsRes] = await Promise.all([
        api.getTodayAttendance(),
        api.getMyLeaves(),
        api.getAnnouncements(),
        api.getMySalarySlips(),
        api.getGoals(),
      ]);

      setAttendance(attRes.data);
      if (leavesRes.balance) setLeaveBalance(leavesRes.balance);
      setAnnouncements(annRes.data || []);
      setSlips(slipsRes.data || []);
      setGoals(goalsRes.data || []);
    } catch (e) {
      console.warn('Dashboard data fetch warning:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = async () => {
    try {
      const res = await api.checkIn();
      showSuccess(res.message);
      setAttendance(res.data);
    } catch (err) {
      showError(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await api.checkOut();
      showSuccess(res.message);
      setAttendance(res.data);
    } catch (err) {
      showError(err.response?.data?.message || 'Check-out failed');
    }
  };

  const isCheckedIn = Boolean(attendance?.checkInTime);
  const isCheckedOut = Boolean(attendance?.checkOutTime);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-indigo-500/20 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Employee Workstation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">{user?.name || ''}</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              NEXUS Workforce Engine is monitoring active sprint deliverables. Your fixed-time office window is currently active.
            </p>
          </div>

          {/* Live Station Clock */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center sm:text-right min-w-[200px]">
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400">System Time</div>
            <div className="text-2xl font-mono font-bold text-white tracking-wider my-0.5">{currentTime}</div>
            <div className="text-xs text-indigo-400 font-medium">Policy: 09:00 AM (15m Grace)</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Attendance & Leave Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance Interactive Card */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 shadow-xl bg-slate-900/60 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Today's Attendance</h3>
                <p className="text-xs text-slate-400">Server-timed workstation check-in</p>
              </div>
            </div>
            {isCheckedIn && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                attendance?.status === 'Late'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {attendance?.status || 'Present'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Check In Time</span>
              <span className="text-lg font-bold text-white font-mono">
                {attendance?.checkInTime || '—'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Check Out Time</span>
              <span className="text-lg font-bold text-white font-mono">
                {attendance?.checkOutTime || '—'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Hours Logged</span>
              <span className="text-lg font-bold text-indigo-400 font-mono">
                {attendance?.workingHours ? `${attendance.workingHours} hrs` : (isCheckedIn && !isCheckedOut ? 'Active session' : '0 hrs')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            {!isCheckedIn ? (
              <button
                onClick={handleCheckIn}
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Punch Check In Now</span>
              </button>
            ) : !isCheckedOut ? (
              <button
                onClick={handleCheckOut}
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Punch Check Out</span>
              </button>
            ) : (
              <div className="flex-1 py-3 px-4 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-300 text-xs font-semibold text-center">
                ✓ Full shift recorded for today. Have a great evening!
              </div>
            )}

            <Link
              to="/attendance/calendar"
              className="px-5 py-3 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800/70 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>View Attendance Calendar</span>
            </Link>
          </div>
        </div>

        {/* Leave Balance Widget */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 shadow-xl bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base">Leave Balance</h3>
              <Link to="/leave/apply" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                Apply <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300">Casual Leave</span>
                  <span className="text-[11px] text-slate-400 block">{leaveBalance.casualUsed} days utilized</span>
                </div>
                <span className="text-base font-bold text-indigo-400 font-mono">
                  {leaveBalance.casualTotal - leaveBalance.casualUsed} Left
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300">Sick Leave</span>
                  <span className="text-[11px] text-slate-400 block">{leaveBalance.sickUsed} days utilized</span>
                </div>
                <span className="text-base font-bold text-purple-400 font-mono">
                  {leaveBalance.sickTotal - leaveBalance.sickUsed} Left
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-300">Earned Leave</span>
                  <span className="text-[11px] text-slate-400 block">{leaveBalance.earnedUsed} days utilized</span>
                </div>
                <span className="text-base font-bold text-cyan-400 font-mono">
                  {leaveBalance.earnedTotal - leaveBalance.earnedUsed} Left
                </span>
              </div>
            </div>
          </div>

          <Link
            to="/leave/apply"
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold text-center transition-all block"
          >
            Submit Leave Request
          </Link>
        </div>
      </div>

      {/* Announcements & Salary Slip Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Announcements */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 shadow-xl bg-slate-900/60 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Company Announcements</h3>
            </div>
            <Link to="/announcements" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {announcements.slice(0, 3).map((ann) => (
              <div key={ann._id} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-white line-clamp-1">{ann.title}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {ann.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{ann.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Slip & Compensation Summary */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 shadow-xl bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-base">Compensation</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Confidential
              </span>
            </div>

            {slips.length > 0 ? (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Latest Pay Period</span>
                  <span className="text-xs font-bold text-white font-mono">{slips[0].payPeriod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Net Disbursed</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">₹{slips[0].netSalary.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Slip Number</span>
                  <span className="font-mono text-indigo-300">{slips[0].slipNumber}</span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">No salary slips generated yet.</div>
            )}
          </div>

          {slips.length > 0 && (
            <Link
              to={`/payroll/slips/${slips[0]._id || slips[0].slipNumber}`}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs text-center shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Salary Slip</span>
            </Link>
          )}
        </div>
      </div>

      {/* Goal Progress Section */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 shadow-xl bg-slate-900/60">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Active Performance Goals</h3>
          </div>
          <Link to="/performance/goals" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
            Manage Goals <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.slice(0, 2).map((g) => (
            <div key={g._id} className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-bold text-white">{g.title}</span>
                <span className="text-xs font-mono font-bold text-indigo-400">{g.progress}%</span>
              </div>
              <p className="text-xs text-slate-400 mb-3 line-clamp-1">{g.description}</p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${g.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
