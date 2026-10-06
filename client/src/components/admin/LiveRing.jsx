import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function LiveRing({
  label,
  value,
  total,
  Icon,
  color = '#2f4bc4',
  track = '#e5e7eb',
  bg = 'bg-white',
  border = 'border-gray-200',
}) {
  const size = 96;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const percent = total && total > 0 ? Math.min(Math.round((value / total) * 100), 100) : 0;
  const offset = circumference * (1 - percent / 100);

  return (
    <button
      type="button"
      className={`flex w-full min-w-0 flex-col gap-3 rounded-2xl border px-3 py-4 text-left transition hover:shadow-md ${bg} ${border}`}
    >
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={strokeWidth} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5" style={{ color }}>
          {Icon && <Icon size={24} strokeWidth={2} />}
          <span className="text-xs font-semibold">{percent}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1">
        <p className="truncate text-xs font-semibold text-blue-900">{label}</p>
        <ChevronRight size={14} className="shrink-0" style={{ color }} />
      </div>
    </button>
  );
}