import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import {
  Users,
  Shield,
  UserCheck,
  Briefcase,
  Plus,
  Lock,
  Mail,
  ToggleLeft,
  ToggleRight,
  Sparkles,
} from 'lucide-react';

export default function UserManagement() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New user form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('employee');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      setUsers(res.data || []);
    } catch (e) {
      console.warn('Users fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.updateUserRole(id, newRole);
      showSuccess(`User role changed to ${newRole.toUpperCase()}.`);
      loadData();
    } catch (err) {
      showError('Failed to change role');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.toggleUserStatus(id);
      showSuccess('Account status toggled.');
      loadData();
    } catch (err) {
      showError('Failed to update status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      showError('Name and email are mandatory.');
      return;
    }
    try {
      await api.createUser({ name, email, role });
      showSuccess(`User created with ${role.toUpperCase()} role.`);
      setModalOpen(false);
      setName('');
      setEmail('');
      loadData();
    } catch (err) {
      showError('Failed to create user');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            User Governance & Role Permissions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Administer login accounts, assign Admin / HR / Employee roles, and manage access states.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Account</span>
        </button>
      </div>

      {/* Role Breakdown Badges */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-indigo-500/20 bg-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Administrators</span>
            <span className="text-xl font-bold text-indigo-400 font-mono">
              {users.filter(u => u.role === 'admin').length}
            </span>
          </div>
          <Shield className="w-6 h-6 text-indigo-400/50" />
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-purple-500/20 bg-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">HR Officers</span>
            <span className="text-xl font-bold text-purple-400 font-mono">
              {users.filter(u => u.role === 'hr').length}
            </span>
          </div>
          <Briefcase className="w-6 h-6 text-purple-400/50" />
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-blue-500/20 bg-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold block">Staff Employees</span>
            <span className="text-xl font-bold text-blue-400 font-mono">
              {users.filter(u => u.role === 'employee').length}
            </span>
          </div>
          <UserCheck className="w-6 h-6 text-blue-400/50" />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role Permission</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{u.name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-950/80 border ${
                        u.role === 'admin'
                          ? 'border-indigo-500/50 text-indigo-300'
                          : u.role === 'hr'
                          ? 'border-purple-500/50 text-purple-300'
                          : 'border-blue-500/50 text-blue-300'
                      }`}
                    >
                      <option value="admin">ADMIN</option>
                      <option value="hr">HR</option>
                      <option value="employee">EMPLOYEE</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      u.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {u.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Active'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u._id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      {u.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700 bg-slate-900 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span>Provision User Account</span>
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rachel.adams@nexus.io"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="employee">Employee</option>
                  <option value="hr">HR Lead</option>
                  <option value="admin">Admin</option>
                </select>
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
