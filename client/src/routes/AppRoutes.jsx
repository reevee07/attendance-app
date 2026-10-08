import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from './ProtectedRoute.jsx';

import LoginPage from '../pages/auth/LoginPage.jsx';
import ChangePassword from '../pages/auth/ChangePassword.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import UserDashboard from '../pages/user/UserDashboard.jsx';

// Where a logged-in user should land
function homePath(user) {
  if (!user) return '/login';
  if (user.mustChangePassword) return '/change-password';
  return user.role === 'admin' ? '/admin' : '/user';
}

export default function AppRoutes() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={homePath(user)} replace /> : <LoginPage />}
      />

      <Route
        path="/change-password"
        element={
          loading ? null
          : !user ? <Navigate to="/login" replace />
          : !user.mustChangePassword ? <Navigate to={homePath(user)} replace />
          : <ChangePassword />
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/*"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to={homePath(user)} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}