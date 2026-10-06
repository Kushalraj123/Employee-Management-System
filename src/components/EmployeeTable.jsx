import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Edit2,
  Trash2,
  Mail,
  Calendar,
  MoreHorizontal,
  Sparkles,
  Shield,
  Phone,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getInitials, getAvatarGradient } from '../utils/avatar';

export default function EmployeeTable({
  employees = [],
  selectedIds = [],
  setSelectedIds,
  onView,
  onEdit,
  onDelete,
}) {
  const departmentColors = {
    Engineering: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    HR: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Sales: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Finance: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Marketing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const statusColors = {
    Active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'On Leave': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Inactive: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  const isAllSelected =
    employees.length > 0 && selectedIds.length === employees.length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(employees.map((emp) => emp._id || emp.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/5 dark:border-white/10 bg-slate-900/60 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-slate-950/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-4 pl-6 pr-3 w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-white/20 bg-slate-900 text-indigo-600 focus:ring-indigo-500/20 focus:ring-offset-0 cursor-pointer"
                />
              </th>
              <th className="py-4 px-4 font-mono">Employee</th>
              <th className="py-4 px-4 font-mono">Department</th>
              <th className="py-4 px-4 font-mono">Designation</th>
              <th className="py-4 px-4 font-mono">Status</th>
              <th className="py-4 px-4 font-mono">Joined</th>
              <th className="py-4 pr-6 pl-4 text-right font-mono">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {employees.map((emp, idx) => {
              const empId = emp._id || emp.id;
              const isSelected = selectedIds.includes(empId);
              const deptStyle =
                departmentColors[emp.department] ||
                'bg-slate-500/10 text-slate-300 border-slate-500/20';
              const stStyle =
                statusColors[emp.status] ||
                'bg-slate-500/10 text-slate-300 border-slate-500/20';

              return (
                <motion.tr
                  key={empId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className={`group transition-colors duration-150 ${
                    isSelected
                      ? 'bg-indigo-950/30'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-4 pl-6 pr-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectOne(empId)}
                      className="h-4 w-4 rounded border-white/20 bg-slate-900 text-indigo-600 focus:ring-indigo-500/20 focus:ring-offset-0 cursor-pointer"
                    />
                  </td>

                  {/* Employee Info */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        <div
                          className={`h-10 w-10 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                            emp.name
                          )} flex items-center justify-center font-bold text-xs tracking-wider shadow-md ring-2 ring-white/10 group-hover:ring-indigo-500/40 transition-all`}
                        >
                          {getInitials(emp.name)}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-slate-900 ${
                            emp.status === 'Active'
                              ? 'bg-emerald-400'
                              : emp.status === 'On Leave'
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/employees/${empId}`}
                          className="font-semibold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5"
                        >
                          <span className="truncate">{emp.name}</span>
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="font-mono text-[10px] text-slate-500">
                            ID: {empId.substring(0, 8)}
                          </span>
                          <span>•</span>
                          <span className="truncate">{emp.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Department Badge */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border ${deptStyle}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {emp.department}
                    </span>
                  </td>

                  {/* Designation */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="text-slate-300 font-medium">
                      {emp.designation}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${stStyle}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {emp.status || 'Active'}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-400">
                    {new Date(emp.joinDate || emp.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>

                  {/* Actions Column */}
                  <td className="py-4 pr-6 pl-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/employees/${empId}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/20 transition-all"
                        title="View Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      <button
                        onClick={() => onEdit && onEdit(emp)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-slate-900/60 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/40 hover:bg-indigo-500/20 transition-all"
                        title="Edit Employee"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onDelete && onDelete(emp)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-slate-900/60 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/20 transition-all"
                        title="Delete Employee"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
