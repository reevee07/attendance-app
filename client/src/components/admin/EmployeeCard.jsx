import React from 'react';
import Button from '../common/Button.jsx';

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function EmployeeCard({ employee, onPunchClick, onEditClick }) {
  return (
    <div className="flex items-center justify-between rounded-full border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-4">
        {employee.photoUrl ? (
          <img
            src={employee.photoUrl}
            alt={employee.name}
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            {getInitials(employee.name)}
          </div>
        )}

        {/* Column 1: name + designation - fixed width */}
        <div className="w-44 shrink-0">
          <p className="truncate text-sm font-medium text-gray-900">{employee.name}</p>
          {employee.designation && (
            <p className="truncate text-xs text-gray-500">{employee.designation}</p>
          )}
        </div>

        {/* Column 2: email + contact - fixed width */}
        <div className="w-56 shrink-0">
          <p className="truncate text-xs text-gray-500">{employee.email}</p>
          {employee.contactNumber && (
            <p className="truncate text-xs text-gray-400">{employee.contactNumber}</p>
          )}
        </div>

        {/* Column 3: code - fixed width */}
        <div className="w-24 shrink-0">
          {employee.employeeCode && (
            <p className="truncate text-xs text-gray-400">Code: {employee.employeeCode}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button variant="secondary" onClick={() => onEditClick(employee)}>
          Edit
        </Button>
        <Button onClick={() => onPunchClick(employee)}>Punch for employee</Button>
      </div>
    </div>
  );
}