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

export default function LeaveTypeDropdown({ value, onChange }) {
  return (
    <select
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-full border border-gray-300 px-3 py-2 text-sm"
    >
      <option value="" disabled>
        Reason
      </option>
      {LEAVE_TYPES.map((type) => (
        <option key={type.value} value={type.value}>
          {type.label}
        </option>
      ))}
    </select>
  );
}