import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Sliders,
} from 'lucide-react';

export default function GoalsProgress() {
  const { user, isEmployee } = useAuth();
  const { showSuccess, showError } = useToast();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New Goal Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Productivity');
  const [targetMetric, setTargetMetric] = useState('100%');
  const [deadline, setDeadline] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getGoals();
      setGoals(res.data || []);
    } catch (e) {
      console.warn('Goals fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title || !deadline) {
      showError('Title and deadline are required.');
      return;
    }
    try {
      await api.createGoal({
        title,
        description,
        category,
        targetMetric,
        deadline,
      });
      showSuccess('New milestone goal created!');
      setModalOpen(false);
      setTitle('');
      setDescription('');
      setDeadline('');
      loadData();
    } catch (err) {
      showError('Failed to create goal');
    }
  };

  const handleUpdateProgress = async (id, currentProgress) => {
    const nextProgress = Math.min(100, currentProgress + 15);
    try {
      await api.updateGoal(id, { progress: nextProgress });
      showSuccess(`Progress updated to ${nextProgress}%`);
      loadData();
    } catch (err) {
      showError('Failed to update progress');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Goals, OKRs & Milestone Progress
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track measurable quarterly outcomes, technical deliverables, and deadlines.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Milestone Goal</span>
        </button>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <div key={goal._id} className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-700/60 bg-slate-900/70 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {goal.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Deadline: <strong className="text-slate-300">{goal.deadline}</strong>
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base mb-1">{goal.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{goal.description}</p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Target: <strong className="text-slate-200">{goal.targetMetric}</strong></span>
                  <span className="font-mono font-bold text-indigo-400 text-sm">{goal.progress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                goal.progress >= 100
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {goal.progress >= 100 ? 'Completed' : goal.status || 'In Progress'}
              </span>

              {goal.progress < 100 && (
                <button
                  onClick={() => handleUpdateProgress(goal._id, goal.progress)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+15% Progress</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Goal Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700 bg-slate-900 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              <span>Create Performance Goal / OKR</span>
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Goal Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement Vite 6 Pipeline Migration"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Productivity">Productivity</option>
                    <option value="Technical Mastery">Technical Mastery</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Strategic Impact">Strategic Impact</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Metric</label>
                  <input
                    type="text"
                    value={targetMetric}
                    onChange={(e) => setTargetMetric(e.target.value)}
                    placeholder="100% Completion"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Deadline *</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Detailed Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specific deliverables, benchmarks..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
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
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
