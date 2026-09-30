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
  const [fromDate, setFromDate] = useState(tomorrowISO());
  const [toDate, setToDate] = useState(tomorrowISO());
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

    if (!reason.trim()) {
      setMessage({ type: 'error', text: 'Please enter a reason for your leave request.' });
      return;
    }
    if (toDate < fromDate) {
      setMessage({ type: 'error', text: 'End date cannot be before the start date.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const created = await leaveService.requestLeave({ date: fromDate, toDate, reason: reason.trim() });
      const dayCount = Array.isArray(created) ? created.length : 1;
      setMessage({
        type: 'success',
        text: `Leave request sent for approval (${dayCount} day${dayCount > 1 ? 's' : ''}).`,
      });
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

      <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-600">From</label>
            <input
              type="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                if (toDate < e.target.value) setToDate(e.target.value);
              }}
              className="w-full rounded-full border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-600">To</label>
            <input
              type="date"
              required
              min={fromDate}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-full border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600"></label>
          <input
            required
            placeholder="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-full border border-gray-300 px-3 py-2 text-sm"
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

      {loading ? (
        <Loader />
      ) : myLeaves.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">No leave requests yet</p>
      ) : (
        (() => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const upcoming = myLeaves.filter((l) => new Date(l.date) >= today);
          const past = myLeaves.filter((l) => new Date(l.date) < today);

          const renderLeave = (leave) => (
            <div
              key={leave._id}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(leave.date).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {leave.reason && <p className="text-xs text-gray-500">{leave.reason}</p>}
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[leave.status]}`}>
                {leave.status}
              </span>
            </div>
          );

          return (
            <>
              <h2 className="mb-2 text-sm font-semibold text-gray-900">Leave History</h2>
              {upcoming.length === 0 ? (
                <p className="mb-6 py-4 text-center text-sm text-gray-400">No upcoming requests</p>
              ) : (
                <div className="mb-6 space-y-2">{upcoming.map(renderLeave)}</div>
              )}

              <h2 className="mb-2 text-sm font-semibold text-gray-900">Past Requests</h2>
              {past.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">No past requests</p>
              ) : (
                <div className="space-y-2">{past.map(renderLeave)}</div>
              )}
            </>
          );
        })()
      )}
    </div>
  );
}