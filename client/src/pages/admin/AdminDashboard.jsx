import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button.jsx';
import AttendanceReports from './AttendanceReports.jsx';
import EmployeeManagement from './EmployeeManagement.jsx';

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
  }`;

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-500">{user.name}</p>
          </div>
          <Button variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <nav className="mx-auto flex max-w-5xl gap-2 px-6 py-4">
        <NavLink to="/admin" end className={navLinkClass}>
          Attendance
        </NavLink>
        <NavLink to="/admin/employees" className={navLinkClass}>
          Employees
        </NavLink>
      </nav>

      <main className="mx-auto max-w-5xl px-6 pb-10">
        <Routes>
          <Route index element={<AttendanceReports />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
