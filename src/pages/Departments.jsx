import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Cpu,
  UserCheck,
  Briefcase,
  Layers,
  ArrowRight,
  Shield,
} from 'lucide-react';
import api from '../api';
import { getInitials, getAvatarGradient } from '../utils/avatar';

export default function Departments() {
  const [employees, setEmployees] = useState([]);
  const [selectedDept, setSelectedDept] = useState('Engineering');
  const [loading, setLoading] = useState(true);

  const baseDepartments = [
    {
      name: 'Engineering',
      icon: Cpu,
      color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30',
      description: 'Distributed infrastructure, cloud platforms, AI engineering, and frontend web applications.',
    },
    {
      name: 'HR',
      icon: UserCheck,
      color: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30',
      description: 'Global talent acquisition, employee experience, benefits, and leadership development.',
    },
    {
      name: 'Sales',
      icon: Briefcase,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30',
      description: 'Enterprise accounts, global pipeline velocity, customer success, and revenue expansion.',
    },
    {
      name: 'Finance',
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30',
      description: 'Fiscal planning, forecasting, investor relations, and capital allocation.',
    },
    {
      name: 'Marketing',
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
      description: 'Brand campaigns, developer marketing, product growth, and corporate communications.',
    },
  ];

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.getEmployees();
        setEmployees(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Compute dynamic metrics for each department based on live database records
  const dynamicDepartments = useMemo(() => {
    const totalCount = employees.length || 1;

    return baseDepartments.map((dept) => {
      const deptMembers = employees.filter(
        (e) => (e.department || '').toLowerCase() === dept.name.toLowerCase()
      );
      const count = deptMembers.length;
      const share = Math.round((count / totalCount) * 100);

      // Compute total department compensation budget
      const totalSalary = deptMembers.reduce(
        (acc, cur) => acc + Number(cur.salary || 1400000),
        0
      );

      let formattedBudget = '₹0';
      if (totalSalary >= 10000000) {
        formattedBudget = `₹${(totalSalary / 10000000).toFixed(2)} Cr`;
      } else if (totalSalary > 0) {
        formattedBudget = `₹${(totalSalary / 100000).toFixed(1)} L`;
      }

      // Pick senior lead dynamically from members or first member
      let leadMember = deptMembers.find((m) =>
        /lead|principal|vp|manager|director|head/i.test(m.designation || '')
      ) || deptMembers[0];

      const leadName = leadMember ? leadMember.name : 'Unassigned';
      const leadRole = leadMember
        ? leadMember.designation
        : `${dept.name} Lead (Open)`;

      return {
        ...dept,
        count,
        budget: formattedBudget,
        growth: `${share}% of team`,
        lead: leadName,
        leadRole: leadRole,
      };
    });
  }, [employees]);

  const filteredMembers = employees.filter(
    (e) => (e.department || '').toLowerCase() === selectedDept.toLowerCase()
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Building2 className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
          Department Analytics & Structure
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Real-time organizational hierarchy, live headcount, and budgetary calculations across NEXUS.
        </p>
      </div>

      {/* Departments Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {dynamicDepartments.map((dept) => {
          const Icon = dept.icon;
          const isSelected = selectedDept === dept.name;

          return (
            <div
              key={dept.name}
              onClick={() => setSelectedDept(dept.name)}
              className={`cursor-pointer rounded-2xl border p-6 transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/60 dark:bg-slate-900 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20 dark:ring-indigo-500/30'
                  : 'border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-white/20 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border p-2.5 ${dept.color}`}
                >
                  <Icon className="h-full w-full" />
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>{dept.growth}</span>
                </div>
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{dept.name}</h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                {dept.description}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-white/5 pt-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                    Headcount
                  </span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {dept.count} {dept.count === 1 ? 'Member' : 'Members'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                    Annual Payroll
                  </span>
                  <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {dept.budget}
                  </p>
                </div>
              </div>

              {/* Department Lead */}
              <div className="mt-4 flex items-center gap-3 border-t border-slate-100 dark:border-white/5 pt-3">
                <div
                  className={`h-8 w-8 rounded-full bg-gradient-to-br ${getAvatarGradient(
                    dept.lead
                  )} flex items-center justify-center font-bold text-[10px] ring-1 ring-slate-200 dark:ring-white/20 shrink-0 text-white`}
                >
                  {getInitials(dept.lead)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{dept.lead}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{dept.leadRole}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Department Roster */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/70 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>{selectedDept} Team Roster ({filteredMembers.length})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Active members currently assigned to the {selectedDept} department.
            </p>
          </div>

          <Link
            to={`/employees?department=${encodeURIComponent(selectedDept)}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
          >
            <span>Manage in Directory</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Member list */}
        {filteredMembers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            No employees currently assigned to {selectedDept}.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredMembers.map((emp) => (
              <Link
                key={emp._id || emp.id}
                to={`/employees/${emp._id || emp.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-white/5 bg-slate-50 dark:bg-slate-950/50 p-3.5 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:bg-white dark:hover:bg-slate-900/80 shadow-sm transition-all group"
              >
                <div
                  className={`h-10 w-10 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                    emp.name
                  )} flex items-center justify-center font-bold text-xs tracking-wider ring-1 ring-slate-200 dark:ring-white/10 shadow-sm shrink-0 text-white`}
                >
                  {getInitials(emp.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate">
                    {emp.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {emp.designation}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                  {emp.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
