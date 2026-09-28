import React, { useEffect, useState } from 'react';
import Button from '../common/Button.jsx';
import Loader from '../common/Loader.jsx';
import * as leaveService from '../../services/leaveService';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function NotificationPanel() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decidingId, setDecidingId] = useState(null);

  async function loadLeaves() {
    setLoading(true);
    try {
      const data = await leaveService.listPendingLeaves();
      setLeaves(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  async function handleDecision(id, decision) {
    setDecidingId(id);
    try {
      await leaveService.decideLeave(id, decision);
      setLeaves((prev) => prev.filter((leave) => leave._id !== id));
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-blue-100 p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">Leave Requests</h2>

      {loading ? (
        <Loader />
      ) : leaves.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">No pending requests</p>
      ) : (
        <div className="space-y-2">
          {leaves.map((leave) => (
            <div
              key={leave._id}
              className="flex items-center justify-between rounded-full border border-gray-100 bg-black/80 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-white">{leave.employeeId?.name}</p>
                <p className="text-xs text-gray-300">
                  {formatDate(leave.date)}
                  {leave.reason && ` · ${leave.reason}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  loading={decidingId === leave._id}
                  onClick={() => handleDecision(leave._id, 'rejected')}
                >
                  Reject
                </Button>
                <Button
                  loading={decidingId === leave._id}
                  onClick={() => handleDecision(leave._id, 'approved')}
                >
                  Accept
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}