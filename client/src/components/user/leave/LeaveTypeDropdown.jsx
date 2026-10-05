import React from 'react';

// Part 9: exactly these 6 - deliberately excludes Total Leave Balance
// and Leave History, which are informational only, not requestable types.
export const LEAVE_TYPES = [
  { value: 'casualLeave', label: 'Casual Leave' },
  { value: 'sickLeave', label: 'Sick Leave' },
  { value: 'earnLeave', label: 'Earn Leave' },
  { value: 'specialLeave', label: 'Special Leave' },
  { value: 'leaveWithoutPay', label: 'Leave Without Pay' },
  { value: 'compOff', label: 'Comp Off' },
];

// Part 4: Leave Without Pay has no real balance, so it's never disabled
// even though its displayed "available" is always 0.
const NEVER_DISABLE = ['leaveWithoutPay'];

export default function LeaveTypeDropdown({ value, onChange, balance }) {
  return (
    <select
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-full border border-gray-300 px-3 py-2 text-sm"
    >
      <option value="" disabled>
        Select Leave Type
      </option>
      {LEAVE_TYPES.map((type) => {
        const available = balance?.[type.value]?.available ?? 0;
        const disabled = !NEVER_DISABLE.includes(type.value) && available <= 0;
        return (
          <option key={type.value} value={type.value} disabled={disabled}>
            {type.label}
            {disabled ? ' (no balance)' : ''}
          </option>
        );
      })}
    </select>
  );
}