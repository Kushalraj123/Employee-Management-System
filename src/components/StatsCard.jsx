import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'positive',
  sparkline = [40, 45, 50, 48, 60, 58, 65, 70, 75, 80],
  accentColor = 'blue', // 'blue', 'indigo', 'violet', 'emerald', 'amber'
  onClick,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const colorStyles = {
    blue: {
      border: 'hover:border-blue-400 dark:hover:border-blue-500/40',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
      sparkline: '#3B82F6',
    },
    indigo: {
      border: 'hover:border-indigo-400 dark:hover:border-indigo-500/40',
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
      sparkline: '#6366F1',
    },
    violet: {
      border: 'hover:border-purple-400 dark:hover:border-purple-500/40',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20',
      sparkline: '#8B5CF6',
    },
    emerald: {
      border: 'hover:border-emerald-400 dark:hover:border-emerald-500/40',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      sparkline: '#10B981',
    },
    amber: {
      border: 'hover:border-amber-400 dark:hover:border-amber-500/40',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
      sparkline: '#F59E0B',
    },
  };

  const currentTheme = colorStyles[accentColor] || colorStyles.blue;

  // Generate SVG path for mini sparkline
  const minVal = Math.min(...sparkline);
  const maxVal = Math.max(...sparkline) || 1;
  const range = maxVal - minVal || 1;
  const svgWidth = 84;
  const svgHeight = 28;

  const points = sparkline
    .map((val, idx) => {
      const x = (idx / (sparkline.length - 1)) * svgWidth;
      const y = svgHeight - ((val - minVal) / range) * (svgHeight - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/70 p-5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md dark:shadow-lg ${currentTheme.border}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            {title}
          </p>
          <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border p-2.5 transition-transform duration-200 ${
            currentTheme.iconBg
          } ${isHovered ? 'scale-105' : ''}`}
        >
          {Icon && <Icon className="h-full w-full" />}
        </div>
      </div>

      {/* Bottom sparkline & trend row */}
      <div className="mt-4 flex items-end justify-between border-t border-slate-100 dark:border-white/5 pt-3">
        <div className="flex flex-col">
          {trend && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {trendType === 'positive' ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
              )}
              <span>{trend}</span>
            </span>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </span>
        </div>

        {/* Mini Sparkline Chart */}
        <div className="shrink-0">
          <svg
            width={svgWidth}
            height={svgHeight}
            className="overflow-visible"
            aria-hidden="true"
          >
            <polyline
              fill="none"
              stroke={currentTheme.sparkline}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
              opacity={isHovered ? 1 : 0.85}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
