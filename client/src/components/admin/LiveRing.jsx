import React from 'react';

/**
 * A single circular progress ring. `value` fills the ring proportionally
 * against `total` (defaults to just showing a full colored ring if no
 * total is given - used for counts that aren't naturally a percentage).
 */
export default function LiveRing({ label, value, total, color = '#2f4bc4' }) {
  const size = 96;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const percent = total && total > 0 ? Math.min(value / total, 1) : 1;
  const offset = circumference * (1 - percent);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
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
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{value}</span>
        </div>
      </div>
      <p className="text-center text-xs font-medium text-gray-600">{label}</p>
    </div>
  );
}