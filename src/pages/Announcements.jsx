import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import {
  Bell,
  Pin,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
  Sparkles,
  Filter,
  Heart,
  Award,
  Trophy,
} from 'lucide-react';

export default function Announcements() {
  const { user, isEmployee } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [kudosList, setKudosList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [kudosModalOpen, setKudosModalOpen] = useState(false);

  // New announcement form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [targetDepartment, setTargetDepartment] = useState('All');
  const [isPinned, setIsPinned] = useState(false);

  // Kudos form fields
  const [toEmployeeId, setToEmployeeId] = useState('');
  const [kudosBadge, setKudosBadge] = useState('Innovation Champion');
  const [kudosMessage, setKudosMessage] = useState('');
  const [kudosPoints, setKudosPoints] = useState(50);

  const loadData = async () => {
    setLoading(true);
    try {
      const [annRes, kudRes, empRes] = await Promise.all([
        api.getAnnouncements({ category: categoryFilter }),
        api.getKudos().catch(() => ({ data: [] })),
        api.getEmployees().catch(() => ({ data: [] })),
      ]);
      setAnnouncements(annRes.data || []);
      setKudosList(kudRes.data || []);
      setEmployees(empRes.data || []);
      if (empRes.data?.length && !toEmployeeId) {
        setToEmployeeId(empRes.data[0]._id);
      }
    } catch (err) {
      console.warn('Announcements error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      showError('Title and description are required.');
      return;
    }
    try {
      await api.createAnnouncement({
        title,
        description,
        category,
        targetDepartment,
        isPinned,
      });
      showSuccess('Announcement published to organization!');
      setModalOpen(false);
      setTitle('');
      setDescription('');
      setIsPinned(false);
      loadData();
    } catch (err) {
      showError('Failed to publish announcement.');
    }
  };

  const handleSendKudos = async (e) => {
    e.preventDefault();
    if (!kudosMessage) {
      showError('Recognition message is required.');
      return;
    }
    try {
      await api.sendKudos({
        toEmployeeId,
        badge: kudosBadge,
        message: kudosMessage,
        points: Number(kudosPoints),
      });
      showSuccess('Kudos & peer recognition broadcasted!');
      setKudosModalOpen(false);
      setKudosMessage('');
      loadData();
    } catch (err) {
      showError('Failed to send kudos.');
    }
  };

  const handleLikeKudos = async (id) => {
    try {
      await api.likeKudos(id);
      loadData();
    } catch (err) {}
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markAnnouncementRead(id);
      showSuccess('Marked as read');
      loadData();
    } catch (err) {}
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Company Bulletins & Employee Recognition Wall
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Official organizational notices, holiday calendars, and peer-to-peer Kudos recognition.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setKudosModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-pink-600/20 transition-all"
          >
            <Trophy className="w-4 h-4" />
            <span>Give Kudos & Recognition</span>
          </button>

          {!isEmployee && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Announcement</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Switch Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'announcements'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Official Announcements ({announcements.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('kudos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'kudos'
              ? 'bg-gradient-to-r from-amber-500 to-pink-600 text-white shadow-lg shadow-pink-600/30'
              : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Employee Recognition & Kudos Wall ({kudosList.length})</span>
        </button>
      </div>

      {activeTab === 'announcements' ? (
        <>
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-slate-900/60 border border-slate-800">
            {['All', 'General', 'Holiday', 'Meeting', 'Policy Update', 'Urgent Notice'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Announcements List */}
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div
                key={ann._id}
                className={`glass-panel rounded-3xl p-6 sm:p-7 border transition-all ${
                  ann.isPinned
                    ? 'border-indigo-500/40 bg-gradient-to-br from-indigo-950/30 to-slate-900/80 shadow-indigo-500/10'
                    : 'border-slate-700/50 bg-slate-900/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {ann.isPinned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <Pin className="w-3 h-3 fill-indigo-400 text-indigo-400" />
                        Pinned
                      </span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ann.category === 'Urgent Notice'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : ann.category === 'Holiday'
                        ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {ann.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(ann.publishDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkRead(ann._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Acknowledge</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white mb-2">{ann.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line mb-4">
                  {ann.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>Author: <strong className="text-slate-300">{ann.authorName}</strong></span>
                  <span>Target: <strong className="text-indigo-300">{ann.targetDepartment}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Employee Kudos & Recognition Wall */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {kudosList.map((k) => (
            <div
              key={k._id}
              className="glass-panel rounded-3xl p-6 border border-amber-500/30 bg-gradient-to-br from-amber-950/15 via-slate-900/80 to-pink-950/15 shadow-xl space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-pink-500 text-white shadow-lg shadow-amber-500/20">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {k.badge}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      {k.toEmployeeName}
                    </h3>
                    <span className="text-xs text-slate-400">{k.toDepartment}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold">
                  +{k.points || 50} pts
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                "{k.message}"
              </p>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                <span>
                  Recognized by <strong className="text-indigo-300">{k.fromName}</strong> ({k.fromRole})
                </span>
                <button
                  onClick={() => handleLikeKudos(k._id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 font-bold text-xs transition-all"
                >
                  <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
                  <span>{(k.likes || []).length} Applause</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send Kudos Modal */}
      {kudosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-lg w-full glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700 bg-slate-900 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Recognize a Colleague (Kudos)</span>
            </h3>
            <form onSubmit={handleSendKudos} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Colleague *</label>
                <select
                  value={toEmployeeId}
                  onChange={(e) => setToEmployeeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                >
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.department} — {emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Recognition Badge *</label>
                  <select
                    value={kudosBadge}
                    onChange={(e) => setKudosBadge(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="Innovation Champion">Innovation Champion</option>
                    <option value="Team Player">Team Player</option>
                    <option value="Customer Obsession">Customer Obsession</option>
                    <option value="Delivery Excellence">Delivery Excellence</option>
                    <option value="Leadership Star">Leadership Star</option>
                    <option value="Culture Builder">Culture Builder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reward Points</label>
                  <input
                    type="number"
                    value={kudosPoints}
                    onChange={(e) => setKudosPoints(e.target.value)}
                    min="10"
                    max="500"
                    step="10"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Appreciation Note *</label>
                <textarea
                  value={kudosMessage}
                  onChange={(e) => setKudosMessage(e.target.value)}
                  rows={3}
                  required
                  placeholder="Share how this person went above and beyond..."
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setKudosModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 text-white font-bold text-xs shadow-lg"
                >
                  Broadcast Kudos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Announcement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-lg w-full glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700 bg-slate-900 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              <span>Publish Organization Announcement</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Announcement Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q4 Company All-Hands & Product Launch"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="General">General</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Policy Update">Policy Update</option>
                    <option value="Urgent Notice">Urgent Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Department</label>
                  <select
                    value={targetDepartment}
                    onChange={(e) => setTargetDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="All">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description & Details *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write full details, schedules, links..."
                  rows={4}
                  required
                  className="w-full p-3.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="pinCheck" className="text-xs font-medium text-slate-300">
                  Pin this announcement to top of dashboard
                </label>
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
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
