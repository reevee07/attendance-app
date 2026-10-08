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
import EmployeeForm from './EmployeeForm.jsx';
import EmployeeProfile from './EmployeeProfile.jsx';
import EmployeeAttendanceCalendar from './EmployeeAttendanceCalendar.jsx';

const sidebarLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-white/85 hover:bg-white/10'
  }`;

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    leaveService
      .listPendingLeaves()
      .then((leaves) => setPendingCount(leaves.length))
      .catch(() => { });
  }, []);

  return (
<div className=" min-h-screen bg-gray-50" style={{ zoom: 0.8 }}>    
    {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-hidden bg-[#0D347D] px-3">

        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -bottom-28 -left-24 h-64 w-[430px] rotate-[-12deg] rounded-[50%] bg-blue-950/30" />

          <div className="absolute -bottom-4 -left-20 h-24 w-[430px] rotate-[-3deg] rounded-[50%] border-t border-blue-400/20" />

          <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        {/* Sidebar content */}
        <div className="relative z-10 flex h-full flex-col">

          {/* Logo */}
          <div className="px-8 pt-6">
            <img
              src={LOGO_PNG}
              alt="Logo"
              className="h-15 w-auto object-contain object-left"
            />
          </div>

          {/* MAIN */}
          <div className="mt-20 ">
            <p className="mb-3 px-5 text-[10px] mt-8 font-medium tracking-wide text-white/70">
              MAIN
            </p>

            <nav className="space-y-1">

              <NavLink
                to="/admin"
                end
                className={sidebarLinkClass}
              >
                <LayoutDashboard size={16} strokeWidth={2} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/admin/attendance"
                className={sidebarLinkClass}
              >
                <Clock size={16} strokeWidth={2} />
                <span>Attendance</span>
              </NavLink>

              <NavLink
                to="/admin/employees"
                className={sidebarLinkClass}
              >
                <Users size={16} strokeWidth={2} />
                <span>Employees</span>
              </NavLink>

            </nav>
          </div>

          {/* ADMIN */}
          <div className="mt-7">
            <p className="mb-3 px-5 text-[10px] font-medium tracking-wide text-white/70">
              ADMIN
            </p>

            <nav>
              <NavLink
                to="/admin/leave-allocation"
                className={sidebarLinkClass}
              >
                <CalendarCheck size={16} strokeWidth={2} />
                <span>Leave</span>
              </NavLink>
            </nav>
          </div>

          {/* Bottom branding */}
          <div className="mt-auto mb-0 flex flex-col items-center pb-40">

            {/* People illustration */}
            <div className="relative mb-2 h-[68px] w-[100px]">

              {/* Left person */}
              <div className="absolute bottom-1 left-4 flex flex-col items-center">
                <div className="h-[13px] w-[13px] rounded-full bg-blue-400" />
                <div className="mt-1 h-[19px] w-[23px] rounded-t-[16px] bg-blue-400/90" />
              </div>

              {/* Center person */}
              <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-col items-center">
                <div className="h-[19px] w-[19px] rounded-full bg-blue-400" />
                <div className="mt-1 h-[39px] w-[33px] rounded-t-[19px] bg-blue-400" />
              </div>

              {/* Right person */}
              <div className="absolute bottom-1 right-4 flex flex-col items-center">
                <div className="h-[13px] w-[13px] rounded-full bg-blue-400" />
                <div className="mt-1 h-[19px] w-[23px] rounded-t-[16px] bg-blue-400/90" />
              </div>

            </div>

            {/* Text */}
            <p className="text-center text-[10px] font-medium leading-[12px] text-white">
              Better People
              <br />
              Stronger Teams
            </p>

          </div>

        </div>
      </aside>
      {/* Main content */}
      <div className="ml-64 min-h-screen">
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
            <Route path="employees/new" element={<EmployeeForm />} />
            <Route path="employees/:id" element={<EmployeeProfile />} />
            <Route path="employees/:id/edit" element={<EmployeeForm />} />
            <Route path="leave-allocation" element={<LeaveAllocation />} />
            <Route path="attendance/:employeeId" element={<EmployeeAttendanceCalendar />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
            
          </Routes>
        </main>
      </div>
    </div>
  );
}