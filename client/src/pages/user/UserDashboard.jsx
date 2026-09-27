import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import PunchButton from '../../components/user/PunchButton.jsx';
import Button from '../../components/common/Button.jsx';
import Table from '../../components/common/Table.jsx';
import Loader from '../../components/common/Loader.jsx';
import * as attendanceService from '../../services/attendanceService';
import * as leaveService from '../../services/leaveService';

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaveReason, setLeaveReason] = useState('');
  const [requestingLeave, setRequestingLeave] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState(null);

  async function loadHistory() {
    setLoading(true);
    try {
      const data = await attendanceService.myHistory();
      setHistory(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestLeave() {
  setRequestingLeave(true);
  setLeaveMessage(null);
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);

    await leaveService.requestLeave({ date: dateStr, reason: leaveReason.trim() || undefined });
    setLeaveMessage({ type: 'success', text: 'Leave request sent for approval.' });
    setLeaveReason('');
  } catch (err) {
    setLeaveMessage({
      type: 'error',
      text: err.response?.data?.message || 'Failed to submit leave request.',
    });
  } finally {
    setRequestingLeave(false);
  }
}


  useEffect(() => {
    loadHistory();
  }, []);

  const columns = [
    {
      key: 'timestamp',
      header: 'Time',
      render: (row) => new Date(row.timestamp).toLocaleString(),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {row.type.toUpperCase()}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.name}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                {getInitials(user.name)}
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Welcome,</p>
              <h1 className="text-lg font-semibold text-gray-900">{user.name}</h1>
            </div>
          </div>
          <Button variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>

        <div className="mb-6">
  <PunchButton onPunchSuccess={loadHistory} />
</div>

<div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
  <h2 className="mb-2 text-sm font-semibold text-gray-900">Request Leave for Tomorrow</h2>
  <input
    placeholder="Reason (optional)"
    value={leaveReason}
    onChange={(e) => setLeaveReason(e.target.value)}
    className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
  />
  <Button variant="secondary" loading={requestingLeave} onClick={handleRequestLeave} className="w-full">
    Request Leave
  </Button>
  {leaveMessage && (
    <p className={`mt-2 text-sm ${leaveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
      {leaveMessage.text}
    </p>
  )}
</div>

<h2 className="mb-2 text-sm font-medium text-gray-700">My Attendance</h2>
        {loading ? <Loader /> : <Table columns={columns} data={history} />}
      </div>
    </div>
  );
}