import React from 'react';
import { Sun, Sunrise, Sunset } from 'lucide-react';

const OPTIONS = [
  { value: 'full', label: 'Full Day', icon: Sun },
  { value: 'firstHalf', label: 'First Half', icon: Sunrise },
  { value: 'secondHalf', label: 'Second Half', icon: Sunset },
];

/**
 * Part 8: exactly 3 mutually-exclusive pill buttons. The parent owns
 * the selected value (controlled component) - defaults to 'full'
 * wherever it's first used in LeavePage.
 */
export default function DayTypeSelector({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {OPTIONS.map(({ value: optValue, label, icon: Icon }) => {
        const active = value === optValue;
        return (
          <button
            key={optValue}
            type="button"
            onClick={() => onChange(optValue)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-xs font-medium transition ${
              active ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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