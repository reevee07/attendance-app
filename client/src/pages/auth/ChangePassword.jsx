import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';

import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth';
import * as authService from '../../services/authService';
import { LOGO_PNG } from '../../config/constants.js';

const inputCls =
  'w-full rounded-xl border border-blue-100 bg-white px-4 py-3 pr-11 text-sm text-[#12356F] outline-none transition placeholder:text-[#7391BD] focus:border-blue-300 focus:ring-2 focus:ring-blue-100';

function PasswordInput({ label, value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#12356F]">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className={inputCls}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700"
          tabIndex={-1}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePassword() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) return setError('New password must be at least 8 characters');
    if (newPassword !== confirmPassword) return setError('New passwords do not match');
    if (newPassword === currentPassword) return setError('New password must be different from the temporary one');

    setSubmitting(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      logout();
      navigate('/login', {
        replace: true,
        state: { message: 'Password updated. Please sign in with your new password.' },
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          {LOGO_PNG && <img src={LOGO_PNG} alt="Logo" className="mx-auto mb-4 h-10 w-auto" />}
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Lock size={22} />
          </div>
          <h1 className="text-xl font-bold text-[#12356F]">Set your new password</h1>
          <p className="mt-1 text-sm text-[#6685B5]">
            {user?.name ? `Welcome, ${user.name}. ` : ''}
            For your security, you must replace the temporary password before continuing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            label="Temporary password (from your email)"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <PasswordInput
            label="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
          <PasswordInput
            label="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" loading={submitting} className="w-full">
            Update password
          </Button>
        </form>

        <button
          type="button"
          onClick={() => { logout(); navigate('/login', { replace: true }); }}
          className="mt-4 block w-full text-center text-xs text-[#6685B5] hover:text-blue-700"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}