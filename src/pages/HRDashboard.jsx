import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import {
  Users,
  UserCheck,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  PieChart as PieIcon,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function HRDashboard() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [hrComments, setHrComments] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, leavesRes, attRes] = await Promise.all([
        api.getDashboardStats(),
        api.getAllLeaves({ status: 'Pending' }),
        api.getAllAttendance(),
      ]);

      setStats(statsRes.stats);
      setPendingLeaves(leavesRes.data || []);
      setAttendanceRecords(attRes.data || []);
    } catch (e) {
      console.warn('HR Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (id, status) => {
    try {
      await api.reviewLeave(id, { status, hrComments });
      showSuccess(`Leave application marked as ${status}.`);
      setSelectedLeave(null);
      setHrComments('');
      loadData();
    } catch (err) {
      showError('Failed to process review');
    }
  };

  const presentCount = attendanceRecords.filter(a => a.status === 'Present').length;
  const lateCount = attendanceRecords.filter(a => a.status === 'Late').length;
  const onLeaveCount = attendanceRecords.filter(a => a.status === 'On Leave').length;
  const absentCount = attendanceRecords.filter(a => a.status === 'Absent').length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* HR Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-indigo-950/80 border border-purple-500/20 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>People Operations Command Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              HR Operations Dashboard
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Monitor real-time workforce availability, attendance policies, monthly payroll batches, and pending leave approvals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/leave/approvals"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              <span>Approvals Queue ({pendingLeaves.length})</span>
            </Link>
            <Link
              to="/payroll"
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all flex items-center gap-2"
            >
              <span>Payroll Hub</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Total Employees</span>
          <span className="text-2xl font-extrabold text-white font-mono">{stats?.totalEmployees || 6}</span>
          <span className="text-[11px] text-emerald-400 block mt-1 font-medium">100% active directory</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Present Today</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono">{presentCount || 2}</span>
          <span className="text-[11px] text-slate-400 block mt-1 font-medium">On-time check-ins</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Late Check-Ins</span>
          <span className="text-2xl font-extrabold text-amber-400 font-mono">{lateCount || 1}</span>
          <span className="text-[11px] text-slate-400 block mt-1 font-medium">Past 9:15 AM grace</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold block mb-1">On Approved Leave</span>
          <span className="text-2xl font-extrabold text-indigo-400 font-mono">{onLeaveCount || 1}</span>
          <span className="text-[11px] text-slate-400 block mt-1 font-medium">Planned time off</span>
        </div>
      </div>

      {/* Main Grid: Approvals Queue & Department Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals Queue */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 bg-slate-900/60 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Pending Leave Applications</h3>
                <p className="text-xs text-slate-400">Awaiting HR review and comment</p>
              </div>
            </div>
            <Link to="/leave/approvals" className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
              All Requests <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingLeaves.length > 0 ? (
            <div className="space-y-3">
              {pendingLeaves.map((req) => (
                <div key={req._id} className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{req.employeeName}</span>
                      <span className="text-xs text-slate-400">({req.department})</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {req.leaveType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Duration: <span className="text-slate-300 font-medium">{req.startDate}</span> to <span className="text-slate-300 font-medium">{req.endDate}</span> ({req.daysCount} days)
                    </div>
                    <p className="text-xs text-slate-400 italic">"{req.reason}"</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReview(req._id, 'Approved')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReview(req._id, 'Rejected')}
                      className="px-3.5 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-950/30 border border-dashed border-slate-800 text-slate-400 text-xs">
              ✓ All leave applications have been reviewed. Queue is clean!
            </div>
          )}
        </div>

        {/* Department Headcount Breakdown */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PieIcon className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Department Distribution</h3>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.departmentDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {(stats?.departmentDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6366F1'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-2">
              {(stats?.departmentDistribution || []).slice(0, 4).map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-300 font-medium">{d.name}</span>
                  </div>
                  <span className="text-white font-mono font-bold">{d.count} ({d.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/departments"
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold text-center transition-all block"
          >
            Manage Departments
          </Link>
        </div>
      </div>

      {/* Workforce Growth Chart & Performance Trackers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 bg-slate-900/60 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Workforce Growth Trend</h3>
            </div>
            <span className="text-xs text-slate-400">Past 6 Months</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.growthData || []}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="employees" stroke="#8B5CF6" strokeWidth={3} fill="url(#growthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Review Tracker */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-base">Performance Cycle</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Q3 2026 performance reviews are 88% completed across Engineering and Sales.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Review Completion</span>
                <span className="text-emerald-400 font-bold font-mono">88%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[88%]" />
              </div>
            </div>
          </div>

          <Link
            to="/performance/reviews"
            className="w-full py-2.5 px-4 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold text-center transition-all block"
          >
            Open Performance Review Hub
          </Link>
        </div>
      </div>
    </div>
  );
}
