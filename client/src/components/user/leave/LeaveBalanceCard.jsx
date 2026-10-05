import React from 'react';
export default function LeaveBalanceCard({ icon: Icon, label, value, max, tint, iconColor }) {
  return (
    <button
      type="button"
      className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-left ${tint}`}
    >
      <div className="flex items-center gap-2">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white ${iconColor}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-nowrap text-xs font-medium text-gray-600">{label}</p>
          <p className="text-lg font-bold text-gray-900">
            {value}
            {max !== undefined && <span className="text-sm font-normal text-gray-400"> / {max}</span>}
          </p>
        </div>
      </div>
    </button>
  );
}