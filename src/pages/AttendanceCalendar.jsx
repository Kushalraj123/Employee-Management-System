import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
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

const pad = (n) => String(n).padStart(2, '0');

export default function AttendanceCalendar() {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [records, setRecords] = useState({});
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [hist, lv] = await Promise.all([api.getMyAttendanceHistory(), api.getMyLeaves()]);
        const map = {};
        (hist.data || []).forEach((r) => { map[r.date] = r.status; });
        setRecords(map);
        setLeaves((lv.data || []).filter((l) => l.status === 'Approved'));
      } catch (e) {
        console.warn('Calendar load error:', e);
      }
    };
    load();
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const todayStr = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
  })();

  // Status for each day, derived from real attendance records and approved leaves
  const getDayInfo = (day) => {
    const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
    const dayOfWeek = (firstDayIndex + day - 1) % 7;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const record = records[dateStr];
    const isLeave = leaves.some((l) => dateStr >= l.startDate && dateStr <= l.endDate);
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;

    let status = null;
    let detail = null;

    if (record) {
      status = record.status || 'Present';
      if (record.workingHours) detail = `${record.workingHours} hrs`;
      else if (record.checkInTime) detail = record.checkInTime;
    } else if (isLeave) {
      status = 'On Leave';
    } else if (isWeekend) {
      status = 'Weekend';
    }

    return { status, detail, isToday, isFuture, isWeekend };
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
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span className="text-slate-300 font-medium">Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
          <span className="text-slate-300 font-medium">Late</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
          <span className="text-slate-300 font-medium">Half Day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
          <span className="text-slate-300 font-medium">On Leave</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-sm shadow-pink-500/50" />
          <span className="text-slate-300 font-medium">Holiday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          <span className="text-slate-400 font-medium">Weekend</span>
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
            <div key={`empty-${i}`} className="min-h-[85px] sm:min-h-[105px] rounded-2xl bg-slate-950/20 border border-transparent" />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const { status, detail, isToday, isFuture, isWeekend } = getDayInfo(day);

            let cellClass = 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700';
            let pillClass = '';

            if (isToday) {
              cellClass = 'bg-indigo-950/30 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40';
            } else if (status === 'Present') {
              cellClass = 'bg-emerald-950/25 border-emerald-500/30 hover:border-emerald-500/50';
              pillClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
            } else if (status === 'Late') {
              cellClass = 'bg-amber-950/25 border-amber-500/30 hover:border-amber-500/50';
              pillClass = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
            } else if (status === 'On Leave') {
              cellClass = 'bg-indigo-950/30 border-indigo-500/30 hover:border-indigo-500/50';
              pillClass = 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
            } else if (status === 'Half Day') {
              cellClass = 'bg-purple-950/25 border-purple-500/30 hover:border-purple-500/50';
              pillClass = 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
            } else if (isWeekend) {
              cellClass = 'bg-slate-950/20 border-slate-800/40 opacity-50';
            }

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[85px] sm:min-h-[105px] p-2.5 rounded-2xl border flex flex-col justify-between transition-all group ${cellClass}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-sm font-bold ${isToday ? 'text-indigo-400' : 'text-slate-200'}`}>
                    {day}
                  </span>
                  {isToday && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500 text-white shadow-sm font-sans uppercase tracking-wider">
                      Today
                    </span>
                  )}
                </div>

                <div className="mt-2 text-left">
                  {status && status !== 'Weekend' && (
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${pillClass}`}>
                      {status}
                    </span>
                  )}
                  {isWeekend && (
                    <span className="text-[10px] text-slate-500 font-medium block">
                      Weekend
                    </span>
                  )}
                  {detail && (
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                      {detail}
                    </span>
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
