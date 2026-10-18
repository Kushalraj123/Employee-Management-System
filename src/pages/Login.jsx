import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import {
  Shield,
  UserCheck,
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Cpu,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeDivision, setActiveDivision] = useState('employee'); // default open to employee
  const { login, demoLogin } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [serverOtp, setServerOtp] = useState('');

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await login(email, password);
      showSuccess(`Welcome back, ${res.user.name}!`);
      navigate('/');
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role, email = null) => {
    setLoading(true);
    try {
      const res = await demoLogin(role, email);
      showSuccess(`Signed in as ${res.user.name} (${role.toUpperCase()}).`);
      navigate('/');
    } catch (err) {
      showError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(email || '');
    setForgotOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotStep(1);
    setServerOtp('');
    setShowForgotModal(true);
  };

  const handleSendForgotCode = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      showError('Please enter your registered work email.');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await api.forgotPassword(forgotEmail);
      showSuccess(res.message);
      if (res.otp) {
        setServerOtp(res.otp);
      }
      setForgotStep(2);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to generate reset code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotOtp) {
      showError('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match. Please recheck.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.resetPassword({
        email: forgotEmail,
        otp: forgotOtp,
        newPassword,
      });
      showSuccess(res.message);
      setForgotStep(3);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-950 text-slate-100 cyber-grid">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Main Glass Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-700/60 shadow-2xl backdrop-blur-2xl bg-slate-900/80">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-3 shadow-lg shadow-indigo-500/30 ring-1 ring-white/20 mb-4">
              <svg viewBox="0 0 32 32" fill="none" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 26V6L13 10.5V17.5L26 26H18L11 21.5V26H6Z" fill="#FFFFFF" />
                <path d="M26 6V26L19 21.5V14.5L6 6H14L21 10.5V6H26Z" fill="#C7D2FE" fillOpacity="0.9" />
                <circle cx="6" cy="6" r="2" fill="#38BDF8" />
                <circle cx="26" cy="26" r="2" fill="#C084FC" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              NEXUS <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">HR</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">
              People. Performance. Connected. — Enterprise Command Portal
            </p>
          </div>

          {/* Quick Demo Switcher (Instant 1-Click Access) */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Quick 1-Click Demo Evaluation
              </span>
              <span className="text-[10px] text-slate-400">Pre-authenticated</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveDivision(null);
                  handleQuickDemo('admin', 'admin@nexus.io');
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white transition-all text-xs font-semibold group shadow-sm text-center"
                title="Sign in directly as Administrator (admin@nexus.io)"
              >
                <Shield className="w-4 h-4 mb-1 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>Admin</span>
                <span className="text-[10px] text-slate-400 font-normal">NEXUS</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDivision(activeDivision === 'hr' ? null : 'hr')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-xs font-semibold group shadow-sm text-center ${
                  activeDivision === 'hr'
                    ? 'border-purple-500 bg-purple-500/25 text-white ring-1 ring-purple-500/50'
                    : 'border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white'
                }`}
                title="View HR Officer accounts"
              >
                <Briefcase className="w-4 h-4 mb-1 text-purple-400 group-hover:scale-110 transition-transform" />
                <div className="flex items-center gap-1">
                  <span>HR Lead</span>
                  {activeDivision === 'hr' ? (
                    <ChevronUp className="w-3 h-3 text-purple-400" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-purple-400" />
                  )}
                </div>
                <span className="text-[10px] text-purple-300/80 font-normal">2 Officers</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDivision(activeDivision === 'employee' ? null : 'employee')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-xs font-semibold group shadow-sm text-center ${
                  activeDivision === 'employee'
                    ? 'border-blue-500 bg-blue-500/25 text-white ring-1 ring-blue-500/50'
                    : 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-white'
                }`}
                title="View Employee accounts"
              >
                <UserCheck className="w-4 h-4 mb-1 text-blue-400 group-hover:scale-110 transition-transform" />
                <div className="flex items-center gap-1">
                  <span>Employee</span>
                  {activeDivision === 'employee' ? (
                    <ChevronUp className="w-3 h-3 text-blue-400" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-blue-400" />
                  )}
                </div>
                <span className="text-[10px] text-blue-300/80 font-normal">2 Members</span>
              </button>
            </div>

            {/* Division Sub-Menu for HR and Employee */}
            <AnimatePresence>
              {activeDivision === 'hr' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 pt-3 border-t border-purple-500/20 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                      <span>Select HR Officer Account:</span>
                    </span>
                    <span className="text-[10px] text-slate-400">1-Click Sign In</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('hr', 'sarah.chen@nexus.io')}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/50 text-left transition-all group"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
                        alt="Sarah Chen"
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-purple-400/40 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                          Sarah Chen
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Chief People Officer
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemo('hr', 'priya.sharma@nexus.io')}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/50 text-left transition-all group"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80"
                        alt="Priya Sharma"
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-purple-400/40 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                          Priya Sharma
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Sr. HR Business Partner
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeDivision === 'employee' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 pt-3 border-t border-blue-500/20 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1">
                      <span>Select Employee Workstation:</span>
                    </span>
                    <span className="text-[10px] text-slate-400">1-Click Sign In</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('employee', 'marcus.vance@nexus.io')}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-blue-500/30 bg-blue-950/40 hover:bg-blue-900/50 text-left transition-all group"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
                        alt="Marcus Vance"
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-blue-400/40 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                          Marcus Vance
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Senior Full-Stack Engineer
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemo('employee', 'elena.rostova@nexus.io')}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-teal-500/30 bg-teal-950/40 hover:bg-teal-900/50 text-left transition-all group"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                        alt="Elena Rostova"
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-teal-400/40 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white group-hover:text-teal-300 transition-colors truncate">
                          Elena Rostova
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Principal Architect & VP Tech
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-teal-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-[11px] uppercase font-bold tracking-wider">or sign in with credentials</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Quick Credential Fill Selector */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-400 mb-4">
            <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mr-1">Prefill:</span>
            <button
              type="button"
              onClick={() => { setEmail('admin@nexus.io'); setPassword('Admin@123'); }}
              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-indigo-500/20 border border-slate-700/60 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300 text-[10px] font-medium transition-all"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => { setEmail('sarah.chen@nexus.io'); setPassword('Hr@123'); }}
              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-purple-500/20 border border-slate-700/60 hover:border-purple-500/40 text-slate-300 hover:text-purple-300 text-[10px] font-medium transition-all"
            >
              Sarah (HR)
            </button>
            <button
              type="button"
              onClick={() => { setEmail('priya.sharma@nexus.io'); setPassword('Hr@123'); }}
              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-purple-500/20 border border-slate-700/60 hover:border-purple-500/40 text-slate-300 hover:text-purple-300 text-[10px] font-medium transition-all"
            >
              Priya (HR)
            </button>
            <button
              type="button"
              onClick={() => { setEmail('marcus.vance@nexus.io'); setPassword('Emp@123'); }}
              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-blue-500/20 border border-slate-700/60 hover:border-blue-500/40 text-slate-300 hover:text-blue-300 text-[10px] font-medium transition-all"
            >
              Marcus (Emp)
            </button>
            <button
              type="button"
              onClick={() => { setEmail('elena.rostova@nexus.io'); setPassword('Emp@123'); }}
              className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-teal-500/20 border border-slate-700/60 hover:border-teal-500/40 text-slate-300 hover:text-teal-300 text-[10px] font-medium transition-all"
            >
              Elena (Emp)
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={openForgotModal}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-all"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition-colors p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Enter Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
            <span>Powered by JWT Authentication, MongoDB Atlas & Role-Based Access</span>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl backdrop-blur-2xl text-slate-100"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {forgotStep === 1 && (
                <form onSubmit={handleSendForgotCode} className="space-y-5">
                  <div className="text-center">
                    <div className="inline-flex p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 mb-3 shadow-lg shadow-indigo-500/20">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Forgot Password?</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Enter your registered work email address. We'll generate a verification code to securely reset your credentials.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Registered Work Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800/60 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {forgotLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Send Code</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 mb-3 shadow-lg shadow-purple-500/20">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Verify & Reset</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Enter the code sent for <span className="text-indigo-300 font-mono">{forgotEmail}</span> and your new password.
                    </p>
                  </div>

                  {serverOtp && (
                    <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/40 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span>Demo OTP: <strong className="font-mono text-indigo-300 tracking-wider text-sm">{serverOtp}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForgotOtp(serverOtp)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 text-[11px] font-semibold transition-colors"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\s+/g, ''))}
                      placeholder="123456"
                      maxLength={6}
                      required
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-950/70 border border-slate-700 text-center font-mono text-lg tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      New Password (min. 6 chars)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition-colors p-0.5"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800/60 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {forgotLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Reset Password</span>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 3 && (
                <div className="text-center py-4 space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-500/20">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Password Reset Complete!</h3>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto">
                    Your credentials for <strong className="text-white">{forgotEmail}</strong> have been updated. You can now authenticate with your new password.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(forgotEmail);
                      setPassword('');
                      setShowForgotModal(false);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    Proceed to Sign In
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
