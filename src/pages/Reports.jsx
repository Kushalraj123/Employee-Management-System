import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  TrendingUp,
  FileSpreadsheet,
  FileCode,
  FileText,
  DollarSign,
  Users,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { useToast } from '../context/ToastContext';
import api from '../api';

export default function Reports() {
  const { showSuccess, showError } = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.getEmployees();
        setEmployees(res.data || []);
      } catch (err) {
        showError('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Salary breakdown by department (in INR)
  const salaryData = [
    { department: 'Engineering', avgSalary: 2450000, medianSalary: 2200000, min: 1400000, max: 3600000 },
    { department: 'HR', avgSalary: 1450000, medianSalary: 1300000, min: 900000, max: 2200000 },
    { department: 'Sales', avgSalary: 1950000, medianSalary: 1800000, min: 1100000, max: 3000000 },
    { department: 'Finance', avgSalary: 1750000, medianSalary: 1600000, min: 1000000, max: 2600000 },
    { department: 'Marketing', avgSalary: 1650000, medianSalary: 1550000, min: 950000, max: 2400000 },
  ];

  const exportCSV = () => {
    if (!employees.length) return;
    const headers = ['ID', 'Name', 'Email', 'Department', 'Designation', 'Status', 'Salary', 'JoinDate'];
    const rows = employees.map((e) => [
      e._id || e.id,
      `"${e.name}"`,
      e.email,
      e.department,
      `"${e.designation}"`,
      e.status,
      e.salary || 95000,
      e.joinDate || e.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NEXUS_Workforce_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('CSV Report downloaded successfully');
  };

  const exportJSON = () => {
    if (!employees.length) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(
        {
          organization: 'NEXUS HR Enterprise',
          generatedAt: new Date().toISOString(),
          totalWorkforce: employees.length,
          employees: employees,
        },
        null,
        2
      )
    )}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `NEXUS_Workforce_Export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('JSON Data exported successfully');
  };

  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showError('Please allow popups to export PDF');
      return;
    }

    const employeeRows = employees
      .map(
        (emp) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${emp.name}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${emp.department}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${emp.designation}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${emp.status || 'Active'}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">₹${Number(emp.salary || 1400000).toLocaleString('en-IN')}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${emp.email}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>NEXUS HR - Executive Workforce Report</title>
          <style>
            @media print {
              @page { margin: 1.5cm; }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 24px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #4f46e5;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .logo {
              font-size: 24px;
              font-weight: 800;
              color: #4f46e5;
              letter-spacing: -0.5px;
            }
            .meta {
              text-align: right;
              font-size: 12px;
              color: #64748b;
            }
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 16px;
              margin-bottom: 28px;
            }
            .kpi-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
            }
            .kpi-title {
              font-size: 11px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 600;
            }
            .kpi-value {
              font-size: 22px;
              font-weight: 700;
              color: #0f172a;
              margin-top: 4px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
              text-align: left;
            }
            th {
              background: #f1f5f9;
              padding: 10px 12px;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 11px;
              color: #475569;
              border-bottom: 2px solid #cbd5e1;
            }
            .footer {
              margin-top: 32px;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">NEXUS HR</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Executive Workforce & Intelligence Report</div>
            </div>
            <div class="meta">
              <div><strong>Generated Date:</strong> ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
              <div><strong>Status:</strong> Verified Enterprise Records</div>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-title">Total Workforce</div>
              <div class="kpi-value">${employees.length} Members</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Retention Rate</div>
              <div class="kpi-value">98.4%</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Avg Compensation</div>
              <div class="kpi-value">₹18,50,000</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Diversity Index</div>
              <div class="kpi-value">89 / 100</div>
            </div>
          </div>

          <h3 style="font-size: 15px; margin-bottom: 12px; color: #1e293b;">Workforce Talent Directory</h3>
          <table>
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Salary (INR)</th>
                <th>Work Email</th>
              </tr>
            </thead>
            <tbody>
              ${employeeRows}
            </tbody>
          </table>

          <div class="footer">
            Generated by NEXUS HR Enterprise System &bull; Confidential &bull; All Rights Reserved
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showSuccess('PDF print preview generated');
  };

  return (
    <div className="space-y-8">
      {/* Header and Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Executive Reports & Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Workforce compensation, retention trends, and exportable organization data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-300 hover:text-rose-700 dark:hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <FileText className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={exportJSON}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all cursor-pointer"
          >
            <FileCode className="h-4 w-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white/95 dark:bg-slate-900/60 p-5 backdrop-blur-xl shadow-sm">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">Retention Rate</span>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">98.4%</p>
          <span className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="h-3 w-3" /> Top 5% in SaaS Tech
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white/95 dark:bg-slate-900/60 p-5 backdrop-blur-xl shadow-sm">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">Avg Compensation</span>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹18,50,000</p>
          <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">Competitive Market Index: 1.14</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white/95 dark:bg-slate-900/60 p-5 backdrop-blur-xl shadow-sm">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">Onboarding Velocity</span>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">4.2 Days</p>
          <span className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="h-3 w-3" /> 35% faster than benchmark
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white/95 dark:bg-slate-900/60 p-5 backdrop-blur-xl shadow-sm">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">Diversity Index</span>
          <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">89 / 100</p>
          <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">Global cross-functional parity</span>
        </div>
      </div>

      {/* Salary Distribution Bar Chart */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/5 bg-white/95 dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-lg">₹</span>
              Compensation Benchmark by Department (INR ₹ in Lakhs)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Average vs Median base salary distributions across departments.
            </p>
          </div>
        </div>

        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={salaryData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="department"
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: 'rgba(100, 116, 139, 0.2)' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-950/90 p-3 shadow-xl text-xs backdrop-blur-xl">
                        <p className="font-bold text-slate-900 dark:text-white mb-1.5">{label}</p>
                        <p className="text-indigo-600 dark:text-indigo-300">
                          Average: <span className="text-slate-900 dark:text-white font-bold">₹{Number(payload[0]?.value || 0).toLocaleString('en-IN')}</span>
                        </p>
                        <p className="text-emerald-600 dark:text-emerald-300">
                          Median: <span className="text-slate-900 dark:text-white font-bold">₹{Number(payload[1]?.value || 0).toLocaleString('en-IN')}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '15px' }}
                formatter={(value) => <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">{value}</span>}
              />
              <Bar dataKey="avgSalary" name="Average Salary" fill="#6366F1" radius={[8, 8, 0, 0]} />
              <Bar dataKey="medianSalary" name="Median Salary" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
