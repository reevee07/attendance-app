import React from 'react';
import { Sun, Sunrise, Sunset } from 'lucide-react';

const OPTIONS = [
  { value: 'full', label: 'Full Day', icon: Sun },
  { value: 'firstHalf', label: 'First Half', icon: Sunrise },
  { value: 'secondHalf', label: 'Second Half', icon: Sunset },
];

export default function DayTypeSelector({ value, onChange, singleDayOnly }) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map(({ value: optValue, label, icon: Icon }) => {
        const active = value === optValue;
        const disabled = optValue !== 'full' && !singleDayOnly;
        return (
          <button
            key={optValue}
            type="button"
            disabled={disabled}
            onClick={() => onChange(optValue)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition ${
              disabled
                ? 'cursor-not-allowed bg-gray-50 text-gray-300'
                : active
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
}