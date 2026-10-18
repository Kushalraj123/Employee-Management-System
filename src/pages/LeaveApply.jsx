import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import {
  Calendar,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';

export default function LeaveApply() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState({ casualTotal: 0, casualUsed: 0, sickTotal: 0, sickUsed: 0, earnedTotal: 0, earnedUsed: 0, unpaidUsed: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form inputs
  const [leaveType, setLeaveType] = useState('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getMyLeaves();
      setLeaves(res.data || []);
      if (res.balance) setBalance(res.balance);
    } catch (e) {
      console.warn('Leaves load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      showError('Please fill in all mandatory fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.applyLeave({ leaveType, startDate, endDate, reason });
      showSuccess(res.message || 'Leave request submitted!');
      setStartDate('');
      setEndDate('');
      setReason('');
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to submit leave');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Leave Application & Balances
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Apply for paid casual, sick, or earned leaves with instant balance verification.
        </p>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Casual Leave</span>
          <span className="text-2xl font-extrabold text-indigo-400 font-mono">
            {balance.casualTotal - balance.casualUsed}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">of {balance.casualTotal} days total</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-purple-500/20 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Sick Leave</span>
          <span className="text-2xl font-extrabold text-purple-400 font-mono">
            {balance.sickTotal - balance.sickUsed}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">of {balance.sickTotal} days total</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Earned Leave</span>
          <span className="text-2xl font-extrabold text-cyan-400 font-mono">
            {balance.earnedTotal - balance.earnedUsed}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">of {balance.earnedTotal} days total</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Unpaid Leave</span>
          <span className="text-2xl font-extrabold text-slate-400 font-mono">
            {balance.unpaidUsed || 0}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">days taken</span>
        </div>
      </div>

      {/* Application Form & Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-xl bg-slate-900/80 lg:col-span-2">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-400" />
            <span>Submit Leave Application</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Leave Type *</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Earned">Earned Leave</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">End Date *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mandatory Reason for Leave *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State specific purpose, emergency details, or conference attendance info..."
                rows={4}
                required
                className="w-full p-3.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting Application...' : 'Send Application to HR'}</span>
            </button>
          </form>
        </div>

        {/* Guidelines Card */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-700/60 bg-slate-900/60 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Leave Policy Guidelines</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              • <strong>Casual Leaves:</strong> Intended for personal matters. Must be submitted at least 24 hours in advance.
            </p>
            <p>
              • <strong>Sick Leaves:</strong> For medical necessities. Applications exceeding 2 consecutive days require medical documentation.
            </p>
            <p>
              • <strong>Approval Window:</strong> HR reviews submissions within 24 working hours. You will receive an in-app toast notification once processed.
            </p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 bg-slate-900/60">
        <h3 className="font-bold text-white text-base mb-4">My Leave History & Status</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">HR Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {leaves.map((l) => (
                <tr key={l._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{l.leaveType}</td>
                  <td className="py-3.5 px-4 font-mono">{l.startDate} → {l.endDate}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">{l.daysCount}</td>
                  <td className="py-3.5 px-4 max-w-xs truncate">{l.reason}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      l.status === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : l.status === 'Rejected'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 italic">
                    {l.hrComments || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
