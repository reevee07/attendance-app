import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from '../../components/user/BottomNav.jsx';
import HomePage from './HomePage.jsx';
import AttendancePage from './AttendancePage.jsx';
import LeavePage from './LeavePage.jsx';
import ProfilePage from './ProfilePage.jsx';


export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leave" element={<LeavePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/user" replace />} />
      </Routes>

      <BottomNav />
    </div>
  );
}