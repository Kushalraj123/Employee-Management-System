import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import {
  DollarSign,
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
  Eye,
  Download,
  AlertCircle,
  TrendingUp,
  Settings,
} from 'lucide-react';

export default function PayrollDashboard() {
  const { user, isEmployee, isAdmin, isHR } = useAuth();
  const { showSuccess, showError } = useToast();
  const [payrolls, setPayrolls] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payPeriod, setPayPeriod] = useState('2026-10');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [rules, setRules] = useState({
    basicPercentage: 50,
    hraPercentage: 25,
    allowancesPercentage: 25,
    pfPercentage: 12,
    professionalTax: 200,
    standardDeductionAnnual: 75000,
    currencySymbol: '₹',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const params = payPeriod && payPeriod !== 'All' ? { payPeriod } : {};
      const rulesRes = await api.getPayrollRules().catch(() => ({ data: null }));
      if (rulesRes.data) setRules(rulesRes.data);

      if (isEmployee) {
        const res = await api.getMySalarySlips(params);
        let list = res.data || [];
        if (payPeriod && payPeriod !== 'All') {
          list = list.filter((p) => p.payPeriod === payPeriod);
        }
        setPayrolls(list);
      } else {
        const listRes = await api.getAllPayrolls(params);
        let list = listRes.data || [];
        if (payPeriod && payPeriod !== 'All') {
          list = list.filter((p) => p.payPeriod === payPeriod);
        }
        setPayrolls(list);
      }
    } catch (err) {
      console.warn('Payroll fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [payPeriod]);

  const handleSaveRules = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updatePayrollRules({
        basicPercentage: Number(rules.basicPercentage),
        hraPercentage: Number(rules.hraPercentage),
        allowancesPercentage: Number(rules.allowancesPercentage),
        pfPercentage: Number(rules.pfPercentage),
        professionalTax: Number(rules.professionalTax),
        standardDeductionAnnual: Number(rules.standardDeductionAnnual),
      });
      if (res.data) setRules(res.data);
      showSuccess('Configurable payroll rules updated!');
      setRulesModalOpen(false);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update payroll rules.');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await api.generatePayroll(payPeriod);
      showSuccess(res.message || `Payroll generated for cycle ${payPeriod}!`);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to generate payroll.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updatePayrollStatus(id, newStatus);
      showSuccess(`Status updated to ${newStatus}.`);
      loadData();
    } catch (err) {
      showError('Failed to update payroll status');
    }
  };

  const totalGross = payrolls.reduce((sum, p) => sum + (p.grossSalary || 0), 0);
  const totalDeductions = payrolls.reduce((sum, p) => sum + (p.deductions || 0), 0);
  const totalNet = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Enterprise Payroll & Compensation Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configurable payroll rules, statutory allowances, tax brackets, and downloadable PDF payslips.
          </p>
        </div>

        {(isAdmin || isHR) && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setRulesModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>Configure Payroll Rules</span>
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isGenerating ? 'Processing Batch...' : `Generate Cycle (${payPeriod})`}</span>
            </button>
          </div>
        )}
      </div>

      {/* Active Payroll Formula Banner */}
      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-indigo-300 font-semibold">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Active Configurable Formula:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-slate-300">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">Basic: <strong>{rules.basicPercentage}%</strong></span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">HRA: <strong>{rules.hraPercentage}%</strong></span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">Allowances: <strong>{rules.allowancesPercentage}%</strong></span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-rose-300">PF: <strong>{rules.pfPercentage}% of Basic</strong></span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-300">Std Ded: <strong>₹{(rules.standardDeductionAnnual || 75000).toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Total Gross Earnings</span>
          <span className="text-2xl font-extrabold text-white font-mono">₹{totalGross.toLocaleString()}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Basic + HRA + Allowances</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Total Deductions</span>
          <span className="text-2xl font-extrabold text-rose-400 font-mono">₹{totalDeductions.toLocaleString()}</span>
          <span className="text-[11px] text-slate-400 block mt-1">PF + Tax + Adjustments</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 bg-slate-900/60">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Total Net Disbursed</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono">₹{totalNet.toLocaleString()}</span>
          <span className="text-[11px] text-emerald-400/80 block mt-1 font-medium">Take-Home Payable</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">Pay Period Cycle:</span>
          <select
            value={payPeriod}
            onChange={(e) => setPayPeriod(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="2026-11">2026-11 (November 2026)</option>
            <option value="2026-10">2026-10 (October 2026)</option>
            <option value="2026-09">2026-09 (September 2026)</option>
            <option value="2026-08">2026-08 (August 2026)</option>
            <option value="All">All Cycles</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="font-bold text-white">{payrolls.length}</span> records
        </div>
      </div>

      {/* Payroll Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-700/50 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">Slip #</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Basic</th>
                <th className="py-3 px-4">HRA + Allow.</th>
                <th className="py-3 px-4">Gross</th>
                <th className="py-3 px-4">PF + Tax Ded.</th>
                <th className="py-3 px-4">Net Salary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {payrolls.map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                    <Link
                      to={`/payroll/slips/${p._id || p.slipNumber}`}
                      className="hover:underline hover:text-indigo-300 transition-colors"
                    >
                      {p.slipNumber || p._id}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">{p.employeeName}</td>
                  <td className="py-3.5 px-4">{p.department}</td>
                  <td className="py-3.5 px-4 font-mono">₹{p.basicSalary?.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono">₹{((p.hra || 0) + (p.allowances || 0)).toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">₹{p.grossSalary?.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-rose-400">
                    ₹{p.deductions?.toLocaleString()}
                    {(p.pfDeduction || p.taxDeduction) && (
                      <span className="block text-[10px] text-slate-500">
                        PF: ₹{(p.pfDeduction || 0).toLocaleString()} | Tax: ₹{(p.taxDeduction || 0).toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400">₹{p.netSalary?.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/payroll/slips/${p._id || p.slipNumber}`}
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-all ${
                        p.status === 'Paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : p.status === 'Approved'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                      }`}
                      title="Click to view slip details"
                    >
                      {p.status}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/payroll/slips/${p._id || p.slipNumber}`}
                        className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-indigo-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                        title="View & Print PDF Payslip"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Payslip PDF</span>
                      </Link>

                      {(isAdmin || isHR) && p.status === 'Draft' && (
                        <button
                          onClick={() => handleStatusChange(p._id, 'Approved')}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px]"
                        >
                          Approve
                        </button>
                      )}

                      {(isAdmin || isHR) && p.status === 'Approved' && (
                        <button
                          onClick={() => handleStatusChange(p._id, 'Paid')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configurable Payroll Rules Modal */}
      {rulesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-lg w-full glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700 bg-slate-900 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              <span>Configurable Enterprise Payroll Rules</span>
            </h3>
            <p className="text-xs text-slate-400">
              Customize salary structure percentages, Provident Fund, and tax deduction rules for future payroll cycles.
            </p>

            <form onSubmit={handleSaveRules} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Basic Salary (%)</label>
                  <input
                    type="number"
                    value={rules.basicPercentage}
                    onChange={(e) => setRules({ ...rules, basicPercentage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">HRA (%)</label>
                  <input
                    type="number"
                    value={rules.hraPercentage}
                    onChange={(e) => setRules({ ...rules, hraPercentage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Allowances (%)</label>
                  <input
                    type="number"
                    value={rules.allowancesPercentage}
                    onChange={(e) => setRules({ ...rules, allowancesPercentage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">PF (% of Basic)</label>
                  <input
                    type="number"
                    value={rules.pfPercentage}
                    onChange={(e) => setRules({ ...rules, pfPercentage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Prof. Tax (₹/mo)</label>
                  <input
                    type="number"
                    value={rules.professionalTax}
                    onChange={(e) => setRules({ ...rules, professionalTax: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Std Tax Ded. (₹/yr)</label>
                  <input
                    type="number"
                    value={rules.standardDeductionAnnual}
                    onChange={(e) => setRules({ ...rules, standardDeductionAnnual: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRulesModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
                >
                  Save Payroll Rules
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
