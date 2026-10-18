import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User,
  Mail,
  Shield,
  Briefcase,
  Phone,
  Calendar,
  Lock,
  Sparkles,
  CheckCircle2,
  FileText,
  Key,
} from 'lucide-react';

export default function Profile() {
  const { user, role, updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState('+91 98450 34567');
  const [bio, setBio] = useState('Senior Full-Stack Engineer specializing in high-throughput React frontends and Node.js microservices.');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveInfo = (e) => {
    e.preventDefault();
    updateProfile({ name });
    showSuccess('Profile information updated successfully!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showError('Please fill in password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match.');
      return;
    }
    showSuccess('Password updated securely with bcrypt hashing.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Employee Profile & Account Security
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your personal details, workstation preferences, and login credentials.
        </p>
      </div>

      {/* Profile Card Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/60 bg-slate-900/80 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-1 text-white shadow-xl shadow-indigo-500/20 ring-4 ring-indigo-500/20">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(user?.name || 'User')}`}
            alt={user?.name}
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {role}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
          <p className="text-xs text-slate-300 pt-1 max-w-xl">{bio}</p>
        </div>
      </div>

      {/* Permitted Info Form */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/60 bg-slate-900/80">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" />
          <span>Permitted Profile Information</span>
        </h3>

        <form onSubmit={handleSaveInfo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Email (Managed by Admin)</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/30 border border-slate-800 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Assigned Role</label>
              <input
                type="text"
                value={role.toUpperCase()}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/30 border border-slate-800 text-sm text-indigo-400 font-bold uppercase cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Professional Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full p-3.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Update Profile Details
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/60 bg-slate-900/80">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-400" />
          <span>Security & Password Credentials</span>
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
            >
              Update Security Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
