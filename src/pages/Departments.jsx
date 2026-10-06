import React, { useState, useEffect } from 'react';
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

  const departmentsInfo = [
    {
      name: 'Engineering',
      lead: 'Elena Rostova',
      leadRole: 'Principal Architect & VP Tech',
      leadAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      count: 428,
      budget: '₹48.5 Cr',
      growth: '+18.4%',
      icon: Cpu,
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400',
      description: 'Distributed infrastructure, cloud platforms, AI engineering, and frontend web applications.',
    },
    {
      name: 'HR',
      lead: 'Sarah Chen',
      leadRole: 'Chief People Officer',
      leadAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      count: 86,
      budget: '₹8.2 Cr',
      growth: '+6.2%',
      icon: UserCheck,
      color: 'from-purple-500/20 to-violet-500/10 border-purple-500/30 text-purple-400',
      description: 'Global talent acquisition, employee experience, benefits, and leadership development.',
    },
    {
      name: 'Sales',
      lead: 'Devon Wright',
      leadRole: 'VP Enterprise Sales',
      leadAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      count: 312,
      budget: '₹22.0 Cr',
      growth: '+14.1%',
      icon: Briefcase,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
      description: 'Enterprise accounts, global pipeline velocity, customer success, and revenue expansion.',
    },
    {
      name: 'Finance',
      lead: 'Amina Al-Mansoor',
      leadRole: 'Director of Strategic Finance',
      leadAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      count: 184,
      budget: '₹12.8 Cr',
      growth: '+9.5%',
      icon: DollarSign,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      description: 'Fiscal planning, forecasting, investor relations, and capital allocation.',
    },
    {
      name: 'Marketing',
      lead: 'Liam Gallagher',
      leadRole: 'Head of Brand & Growth',
      leadAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      count: 238,
      budget: '₹16.4 Cr',
      growth: '+11.8%',
      icon: TrendingUp,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
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

  const filteredMembers = employees.filter(
    (e) => e.department.toLowerCase() === selectedDept.toLowerCase()
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <Building2 className="h-7 w-7 text-indigo-400" />
          Department Analytics & Structure
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Organizational hierarchy, budgetary allocations, and business unit leadership across NEXUS.
        </p>
      </div>

      {/* Departments Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departmentsInfo.map((dept) => {
          const Icon = dept.icon;
          const isSelected = selectedDept === dept.name;

          return (
            <div
              key={dept.name}
              onClick={() => setSelectedDept(dept.name)}
              className={`group cursor-pointer rounded-3xl border p-6 backdrop-blur-xl transition-all duration-300 relative overflow-hidden ${
                isSelected
                  ? 'border-indigo-500 bg-gradient-to-br from-indigo-950/60 to-slate-900/90 shadow-2xl shadow-indigo-950/50 scale-[1.02]'
                  : 'border-white/5 bg-slate-900/60 hover:border-white/20 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br p-2.5 ${dept.color}`}
                >
                  <Icon className="h-full w-full" />
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>{dept.growth}</span>
                </div>
              </div>

              <h3 className="mt-4 text-xl font-bold text-white">{dept.name}</h3>
              <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                {dept.description}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Headcount
                  </span>
                  <p className="text-base font-bold text-white mt-0.5">
                    {dept.count} Members
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Annual Budget
                  </span>
                  <p className="text-base font-bold text-indigo-300 mt-0.5">
                    {dept.budget}
                  </p>
                </div>
              </div>

              {/* Department Lead */}
              <div className="mt-4 flex items-center gap-3 border-t border-white/5 pt-3">
                <div
                  className={`h-8 w-8 rounded-full bg-gradient-to-br ${getAvatarGradient(
                    dept.lead
                  )} flex items-center justify-center font-bold text-[10px] ring-1 ring-white/20 shrink-0`}
                >
                  {getInitials(dept.lead)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{dept.lead}</p>
                  <p className="text-[10px] text-slate-400 truncate">{dept.leadRole}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Department Roster */}
      <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <span>{selectedDept} Team Roster</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Active members currently assigned to the {selectedDept} department.
            </p>
          </div>

          <Link
            to={`/employees?department=${encodeURIComponent(selectedDept)}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <span>Manage All in Directory</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Member list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredMembers.map((emp) => (
            <Link
              key={emp._id || emp.id}
              to={`/employees/${emp._id || emp.id}`}
              className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-950/50 p-3.5 hover:border-indigo-500/30 hover:bg-slate-900/80 transition-all group"
            >
              <div
                className={`h-10 w-10 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                  emp.name
                )} flex items-center justify-center font-bold text-xs tracking-wider ring-1 ring-white/10 shadow-sm shrink-0`}
              >
                {getInitials(emp.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                  {emp.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {emp.designation}
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {emp.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
