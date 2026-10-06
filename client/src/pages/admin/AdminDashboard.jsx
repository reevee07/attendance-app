import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardHome from './DashboardHome.jsx';
import AttendanceReports from './AttendanceReports.jsx';
import EmployeeManagement from './EmployeeManagement.jsx';
import LeaveAllocation from './LeaveAllocation.jsx';
import { LOGO_PNG } from '../../config/constants.js';
import * as leaveService from '../../services/leaveService';
import { LayoutDashboard, Clock, Users, CalendarCheck, Search, Bell, LogOut } from 'lucide-react';

const sidebarLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-white/85 hover:bg-white/10'
  }`;

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    leaveService
      .listPendingLeaves()
      .then((leaves) => setPendingCount(leaves.length))
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col gap-6 bg-gradient-to-b from-blue-600 to-blue-800 px-4 py-6">
        <img src={LOGO_PNG} alt="Logo" className="h-9 w-auto object-contain" />

        <div>
          <p className="mb-2 mt-20 px-3 text-xs font-semibold tracking-wide text-white/60">MAIN</p>
          <nav className="space-y-1">
            <NavLink to="/admin" end className={sidebarLinkClass}>
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
            <NavLink to="/admin/attendance" className={sidebarLinkClass}>
              <Clock size={18} />
              Attendance
            </NavLink>
            <NavLink to="/admin/employees" className={sidebarLinkClass}>
              <Users size={18} />
              Employees
            </NavLink>
          </nav>
        </div>

        <div>
          <p className="mb-2 px-3 text-xs font-semibold tracking-wide text-white/60">ADMIN</p>
          <nav className="space-y-1">
            <NavLink to="/admin/leave-allocation" className={sidebarLinkClass}>
              <CalendarCheck size={18} />
              Leave
            </NavLink>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-3">
          <div className="flex max-w-sm flex-1 items-center gap-2 rounded-full bg-gray-100 px-4 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              placeholder="Search..."
              className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button type="button" className="rounded-full bg-gray-100 p-2.5 text-gray-500 hover:bg-gray-200">
                <Bell size={18} />
              </button>
              {pendingCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={logout}
              title={`Logout (${user.name})`}
              className="rounded-full bg-red-500 p-2.5 text-white hover:bg-red-600"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-6">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="attendance" element={<AttendanceReports />} />
            <Route path="employees" element={<EmployeeManagement />} />
            <Route path="leave-allocation" element={<LeaveAllocation />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}