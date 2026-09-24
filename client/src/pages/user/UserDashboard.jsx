import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import PunchButton from '../../components/user/PunchButton.jsx';
import Button from '../../components/common/Button.jsx';
import Table from '../../components/common/Table.jsx';
import Loader from '../../components/common/Loader.jsx';
import * as attendanceService from '../../services/attendanceService';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadHistory() {
    setLoading(true);
    try {
      const data = await attendanceService.myHistory();
      setHistory(data);
    } finally {
      setLoading(false);
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
          <div>
            <p className="text-sm text-gray-500">Welcome,</p>
            <h1 className="text-lg font-semibold text-gray-900">{user.name}</h1>
          </div>
          <Button variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>

        <div className="mb-6">
          <PunchButton onPunchSuccess={loadHistory} />
        </div>

        <h2 className="mb-2 text-sm font-medium text-gray-700">My Attendance</h2>
        {loading ? <Loader /> : <Table columns={columns} data={history} />}
      </div>
    </div>
  );
}
