import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  Server,
  Shield,
  Palette,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  Sparkles,
  Link2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../api';

export default function Settings() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { showSuccess, showError, showInfo } = useToast();

  const [apiUrl, setApiUrl] = useState(
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  );
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState(null);
  const [resettingData, setResettingData] = useState(false);

  const testBackendConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    try {
      const res = await api.checkBackendHealth();
      if (res.isLive) {
        setConnectionResult({
          status: 'success',
          message: 'Connected to Live Node.js + Express + MongoDB Atlas backend successfully!',
        });
        showSuccess('Backend live and responsive');
      } else {
        setConnectionResult({
          status: 'fallback',
          message: 'Backend server not detected at specified endpoint. NEXUS Local Hybrid Store is active and managing data with full CRUD persistence.',
        });
        showInfo('NEXUS Local Hybrid Store is active');
      }
    } catch (err) {
      setConnectionResult({
        status: 'error',
        message: err.message || 'Connection error',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleResetData = () => {
    setResettingData(true);
    setTimeout(() => {
      api.resetMockData();
      setResettingData(false);
      showSuccess('Workforce database restored to default seed records');
    }, 600);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <SettingsIcon className="h-7 w-7 text-indigo-400" />
          System Settings & Integrations
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure API endpoints, cloud databases, visual appearance, and system governance.
        </p>
      </div>

      {/* Backend & MongoDB Configuration Card */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Backend & Database Connectivity</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Node.js + Express REST API & MongoDB Atlas synchronization
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5 text-indigo-400" />
            API Base Endpoint URL (VITE_API_URL)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:5000/api"
              className="flex-1 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              onClick={testBackendConnection}
              disabled={testingConnection}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {testingConnection ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Server className="h-4 w-4" />
                  <span>Test Connection</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Set in your <code className="text-indigo-300">.env</code> file as <code className="text-indigo-300">VITE_API_URL=http://localhost:5000/api</code>
          </p>
        </div>

        {/* Connection Status Box */}
        {connectionResult && (
          <div
            className={`rounded-2xl border p-4 text-xs font-medium flex items-start gap-3 ${
              connectionResult.status === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
            }`}
          >
            {connectionResult.status === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-bold">
                {connectionResult.status === 'success' ? 'Live Backend Connected' : 'NEXUS Hybrid Engine Operating'}
              </p>
              <p className="leading-relaxed text-slate-300">{connectionResult.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Visual & Theme Preferences */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Palette className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Interface & Theme Preferences</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Switch themes and manage 3D glassmorphic depth settings
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div>
            <p className="text-sm font-semibold text-white">Color Mode</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Currently active: <span className="text-indigo-400 font-bold capitalize">{theme} Mode</span>
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition-all"
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span>Switch to Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-indigo-400" />
                <span>Switch to Dark Theme</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Database Management & Reset */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <RotateCcw className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Seed Data & Reset Utilities</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Reset workforce directory to clean demo records anytime for presentations or interviews
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div>
            <p className="text-sm font-semibold text-white">Restore Seed Records</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Restores 12+ pre-populated employees across 5 departments.
            </p>
          </div>

          <button
            onClick={handleResetData}
            disabled={resettingData}
            className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-4 py-2.5 text-xs font-semibold text-amber-300 transition-all cursor-pointer"
          >
            <RotateCcw className={`h-4 w-4 ${resettingData ? 'animate-spin' : ''}`} />
            <span>{resettingData ? 'Restoring...' : 'Restore Seed Records'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
