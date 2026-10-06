import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Sparkles,
  Award,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getInitials, getAvatarGradient } from '../utils/avatar';

export default function EmployeeCard({ employee, onEdit, onDelete }) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });
  const [isHovered, setIsHovered] = useState(false);

  const empId = employee._id || employee.id;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -3.5;
    const rY = ((x - centerX) / centerX) * 3.5;

    setRotateX(rX);
    setRotateY(rY);
    setMousePos({ x: `${x}px`, y: `${y}px` });
  };

  const departmentStyles = {
    Engineering: 'border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10',
    HR: 'border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10',
    Sales: 'border-cyan-200 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10',
    Finance: 'border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
    Marketing: 'border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
  };

  const statusStyles = {
    Active: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
    'On Leave': 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
    Inactive: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30',
  };

  const deptClass =
    departmentStyles[employee.department] ||
    'border-slate-200 dark:border-slate-500/30 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-500/10';
  const statusClass =
    statusStyles[employee.status] ||
    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30';

  return (
    <div className="card-3d-wrap h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setRotateX(0);
          setRotateY(0);
        }}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${
            isHovered
              ? 'translateY(-6px) translateZ(8px)'
              : 'translateY(0) translateZ(0)'
          }`,
        }}
        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/70 p-5 backdrop-blur-xl transition-all duration-200 shadow-sm hover:shadow-md dark:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500/30"
      >
        {/* Specular Sheen Reflection */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-30 transition-opacity duration-300"
            style={{
              background: `radial-gradient(400px circle at ${mousePos.x} ${mousePos.y}, rgba(99, 102, 241, 0.08), transparent 60%)`,
            }}
          />
        )}

        <div className="relative z-10">
          {/* Top Row: Department and Status Badges */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${deptClass}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {employee.department}
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${statusClass}`}
            >
              {employee.status || 'Active'}
            </span>
          </div>

          {/* Large Avatar & Name */}
          <div className="mt-5 flex items-center gap-4">
            <div className="relative shrink-0">
              <div
                className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${getAvatarGradient(
                  employee.name
                )} flex items-center justify-center font-bold text-base tracking-wider ring-2 ring-slate-200 dark:ring-white/10 group-hover:ring-indigo-500/40 transition-all shadow-md`}
              >
                {getInitials(employee.name)}
              </div>
              {employee.performanceScore && (
                <div
                  className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow"
                  title={`Score: ${employee.performanceScore}`}
                >
                  ★
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <Link
                to={`/employees/${empId}`}
                className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate block"
              >
                {employee.name}
              </Link>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate mt-0.5">
                {employee.designation}
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                ID: {empId.substring(0, 8)}
              </p>
            </div>
          </div>

          {/* Quick Info & Skills */}
          <div className="mt-4 space-y-1.5 border-t border-slate-100 dark:border-white/5 pt-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 truncate">
              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{employee.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>
                Joined{' '}
                {new Date(
                  employee.joinDate || employee.createdAt || Date.now()
                ).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Mini Skills Chips */}
          {employee.skills && employee.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {employee.skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-slate-100 dark:bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5"
                >
                  {skill}
                </span>
              ))}
              {employee.skills.length > 3 && (
                <span className="rounded-md bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                  +{employee.skills.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Actions Footer */}
        <div className="relative z-10 mt-5 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3">
          <Link
            to={`/employees/${empId}`}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 shadow-sm transition-all"
          >
            <Eye className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            Profile
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit && onEdit(employee)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 shadow-sm transition-all"
              title="Edit Profile"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete && onDelete(employee)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/20 shadow-sm transition-all"
              title="Delete Profile"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
