import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button.jsx';
import DashboardHome from './DashboardHome.jsx';
import AttendanceReports from './AttendanceReports.jsx';
import EmployeeManagement from './EmployeeManagement.jsx';
import { LOGO_PNG } from '../../config/constants.js';
import { LayoutDashboard, Users, Briefcase, LogOut } from 'lucide-react';

const navLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
    isActive ? 'bg-blue-900 text-white' : 'text-black hover:bg-blue-900 hover:text-white'
  }`;

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-200">
      <header className="border-b border-gray-200 bg-gradient-to-b from-blue-400 to-blue-300 px-6 py-3 shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_PNG} alt="Logo" className="h-9 w-auto object-contain" />
          
          </div>

          <nav className="flex items-center gap-2">
            <NavLink to="/admin" end className={navLinkClass}>
            <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
            <NavLink to="/admin/attendance" className={navLinkClass}>
            <Users size={18} />
              Attendance
            </NavLink>
            <NavLink to="/admin/employees" className={navLinkClass}>
            <Briefcase size={18} />
              Employees
            </NavLink>
          </nav>
          

    
          <Button variant="danger" onClick={logout}>
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-8 pb-10">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="attendance" element={<AttendanceReports />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}