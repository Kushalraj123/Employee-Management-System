import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';

export default function AttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // October 2026

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Mock sample calendar statuses for display
  const getStatusForDay = (day) => {
    const dayOfWeek = (firstDayIndex + day - 1) % 7;
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'Weekend';
    if (day === 2) return 'Holiday'; // Gandhi Jayanti
    if (day === 8) return 'Late';
    if (day === 11) return 'Present';
    if (day === 15 || day === 16) return 'On Leave';
    if (day === 20 || day === 21 || day === 22) return 'On Leave';
    if (day > 11) return 'Upcoming';
    if (day === 5) return 'Half Day';
    return 'Present';
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/attendance" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Time Tracker
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Monthly Attendance & Shift Calendar
          </h1>
          <p className="text-sm text-slate-400">
            Visual status breakdown across shifts, holidays, approved leaves, and weekends.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-white text-sm min-w-[140px] text-center font-mono">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-slate-300">Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-slate-300">Late</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-purple-500" />
          <span className="text-slate-300">Half Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-indigo-500" />
          <span className="text-slate-300">On Leave</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-pink-500" />
          <span className="text-slate-300">Holiday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-700" />
          <span className="text-slate-400">Weekend</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-700/60 shadow-xl bg-slate-900/80">
        <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center mb-4 font-bold text-xs uppercase tracking-wider text-slate-400">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {/* Empty placeholders before first day */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[85px] rounded-2xl bg-slate-950/20 border border-transparent" />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const status = getStatusForDay(day);

            let badgeClass = 'bg-slate-950/60 border-slate-800 text-slate-300';
            let pillClass = 'bg-slate-800 text-slate-400';

            if (status === 'Present') {
              badgeClass = 'bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-500/60';
              pillClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
            } else if (status === 'Late') {
              badgeClass = 'bg-amber-950/30 border-amber-500/30 hover:border-amber-500/60';
              pillClass = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
            } else if (status === 'On Leave') {
              badgeClass = 'bg-indigo-950/30 border-indigo-500/30 hover:border-indigo-500/60';
              pillClass = 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40';
            } else if (status === 'Holiday') {
              badgeClass = 'bg-pink-950/30 border-pink-500/30 hover:border-pink-500/60';
              pillClass = 'bg-pink-500/20 text-pink-300 border border-pink-500/40';
            } else if (status === 'Half Day') {
              badgeClass = 'bg-purple-950/30 border-purple-500/30 hover:border-purple-500/60';
              pillClass = 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
            } else if (status === 'Weekend') {
              badgeClass = 'bg-slate-950/40 border-slate-800/80 opacity-60';
              pillClass = 'bg-slate-800/60 text-slate-400';
            }

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[85px] sm:min-h-[105px] p-2.5 rounded-2xl border flex flex-col justify-between transition-all group ${badgeClass}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white font-mono">{day}</span>
                  {day === 11 && (
                    <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                  )}
                </div>

                <div className="mt-2 text-left">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${pillClass}`}>
                    {status}
                  </span>
                  {status === 'Present' && (
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">8.5 hrs</span>
                  )}
                  {status === 'Late' && (
                    <span className="text-[10px] text-amber-400 block mt-1 font-mono">09:35 AM</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
