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
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 2-4 degree tilt
    const rX = ((y - centerY) / centerY) * -3.5;
    const rY = ((x - centerX) / centerX) * 3.5;

    setRotateX(rX);
    setRotateY(rY);
    setMousePos({ x: `${x}px`, y: `${y}px` });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const colorStyles = {
    blue: {
      border: 'hover:border-blue-500/40',
      glow: 'shadow-blue-500/10',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      sparkline: '#3B82F6',
      badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    indigo: {
      border: 'hover:border-indigo-500/40',
      glow: 'shadow-indigo-500/10',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      sparkline: '#6366F1',
      badge: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    violet: {
      border: 'hover:border-violet-500/40',
      glow: 'shadow-violet-500/10',
      iconBg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      sparkline: '#8B5CF6',
      badge: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      glow: 'shadow-emerald-500/10',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      sparkline: '#10B981',
      badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      glow: 'shadow-amber-500/10',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      sparkline: '#F59E0B',
      badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
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
    <div className="card-3d-wrap" onClick={onClick}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${
            isHovered ? 'translateY(-4px) translateZ(6px)' : 'translateY(0) translateZ(0)'
          }`,
        }}
        className={`relative overflow-hidden rounded-2xl border border-white/5 dark:border-white/10 bg-slate-900/60 dark:bg-slate-900/70 p-5 backdrop-blur-xl transition-all duration-200 cursor-pointer shadow-lg ${
          currentTheme.border
        } ${currentTheme.glow}`}
      >
        {/* Dynamic Specular Sheen */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-40 transition-opacity duration-300"
            style={{
              background: `radial-gradient(350px circle at ${mousePos.x} ${mousePos.y}, rgba(255, 255, 255, 0.08), transparent 60%)`,
            }}
          />
        )}

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              {title}
            </p>
            <h3 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {value}
            </h3>
          </div>

          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl border p-2.5 transition-transform duration-300 ${
              currentTheme.iconBg
            } ${isHovered ? 'scale-110 rotate-3' : ''}`}
          >
            {Icon && <Icon className="h-full w-full" />}
          </div>
        </div>

        {/* Bottom sparkline & trend row */}
        <div className="relative z-10 mt-4 flex items-end justify-between border-t border-slate-200/40 dark:border-white/5 pt-3">
          <div className="flex flex-col">
            {trend && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                {trendType === 'positive' ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
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
                opacity={isHovered ? 1 : 0.8}
              />
            </svg>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
