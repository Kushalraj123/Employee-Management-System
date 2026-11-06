import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import {
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  History,
  Info,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Attendance() {
  const { user, isAdmin, isHR, isManager } = useAuth();
  const { showSuccess, showError } = useToast();
  const [attendance, setAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Regularization Modal
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regDate, setRegDate] = useState(new Date().toISOString().split('T')[0]);
  const [regCheckIn, setRegCheckIn] = useState('09:00 AM');
  const [regCheckOut, setRegCheckOut] = useState('06:00 PM');
  const [regReason, setRegReason] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const promises = [
        api.getTodayAttendance(),
        api.getMyAttendanceHistory(),
        api.getAttendancePolicy(),
        api.getHolidays(),
      ];
      if (isAdmin || isHR || isManager) {
        promises.push(api.getAllAttendance());
      }
      const [todayRes, historyRes, policyRes, holRes, allRes] = await Promise.all(promises);
      setAttendance(todayRes.data);
      setHistory(historyRes.data || []);
      setPolicy(policyRes.data);
      setHolidays(holRes?.data || []);
      if (allRes) setAllRecords(allRes.data || []);
    } catch (err) {
      console.warn('Attendance load error:', err);
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
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await api.checkOut();
      showSuccess(res.message);
      setAttendance(res.data);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Check-out failed');
    }
  };

  const handleRegularizeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.regularizeAttendance({
        date: regDate,
        checkInTime: regCheckIn,
        checkOutTime: regCheckOut,
        reason: regReason,
      });
      showSuccess(res.message);
      setRegModalOpen(false);
      setRegReason('');
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit regularization');
    }
  };

  const handleManagerApprove = async (id, action = 'Approved') => {
    try {
      const res = await api.approveAttendance(id, {
        action,
        status: 'Present',
        comments: `${action} by ${user?.name || 'Manager/HR'}`,
      });
      showSuccess(res.message);
      loadData();
    } catch (err) {
      showError('Failed to update attendance approval');
    }
  };

  const isCheckedIn = Boolean(attendance?.checkInTime);
  const isCheckedOut = Boolean(attendance?.checkOutTime);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Attendance Check-In & Time Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Server-side timestamping according to fixed-time office rules.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setRegModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 text-xs font-bold transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Request Regularization</span>
          </button>
          <Link
            to="/attendance/calendar"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Monthly Attendance Calendar</span>
          </Link>
        </div>
      </div>

      {/* Main Interactive Check-In/Out Hero */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-700/60 shadow-2xl bg-slate-900/80 text-center relative overflow-hidden">
        <div className="max-w-xl mx-auto space-y-6">
          {/* Live Clock Display */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Workstation Current Time
            </span>
            <div className="text-4xl sm:text-6xl font-extrabold font-mono text-white tracking-wider bg-gradient-to-r from-indigo-300 via-white to-purple-300 bg-clip-text text-transparent">
              {currentTime}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Today: <span className="text-slate-300 font-medium">{new Date().toDateString()}</span>
            </div>
          </div>

          {/* Today's Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-950/80 border border-slate-800">
            <span>Today's Status:</span>
            {isCheckedIn ? (
              <span className={attendance?.status === 'Late' ? 'text-amber-400' : 'text-emerald-400'}>
                {attendance?.status}
              </span>
            ) : (
              <span className="text-slate-400">Not Checked In</span>
            )}
          </div>

          {/* Interactive Action Button */}
          <div className="pt-2">
            {!isCheckedIn ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckIn}
                className="w-full sm:w-80 mx-auto py-5 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-lg shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-3"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>Punch Check In</span>
              </motion.button>
            ) : !isCheckedOut ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckOut}
                className="w-full sm:w-80 mx-auto py-5 px-8 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-500 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-lg shadow-xl shadow-rose-600/30 transition-all flex items-center justify-center gap-3"
              >
                <Clock className="w-6 h-6" />
                <span>Punch Check Out</span>
              </motion.button>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-sm max-w-md mx-auto">
                ✓ Today's shift completed. Check-out recorded at {attendance?.checkOutTime}.
              </div>
            )}
          </div>

          {/* Timestamps Row */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-left">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Check In</span>
              <span className="text-sm font-bold text-white font-mono">{attendance?.checkInTime || '—'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Check Out</span>
              <span className="text-sm font-bold text-white font-mono">{attendance?.checkOutTime || '—'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Total Working Hours</span>
              <span className="text-sm font-bold text-indigo-400 font-mono">
                {attendance?.workingHours ? `${attendance.workingHours} hrs` : (isCheckedIn ? 'Active' : '0 hrs')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Policy Notice */}
      <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-white text-sm">Official Enterprise Attendance Policy</span>
            <p className="text-slate-300 leading-relaxed">
              Office start time: <strong className="text-indigo-300">{policy?.workStartTime || '09:00'} AM</strong> with a <strong className="text-indigo-300">{policy?.gracePeriodMinutes || 15} min</strong> grace window until 09:15 AM. Check-ins after 09:15 AM are marked <strong className="text-amber-400">Late</strong>. Attendance cutoff is <strong className="text-rose-400">{policy?.cutoffTime || '10:30'} AM</strong>. Minimum hours for full-day credit is <strong className="text-white">{policy?.minWorkingHours || 8} hours</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 bg-slate-900/60">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Recent Attendance History</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Working Hours</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {history.map((row) => (
                <tr key={row._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-white">{row.date}</td>
                  <td className="py-3.5 px-4 font-mono">{row.checkInTime || '—'}</td>
                  <td className="py-3.5 px-4 font-mono">{row.checkOutTime || '—'}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">{row.workingHours ? `${row.workingHours} hrs` : '—'}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      row.status === 'Present'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : row.status === 'Late'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{row.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manager / HR Attendance Approval Queue + Official Holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(isAdmin || isHR || isManager) && (
          <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 bg-slate-900/60 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Manager / HR Attendance Approval Queue</span>
            </h3>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {allRecords
                .filter((r) => r.status === 'Late' || r.regularizationStatus === 'Pending')
                .map((rec) => (
                  <div
                    key={rec._id}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">
                        {rec.employeeName}{' '}
                        <span className="text-amber-400 font-mono">({rec.date})</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Check-in: {rec.checkInTime || 'N/A'} &bull; {rec.notes}
                      </p>
                    </div>
                    <button
                      onClick={() => handleManagerApprove(rec._id, 'Approved')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Approve Present
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Official Holiday Integration */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 bg-slate-900/60 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span>Official Enterprise Holidays ({holidays.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {holidays.map((hol) => (
              <div
                key={hol.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{hol.name}</div>
                  <div className="text-[10px] text-purple-300">{hol.type}</div>
                </div>
                <span className="font-mono text-indigo-300 font-semibold">{hol.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regularization Request Modal */}
      {regModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <form
            onSubmit={handleRegularizeSubmit}
            className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 space-y-4"
          >
            <h3 className="text-lg font-extrabold text-white">Request Attendance Regularization</h3>
            <p className="text-xs text-slate-400">
              Submit a shift correction or late arrival regularization for Manager/HR approval.
            </p>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Attendance Date</label>
              <input
                type="date"
                required
                value={regDate}
                onChange={(e) => setRegDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Actual Check-In</label>
                <input
                  type="text"
                  value={regCheckIn}
                  onChange={(e) => setRegCheckIn(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Actual Check-Out</label>
                <input
                  type="text"
                  value={regCheckOut}
                  onChange={(e) => setRegCheckOut(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Reason for Regularization</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Client onsite deployment / VPN token sync issue..."
                value={regReason}
                onChange={(e) => setRegReason(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRegModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
