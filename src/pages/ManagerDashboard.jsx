import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Clock,
  Target,
  Award,
  Calendar,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Network,
  UserPlus,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [teamGoals, setTeamGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadManagerData = async () => {
    setLoading(true);
    try {
      const [empRes, leaveRes, attRes, goalRes] = await Promise.all([
        api.getEmployees({ department: user?.department || 'Engineering' }),
        api.getAllLeaves({ department: user?.department || 'Engineering', status: 'Pending' }),
        api.getAllAttendance({ department: user?.department || 'Engineering' }),
        api.getGoals(),
      ]);

      setTeamMembers(empRes.data || []);
      setPendingLeaves(leaveRes.data || []);
      setTeamAttendance(attRes.data || []);
      setTeamGoals(goalRes.data || []);
    } catch (err) {
      console.warn('Manager dashboard load warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagerData();
  }, [user?.department]);

  const handleLeaveAction = async (leaveId, status) => {
    try {
      await api.reviewLeave(leaveId, {
        status,
        hrComments: `${status} by Department Manager (${user?.name || 'Manager'})`,
      });
      showSuccess(`Team leave request ${status.toLowerCase()}!`);
      loadManagerData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update leave');
    }
  };

  const handleApproveAttendance = async (attId) => {
    try {
      await api.approveAttendance(attId, {
        action: 'Approved',
        status: 'Present',
        comments: 'Regularized by Department Manager',
      });
      showSuccess('Team attendance record regularized & approved!');
      loadManagerData();
    } catch (err) {
      showError('Failed to approve attendance');
    }
  };

  const avgTeamScore = teamMembers.length
    ? Math.round(teamMembers.reduce((s, m) => s + (m.performanceScore || 90), 0) / teamMembers.length)
    : 92;

  const lateOrPendingAtt = teamAttendance.filter(
    (a) => a.status === 'Late' || a.regularizationStatus === 'Pending'
  );

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-indigo-950/40 relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Department Manager Command Center &bull; {user?.department || 'Engineering'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Elena Rostova'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl">
              Oversee your direct reports, approve team leave requests, regularize late attendance logs, and track sprint OKRs in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/org-network"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all"
            >
              <Network className="w-4 h-4" />
              <span>3D Team Topology</span>
            </Link>
            <Link
              to="/recruitment"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Hiring Pipeline</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Direct Team Size</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{teamMembers.length}</div>
          <p className="text-xs text-emerald-400 mt-1 font-medium">
            {teamMembers.filter((m) => m.status === 'Active').length} Active &bull; {user?.department || 'Engineering'}
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Team Leaves</span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{pendingLeaves.length}</div>
          <p className="text-xs text-slate-400 mt-1">Awaiting your managerial decision</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Velocity Score</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{avgTeamScore}/100</div>
          <p className="text-xs text-emerald-400 mt-1">Top-quartile department benchmark</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Sprint OKRs</span>
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white">{teamGoals.length}</div>
          <p className="text-xs text-purple-300 mt-1">
            {teamGoals.filter((g) => g.progress >= 100 || g.status === 'Completed').length} completed milestones
          </p>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Leave Approval Queue */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Team Leave Approvals</span>
                </h3>
                <p className="text-xs text-slate-400">Approve or decline leave requests from your department</p>
              </div>
              <Link to="/leave/approvals" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                <span>Full Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingLeaves.length === 0 ? (
              <div className="py-10 text-center rounded-2xl bg-slate-900/50 border border-slate-800/80">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">All Team Leaves Reviewed</p>
                <p className="text-xs text-slate-400 mt-0.5">Zero pending leave applications in your queue.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLeaves.slice(0, 4).map((lv) => (
                  <div
                    key={lv._id}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{lv.employeeName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {lv.leaveType} ({lv.daysCount}d)
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        {lv.startDate} &rarr; {lv.endDate}
                      </p>
                      <p className="text-xs text-slate-300 mt-1 italic">"{lv.reason}"</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleLeaveAction(lv._id, 'Approved')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleLeaveAction(lv._id, 'Rejected')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Attendance Regularization & Punctuality */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Team Attendance & Regularization</span>
                </h3>
                <p className="text-xs text-slate-400">Review late check-ins or approve shift regularizations</p>
              </div>
              <Link to="/attendance" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                <span>Attendance Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {lateOrPendingAtt.length === 0 ? (
              <div className="py-10 text-center rounded-2xl bg-slate-900/50 border border-slate-800/80">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">100% On-Time Compliance</p>
                <p className="text-xs text-slate-400 mt-0.5">No late arrivals requiring managerial regularization.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lateOrPendingAtt.slice(0, 4).map((att) => (
                  <div
                    key={att._id}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{att.employeeName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {att.status} {att.lateMinutes ? `(+${att.lateMinutes}m)` : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Date: <span className="font-mono text-slate-300">{att.date}</span> &bull; Check-In:{' '}
                        <span className="font-mono text-slate-300">{att.checkInTime || 'N/A'}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{att.notes}</p>
                    </div>
                    <button
                      onClick={() => handleApproveAttendance(att._id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Regularization</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Department Roster & Performance Matrix */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Direct Reports & Department Roster ({teamMembers.length})</span>
            </h3>
            <p className="text-xs text-slate-400">Click any team member to inspect 360° profile, skills, and OKRs</p>
          </div>
          <Link to="/performance/reviews" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
            Write Performance Review &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((emp) => (
            <div
              key={emp._id}
              onClick={() => navigate(`/employees/${emp._id}`)}
              className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer flex items-center gap-3.5 group"
            >
              <img
                src={emp.avatar}
                alt={emp.name}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/30"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {emp.name}
                  </h4>
                  <span className="text-xs font-mono font-bold text-emerald-400">{emp.performanceScore || 90}%</span>
                </div>
                <p className="text-xs text-slate-400 truncate">{emp.designation}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(emp.skills || []).slice(0, 3).map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

