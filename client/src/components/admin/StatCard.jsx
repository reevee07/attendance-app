import React from 'react';

// Full class names are written out (not built dynamically) so Tailwind can detect them.
const THEMES = {
  green:  { card: 'border-green-200 from-green-50',   iconBg: 'bg-green-100',  iconText: 'text-green-600',  bar: 'bg-green-500',  hex: '#16a34a', pct: 'text-green-600' },
  orange: { card: 'border-orange-200 from-orange-50', iconBg: 'bg-orange-100', iconText: 'text-orange-600', bar: 'bg-orange-500', hex: '#ea580c', pct: 'text-orange-600' },
  blue:   { card: 'border-blue-200 from-blue-50',     iconBg: 'bg-blue-100',   iconText: 'text-blue-600',   bar: 'bg-blue-600',   hex: '#2563eb', pct: 'text-blue-600' },
  purple: { card: 'border-purple-200 from-purple-50', iconBg: 'bg-purple-100', iconText: 'text-purple-600', bar: 'bg-purple-500', hex: '#9333ea', pct: 'text-purple-600' },
  cyan:   { card: 'border-cyan-200 from-cyan-50',     iconBg: 'bg-cyan-100',   iconText: 'text-cyan-600',   bar: 'bg-cyan-500',   hex: '#0891b2', pct: 'text-cyan-600' },
  pink:   { card: 'border-pink-200 from-pink-50',     iconBg: 'bg-pink-100',   iconText: 'text-pink-600',   bar: 'bg-pink-500',   hex: '#db2777', pct: 'text-pink-600' },
};

function Donut({ percent, hex, pctClass, size, stroke, compact }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={hex}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${compact ? 'text-sm' : 'text-lg'} font-bold ${pctClass}`}>{percent}%</span>
        <span className={`${compact ? 'text-[9px]' : 'text-[10px]'} text-gray-400`}>of total</span>
      </div>
    </div>
  );
}

export default function StatCard({ label, value, total, theme = 'blue', icon: Icon, compact = false }) {
  const t = THEMES[theme];
  const percent = total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0;

  return (
    <div className={`rounded-2xl border bg-gradient-to-br to-white shadow-sm ${compact ? 'p-3' : 'p-4'} ${t.card}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div
            className={`flex items-center justify-center rounded-full ${compact ? 'h-9 w-9' : 'h-11 w-11'} ${t.iconBg} ${t.iconText}`}
          >
            {Icon && <Icon size={compact ? 18 : 22} />}
          </div>
          <p className={`font-bold text-slate-900 ${compact ? 'mt-2 text-3xl' : 'mt-3 text-4xl'}`}>{value}</p>
          <p
            className={`font-semibold text-slate-800 ${
              compact ? 'mt-0.5 text-xs leading-tight' : 'mt-1 truncate text-sm'
            }`}
          >
            {label}
          </p>
        </div>
        <Donut
          percent={percent}
          hex={t.hex}
          pctClass={t.pct}
          size={compact ? 68 : 96}
          stroke={compact ? 8 : 10}
          compact={compact}
        />
      </div>

      <div className={`h-1.5 w-full rounded-full bg-gray-200/70 ${compact ? 'mt-3' : 'mt-4'}`}>
        <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}