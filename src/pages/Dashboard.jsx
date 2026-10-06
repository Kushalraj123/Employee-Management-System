import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Cpu,
  UserCheck,
  UserPlus,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Building2,
  TrendingUp,
  Download,
  Plus,
  Eye,
  ChevronRight,
  Activity,
  Layers,
  Globe2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import StatsCard from '../components/StatsCard';
import Employee3DCanvas from '../components/Employee3DCanvas';
import EmployeeModal from '../components/EmployeeModal';
import DeleteModal from '../components/DeleteModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import { getInitials, getAvatarGradient } from '../utils/avatar';
import api from '../api';

export default function Dashboard() {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, employeesRes] = await Promise.all([
        api.getDashboardStats(),
        api.getEmployees({ sort: 'Newest' }),
      ]);
      setStats(statsRes.stats);
      setRecentEmployees((employeesRes.data || []).slice(0, 5));
    } catch (err) {
      showError('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateEmployee = async (formData) => {
    setIsSubmitting(true);
    try {
      await api.createEmployee(formData);
      showSuccess(`Employee ${formData.name} added successfully!`);
      setModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentData = stats?.departmentDistribution || [
    { name: 'Engineering', count: 0, percentage: 0, color: '#3B82F6' },
    { name: 'HR', count: 0, percentage: 0, color: '#8B5CF6' },
    { name: 'Sales', count: 0, percentage: 0, color: '#06B6D4' },
    { name: 'Finance', count: 0, percentage: 0, color: '#10B981' },
    { name: 'Marketing', count: 0, percentage: 0, color: '#F59E0B' },
  ];

  const growthData = stats?.growthData || [
    { month: 'May', employees: 1, engineering: 1 },
    { month: 'Jun', employees: 2, engineering: 1 },
    { month: 'Jul', employees: 3, engineering: 2 },
    { month: 'Aug', employees: 4, engineering: 2 },
    { month: 'Sep', employees: 5, engineering: 3 },
    { month: 'Oct', employees: stats?.totalEmployees || 6, engineering: stats?.engineeringCount || 3 },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-white/5 dark:border-white/10 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>{currentDate}</span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational
            </span>
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-purple-400">Admin</span>
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-400 max-w-xl">
            Here's what's happening across your digital workplace and global talent network today.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            to="/reports"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <Download className="h-4 w-4 text-indigo-400" />
            <span>Export Report</span>
          </Link>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* 4 Premium 3D Statistics Cards */}
      {loading ? (
        <LoadingSkeleton variant="stats" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Total Employees"
            value={stats?.totalEmployees ?? 0}
            subtitle={
              stats?.activeCount !== undefined
                ? `${stats.activeCount} Active • ${stats.onLeaveCount || 0} On Leave`
                : 'Total active workforce'
            }
            icon={Users}
            trend={stats?.activeRate ? `${stats.activeRate} Active` : '100% Active'}
            trendType="positive"
            sparkline={[1, 2, 3, 4, 4, 5, 6, stats?.totalEmployees || 6]}
            accentColor="blue"
          />

          <StatsCard
            title="Engineering"
            value={stats?.engineeringCount ?? 0}
            subtitle={stats?.engineeringShare || '0% of workforce'}
            icon={Cpu}
            trend="Core Tech"
            trendType="positive"
            sparkline={[1, 1, 2, 2, 3, stats?.engineeringCount || 3]}
            accentColor="indigo"
          />

          <StatsCard
            title="People & HR"
            value={stats?.hrCount ?? 0}
            subtitle={stats?.hrShare || '0% of workforce'}
            icon={UserCheck}
            trend="Talent Ops"
            trendType="positive"
            sparkline={[1, 1, 1, 1, 1, stats?.hrCount || 1]}
            accentColor="violet"
          />

          <StatsCard
            title="New Employees"
            value={stats?.newEmployees ?? 0}
            subtitle={stats?.newShare || 'Recent additions'}
            icon={UserPlus}
            trend="Onboarded"
            trendType="positive"
            sparkline={[0, 1, 1, 2, 2, stats?.newEmployees || 3]}
            accentColor="emerald"
          />
        </div>
      )}

      {/* 3D Hero Element: Connected Workforce Visualizer */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 dark:border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-indigo-950/40 p-6 backdrop-blur-2xl shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-md">
            <div className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 w-fit">
              <Globe2 className="h-3.5 w-3.5" />
              <span>3D Interactive Topology</span>
            </div>
            <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-white">
              Connected Enterprise Workforce
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Real-time neural map showing cross-departmental collaboration nodes, distributed clusters, and active workforce synchronization. Move your cursor to interact in 3D space.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
              {departmentData.map((dept) => (
                <div key={dept.name} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: dept.color }}
                  />
                  <span>
                    {dept.name} ({dept.count})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Canvas */}
          <div className="w-full lg:w-[480px] h-[220px]">
            <Employee3DCanvas height={220} interactive={true} />
          </div>
        </div>
      </div>

      {/* Analytics Section: Growth Area Chart & Department Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Employee Growth Chart (2 Columns) */}
        <div className="lg:col-span-2 rounded-3xl border border-white/5 dark:border-white/10 bg-slate-900/60 dark:bg-slate-900/70 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-400" />
                  Employee Growth Trend
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Headcount velocity and organization growth trajectory.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{stats?.activeRate ? `${stats.activeRate} Active Rate` : '100% Active'}</span>
              </div>
            </div>

            {/* Area Chart Container */}
            <div className="mt-6 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={growthData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="engGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="#64748B"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={['dataMin - 100', 'dataMax + 100']}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-white/10 bg-slate-950/90 p-3 shadow-2xl backdrop-blur-xl text-xs">
                            <p className="font-bold text-white mb-1.5">{label} 2026</p>
                            <div className="space-y-1">
                              <p className="text-indigo-300 font-medium">
                                Total Employees: <span className="text-white font-bold">{payload[0]?.value}</span>
                              </p>
                              {payload[1] && (
                                <p className="text-sky-300 font-medium">
                                  Engineering: <span className="text-white font-bold">{payload[1]?.value}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="employees"
                    stroke="#6366F1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#growthGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="engineering"
                    stroke="#38BDF8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#engGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <span>Total Workforce</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                <span>Engineering Core</span>
              </span>
            </div>
            <span className="font-mono text-slate-500">Updated: Today</span>
          </div>
        </div>

        {/* Right: Department Distribution Donut Chart */}
        <div className="rounded-3xl border border-white/5 dark:border-white/10 bg-slate-900/60 dark:bg-slate-900/70 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-400" />
              Department Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Workforce allocation across business units.
            </p>

            {/* Donut Chart */}
            <div className="relative mt-4 h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="percentage"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="rgba(8, 11, 17, 0.8)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-white/10 bg-slate-950/90 p-2.5 shadow-xl text-xs backdrop-blur-lg">
                            <p className="font-bold text-white">{data.name}</p>
                            <p className="text-slate-300 font-mono mt-0.5">
                              {data.count} members ({data.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-white">
                  {departmentData.filter((d) => d.count > 0).length || departmentData.length}
                </span>
                <span className="text-[10px] uppercase font-mono text-slate-400">
                  Depts
                </span>
              </div>
            </div>

            {/* Custom Department Legend */}
            <div className="mt-4 space-y-2">
              {departmentData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-200 font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono">{item.count}</span>
                    <span className="text-indigo-400 font-bold font-mono w-10 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recently Added Employees Section */}
      <div className="rounded-3xl border border-white/5 dark:border-white/10 bg-slate-900/60 dark:bg-slate-900/70 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Recently Added Employees
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest talent onboarded to NEXUS digital workplace.
            </p>
          </div>

          <Link
            to="/employees"
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View All Directory</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Recent Employees Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3 font-mono">Employee</th>
                <th className="py-3 px-3 font-mono">Department</th>
                <th className="py-3 px-3 font-mono">Designation</th>
                <th className="py-3 px-3 font-mono">Status</th>
                <th className="py-3 px-3 font-mono">Joined</th>
                <th className="py-3 pr-3 text-right font-mono">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {recentEmployees.map((emp) => {
                const empId = emp._id || emp.id;
                return (
                  <tr
                    key={empId}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                            emp.name
                          )} flex items-center justify-center font-bold text-xs tracking-wider ring-1 ring-white/10 shadow-sm shrink-0`}
                        >
                          {getInitials(emp.name)}
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/employees/${empId}`}
                            className="font-semibold text-white group-hover:text-indigo-300 transition-colors truncate block"
                          >
                            {emp.name}
                          </Link>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {emp.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300 border border-white/10">
                        {emp.department}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-300 text-xs">
                      {emp.designation}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                          emp.status === 'Active'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {emp.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-xs text-slate-400">
                      {new Date(
                        emp.joinDate || emp.createdAt || Date.now()
                      ).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 pr-3 text-right whitespace-nowrap">
                      <Link
                        to={`/employees/${empId}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-slate-950/60 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-indigo-500/30 transition-all"
                      >
                        <Eye className="h-3.5 w-3.5 text-indigo-400" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateEmployee}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
