import React, { useEffect, useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import * as leaveService from '../../services/leaveService';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
};

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function LeavePage() {
  const [date, setDate] = useState(tomorrowISO());
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadMyLeaves() {
    setLoading(true);
    try {
      const data = await leaveService.listMine();
      setMyLeaves(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyLeaves();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await leaveService.requestLeave({ date, reason: reason.trim() || undefined });
      setMessage({ type: 'success', text: 'Leave request sent for approval.' });
      setReason('');
      loadMyLeaves();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit request.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      <h1 className="mb-4 text-lg font-bold text-gray-900">Request Leave</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-0xl border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Date</label>
          <input
            type="date"
            required
            min={new Date().toISOString().slice(0, 10)}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Reason</label>
          <input
            placeholder="e.g. Doctor's appointment"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}
        <Button type="submit" loading={submitting} className="w-full">
          Submit Request
        </Button>
      </form>

      <h2 className="mb-2 text-sm font-semibold text-gray-900">My Requests</h2>
      {loading ? (
        <Loader />
      ) : myLeaves.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">No leave requests yet</p>
      ) : (
        <div className="space-y-2">
          {myLeaves.map((leave) => (
            <div
              key={leave._id}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(leave.date).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
                {leave.reason && <p className="text-xs text-gray-500">{leave.reason}</p>}
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[leave.status]}`}>
                {leave.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}