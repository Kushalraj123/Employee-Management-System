import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  MessageSquare,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function LeaveApprovals() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [hrComments, setHrComments] = useState('');
  const [modalAction, setModalAction] = useState(null); // 'Approved' or 'Rejected'

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAllLeaves({
        status: statusFilter,
        department: departmentFilter,
      });
      setLeaves(res.data || []);
    } catch (err) {
      console.warn('Approvals fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, departmentFilter]);

  const openReviewModal = (leave, action) => {
    setSelectedLeave(leave);
    setModalAction(action);
    setHrComments('');
  };

  const handleConfirmReview = async () => {
    if (!selectedLeave || !modalAction) return;
    try {
      await api.reviewLeave(selectedLeave._id, {
        status: modalAction,
        hrComments: hrComments.trim(),
      });
      showSuccess(`Leave application successfully ${modalAction.toLowerCase()}!`);
      setSelectedLeave(null);
      setModalAction(null);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to record review action.');
      loadData();
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Leave Approval & Workflow Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review, approve, or reject employee leave applications with feedback comments.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Filter className="w-4 h-4 text-purple-400" />
            <span>Filter Status:</span>
          </div>

          {['All', 'Pending', 'Approved', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-3.5 py-1.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
        >
          <option value="All">All Departments</option>
          <option value="Engineering">Engineering</option>
          <option value="HR">HR</option>
          <option value="Sales">Sales</option>
          <option value="Finance">Finance</option>
          <option value="Marketing">Marketing</option>
        </select>
      </div>

      {/* Leave Requests Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {leaves.map((l) => (
                <tr key={l._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{l.employeeName}</td>
                  <td className="py-3.5 px-4">{l.department}</td>
                  <td className="py-3.5 px-4 font-semibold text-purple-300">{l.leaveType}</td>
                  <td className="py-3.5 px-4 font-mono">{l.startDate} → {l.endDate}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">{l.daysCount} days</td>
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
                  <td className="py-3.5 px-4 text-right">
                    {l.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openReviewModal(l, 'Approved')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all shadow-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openReviewModal(l, 'Rejected')}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-[11px] transition-all shadow-sm"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Confirmation Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full glass-panel rounded-3xl p-6 border border-slate-700 bg-slate-900 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <span>Confirm {modalAction} Leave</span>
            </h3>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div>Employee: <strong className="text-white">{selectedLeave.employeeName}</strong></div>
              <div>Type: <strong className="text-purple-300">{selectedLeave.leaveType} ({selectedLeave.daysCount} days)</strong></div>
              <div>Dates: <strong className="text-slate-300">{selectedLeave.startDate} to {selectedLeave.endDate}</strong></div>
              <p className="italic text-slate-400 mt-2">"{selectedLeave.reason}"</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                HR Review Comments / Instructions
              </label>
              <textarea
                value={hrComments}
                onChange={(e) => setHrComments(e.target.value)}
                placeholder="Optional review notes or on-call handoff guidance..."
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReview}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg ${
                  modalAction === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                }`}
              >
                Confirm {modalAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
