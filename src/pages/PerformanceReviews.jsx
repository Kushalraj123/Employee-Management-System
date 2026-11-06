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
  BarChart3,
} from 'lucide-react';

export default function PerformanceReviews() {
  const { user, isEmployee } = useAuth();
  const { showSuccess, showError } = useToast();
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selfModalOpen, setSelfModalOpen] = useState(false);

  // Manager Review Form
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [reviewCycle, setReviewCycle] = useState('Q3 2026');
  const [rating, setRating] = useState(4.5);
  const [feedback, setFeedback] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');

  // Self-Assessment Form
  const [selfCycle, setSelfCycle] = useState('Q4 2026');
  const [selfRating, setSelfRating] = useState(4.5);
  const [selfAssessmentText, setSelfAssessmentText] = useState('');
  const [selfStrengths, setSelfStrengths] = useState('');
  const [selfImprovements, setSelfImprovements] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [revRes, empRes, anaRes] = await Promise.all([
        api.getReviews(),
        api.getEmployees(),
        api.getPerformanceAnalytics().catch(() => ({ data: [] })),
      ]);
      setReviews(revRes.data || []);
      setEmployees(empRes.data || []);
      setAnalytics(anaRes.data || []);
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

  const handleSelfAssessmentSubmit = async (e) => {
    e.preventDefault();
    if (!selfAssessmentText) {
      showError('Self-assessment reflection is required.');
      return;
    }
    try {
      await api.submitSelfAssessment({
        reviewCycle: selfCycle,
        selfRating: Number(selfRating),
        selfAssessment: selfAssessmentText,
        strengths: selfStrengths.split(',').map(s => s.trim()).filter(Boolean),
        improvementAreas: selfImprovements.split(',').map(s => s.trim()).filter(Boolean),
      });
      showSuccess('Self-assessment submitted successfully!');
      setSelfModalOpen(false);
      setSelfAssessmentText('');
      setSelfStrengths('');
      setSelfImprovements('');
      loadData();
    } catch (err) {
      showError('Failed to submit self-assessment.');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Performance Reviews & Department Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            360° evaluations, employee self-assessments, skill progression, and department benchmarks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setSelfModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Submit Self-Assessment</span>
          </button>

          {!isEmployee && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Conduct Manager Review</span>
            </button>
          )}
        </div>
      </div>

      {/* Department Performance Analytics Strip */}
      {analytics.length > 0 && (
        <div className="glass-panel rounded-3xl p-5 border border-slate-700/50 bg-slate-900/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Department Performance Benchmarks</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {analytics.map((dept) => (
              <div key={dept.department} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{dept.department}</span>
                  <span className="text-[10px] font-mono text-slate-400">{dept.headcount} members</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-extrabold text-indigo-400 font-mono">{dept.avgScore}%</span>
                  <span className="text-xs font-mono text-amber-400">★ {dept.avgReviewRating}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${dept.avgScore}%` }} />
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>OKRs: {dept.completedGoals}/{dept.goalsCount}</span>
                  <span>Reviews: {dept.reviewsCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

            {/* Self Assessment block if present */}
            {rev.selfAssessment && (
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
                  <span>Employee Self-Assessment</span>
                  {rev.selfRating && <span>Self Rating: {rev.selfRating}/5.0</span>}
                </div>
                <p className="text-slate-300 text-xs">{rev.selfAssessment}</p>
              </div>
            )}

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

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Reviewed by: <strong className="text-slate-400">{rev.reviewerName}</strong></span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">{rev.status || 'Completed'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Self-Assessment Modal */}
      {selfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-lg w-full glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700 bg-slate-900 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Submit Employee Self-Assessment</span>
            </h3>
            <form onSubmit={handleSelfAssessmentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Review Cycle *</label>
                  <input
                    type="text"
                    value={selfCycle}
                    onChange={(e) => setSelfCycle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Self Rating (1.0 - 5.0) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={selfRating}
                    onChange={(e) => setSelfRating(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Key Accomplishments & Reflection *</label>
                <textarea
                  value={selfAssessmentText}
                  onChange={(e) => setSelfAssessmentText(e.target.value)}
                  rows={3}
                  required
                  placeholder="Summarize your impact, deliverables, and growth this quarter..."
                  className="w-full p-3 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Core Strengths Demonstrated (comma-separated)</label>
                <input
                  type="text"
                  value={selfStrengths}
                  onChange={(e) => setSelfStrengths(e.target.value)}
                  placeholder="e.g. System Architecture, Sprint Delivery, Mentoring"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Skill Development Goals (comma-separated)</label>
                <input
                  type="text"
                  value={selfImprovements}
                  onChange={(e) => setSelfImprovements(e.target.value)}
                  placeholder="e.g. Rust, Kubernetes Security, Executive Presentations"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelfModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
                >
                  Submit Self-Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
