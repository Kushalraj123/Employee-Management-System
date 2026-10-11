import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  Printer,
  Download,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Calendar,
} from 'lucide-react';

export default function SalarySlip() {
  const { id } = useParams();
  const { user } = useAuth();
  const [slip, setSlip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSlip = async () => {
      setLoading(true);
      try {
        const res = await api.getSalarySlipById(id);
        setSlip(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Unauthorized or slip not found');
      } finally {
        setLoading(false);
      }
    };
    fetchSlip();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !slip) {
    return (
      <div className="p-8 text-center glass-panel rounded-3xl max-w-md mx-auto my-12 border border-rose-500/30">
        <h2 className="text-lg font-bold text-white mb-2">Access Denied or Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">{error || 'Unable to retrieve salary slip.'}</p>
        <Link to="/payroll" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">
          Back to Payroll
        </Link>
      </div>
    );
  }

  const basicSalary = slip.basicSalary || 105000;
  const hra = slip.hra || 42000;
  const allowances = slip.allowances || 25000;
  const bonus = slip.bonus || 8000;
  const deductions = slip.deductions || 14000;
  const grossSalary = slip.grossSalary || (basicSalary + hra + allowances + bonus);
  const netSalary = slip.netSalary || (grossSalary - deductions);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link
          to="/payroll"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Payroll</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
          >
            <Printer className="w-4 h-4" />
            <span>Print Salary Slip</span>
          </button>
        </div>
      </div>

      {/* Printable Professional Salary Slip */}
      <div className="bg-white text-slate-900 rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-200 print:border-none print:shadow-none print:p-0">
        {/* Company Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b-2 border-slate-900 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center p-2.5 text-white shadow-md">
              <svg viewBox="0 0 32 32" fill="none" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 26V6L13 10.5V17.5L26 26H18L11 21.5V26H6Z" fill="#FFFFFF" />
                <path d="M26 6V26L19 21.5V14.5L6 6H14L21 10.5V6H26Z" fill="#EEF2FF" fillOpacity="0.9" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 font-mono">NEXUS HR SYSTEMS</h2>
              <p className="text-xs text-slate-600 font-medium">Enterprise Workforce Management Corp. &bull; Registered Office</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800">
              Official Salary Slip
            </span>
            <div className="text-xs text-slate-600 font-mono mt-1">Ref: {slip.slipNumber || slip._id}</div>
            <div className="text-xs text-slate-600 font-mono">Cycle: {slip.payPeriod}</div>
          </div>
        </div>

        {/* Employee Summary Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Employee Name</span>
            <strong className="text-sm font-bold text-slate-900">{slip.employeeName}</strong>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Employee Code</span>
            <strong className="text-sm font-bold text-slate-900 font-mono">{slip.employeeId}</strong>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Department</span>
            <strong className="text-sm font-bold text-slate-900">{slip.department}</strong>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Designation</span>
            <strong className="text-sm font-bold text-slate-900">{slip.designation}</strong>
          </div>
        </div>

        {/* Earnings & Deductions Breakdown Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
          {/* Earnings Column */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 pb-2 mb-3 border-b-2 border-indigo-600">
              Earnings Components
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Basic Salary</span>
                <span className="font-mono font-bold text-slate-900">₹{basicSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">House Rent Allowance (HRA)</span>
                <span className="font-mono font-bold text-slate-900">₹{hra.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Special Allowances</span>
                <span className="font-mono font-bold text-slate-900">₹{allowances.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Performance Incentive / Bonus</span>
                <span className="font-mono font-bold text-slate-900">₹{bonus.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2.5 font-bold text-sm bg-slate-50 px-2 rounded-lg">
                <span className="text-slate-900">Gross Total Earnings</span>
                <span className="font-mono text-indigo-700">₹{grossSalary.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Deductions Column */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 pb-2 mb-3 border-b-2 border-rose-600">
              Deductions & Statutory
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Provident Fund (PF) Contribution</span>
                <span className="font-mono font-bold text-slate-900">₹{Math.round(deductions * 0.6).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Professional Tax (PT)</span>
                <span className="font-mono font-bold text-slate-900">₹200</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Tax Deducted at Source (TDS)</span>
                <span className="font-mono font-bold text-slate-900">₹{Math.round(deductions * 0.4 - 200).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Attendance Adjustments</span>
                <span className="font-mono font-bold text-slate-900">₹0</span>
              </div>
              <div className="flex justify-between py-2.5 font-bold text-sm bg-slate-50 px-2 rounded-lg">
                <span className="text-slate-900">Total Deductions</span>
                <span className="font-mono text-rose-700">₹{deductions.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary Payable Box */}
        <div className="p-6 rounded-2xl bg-indigo-50/80 border border-indigo-200 mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">Net Take-Home Salary</span>
            <span className="text-xs text-indigo-700">Disbursed via {slip.paymentMethod || 'Direct Deposit'}</span>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-3xl font-extrabold text-indigo-950 font-mono">
              ₹{netSalary.toLocaleString()}
            </div>
            <div className="text-[11px] text-indigo-800 font-medium">Status: {slip.status || 'Paid'}</div>
          </div>
        </div>

        {/* Footer Audit */}
        <div className="pt-8 mt-8 border-t border-slate-200 text-center text-[10px] text-slate-500 space-y-1">
          <p>This is a computer-generated salary slip and requires no physical signature under the Digital Governance Act.</p>
          <p>&copy; {new Date().getFullYear()} NEXUS Systems International &bull; All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
}
