import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  FileText,
  Trash2,
} from 'lucide-react';

export default function Notifications() {
  const { user } = useAuth();
  const { showSuccess } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      console.warn('Notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      loadData();
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      showSuccess('All notifications marked as read.');
      loadData();
    } catch (err) {}
  };

  const filtered = filter === 'Unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Notification Command Center</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500 text-white font-mono">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time workflow alerts, leave decisions, payroll notices, and system broadcasts.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-white text-xs font-bold transition-all"
        >
          <CheckCheck className="w-4 h-4 text-emerald-400" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/60 border border-slate-800 w-fit text-xs font-semibold">
        <button
          onClick={() => setFilter('All')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            filter === 'All' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('Unread')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            filter === 'Unread' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((n) => (
          <div
            key={n._id}
            onClick={() => handleMarkRead(n._id)}
            className={`glass-panel p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
              !n.read
                ? 'border-indigo-500/30 bg-slate-900/90 shadow-md shadow-indigo-500/5'
                : 'border-slate-800 bg-slate-950/40 opacity-75'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                n.type === 'success'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : n.type === 'warning'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
              }`}>
                {n.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : n.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white text-sm">{n.title}</h3>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">{n.message}</p>
                <span className="text-[10px] text-slate-500 font-mono">{n.createdAt || 'Recent'}</span>
              </div>
            </div>

            {!n.read && (
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider shrink-0">
                New
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
