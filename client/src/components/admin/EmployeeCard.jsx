import React from 'react';
import Button from '../common/Button.jsx';

export default function EmployeeCard({ employee, onPunchClick, onEditClick }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{employee.name}</p>
        <p className="text-xs text-gray-500">{employee.email}</p>
        {employee.employeeCode && (
          <p className="text-xs text-gray-400">Code: {employee.employeeCode}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => onEditClick(employee)}>
          Edit
        </Button>
        <Button onClick={() => onPunchClick(employee)}>Punch for employee</Button>
      </div>
    </div>
  );
}
