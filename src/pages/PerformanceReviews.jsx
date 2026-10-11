import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import {
  Award,
  Star,
  Plus,
  TrendingUp,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  Target,
} from 'lucide-react';

export default function PerformanceReviews() {
  const { user, isEmployee } = useAuth();
  const { showSuccess, showError } = useToast();
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [reviewCycle, setReviewCycle] = useState('Q3 2026');
  const [rating, setRating] = useState(4.5);
  const [feedback, setFeedback] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [revRes, empRes] = await Promise.all([
        api.getReviews(),
        api.getEmployees(),
      ]);
      setReviews(revRes.data || []);
      setEmployees(empRes.data || []);
      if (empRes.data?.length) setTargetEmployeeId(empRes.data[0]._id);
    } catch (err) {
      console.warn('Reviews error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback) {
      showError('Feedback comment is required.');
      return;
    }
    try {
      await api.createReview({
        employeeId: targetEmployeeId,
        reviewCycle,
        rating: Number(rating),
        feedback,
        strengths: strengths.split(',').map(s => s.trim()).filter(Boolean),
        improvementAreas: improvements.split(',').map(s => s.trim()).filter(Boolean),
      });
      showSuccess('Performance review recorded successfully.');
      setModalOpen(false);
      setFeedback('');
      setStrengths('');
      setImprovements('');
      loadData();
    } catch (err) {
      showError('Failed to record review.');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Performance Reviews & Feedback History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Periodic evaluation cycles, multi-criteria ratings, strengths, and mentorship milestones.
          </p>
        </div>

        {!isEmployee && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Conduct Review</span>
          </button>
        )}
      </div>

      {/* Review Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((rev) => (
          <div key={rev._id} className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-700/60 bg-slate-900/70 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">{rev.employeeName}</h3>
                <span className="text-xs text-purple-400 font-mono font-semibold">{rev.reviewCycle}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold font-mono text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{rev.rating} / 5.0</span>
              </div>
            </div>

            {/* Criteria mini bars */}
            {rev.criteria && (
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2 text-xs">
                {Object.entries(rev.criteria).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="capitalize text-slate-400 text-[11px]">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-mono font-bold text-slate-200">{val}/5</span>
                  </div>
                ))}
              </div>
            )}

            {/* Qualitative Feedback */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
              "{rev.feedback}"
            </p>

            {/* Strengths & Improvements */}
            <div className="space-y-2 text-xs">
              {rev.strengths && rev.strengths.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Key Strengths</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rev.strengths.map((str, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px]">
                        ✓ {str}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {rev.improvementAreas && rev.improvementAreas.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Improvement Goals</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rev.improvementAreas.map((imp, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px]">
                        → {imp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500">
              Reviewed by: <strong className="text-slate-400">{rev.reviewerName}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Conduct Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-lg w-full glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700 bg-slate-900 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span>Record Performance Evaluation</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Employee *</label>
                <select
                  value={targetEmployeeId}
                  onChange={(e) => setTargetEmployeeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.department} &bull; {emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Review Cycle *</label>
                  <input
                    type="text"
                    value={reviewCycle}
                    onChange={(e) => setReviewCycle(e.target.value)}
                    placeholder="Q3 2026"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Overall Rating (1.0 - 5.0) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Qualitative Manager Feedback *</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Detail key accomplishments, technical leadership, velocity..."
                  rows={3}
                  required
                  className="w-full p-3 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Key Strengths (comma-separated)</label>
                <input
                  type="text"
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="e.g. Distributed Systems, Code Review Rigor, Mentorship"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Growth Opportunities (comma-separated)</label>
                <input
                  type="text"
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="e.g. Public Tech Talks, Cross-Team RFC Alignment"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
