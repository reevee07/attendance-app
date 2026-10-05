import React, { useState } from 'react';
import Button from '../../components/common/Button.jsx';
import * as leaveBalanceAdminService from '../../services/leaveBalanceAdminService';

export default function LeaveAllocation() {
  const [standardForm, setStandardForm] = useState({ employeeCode: '', casualLeave: '', sickLeave: '', earnLeave: '' });
  const [standardSubmitting, setStandardSubmitting] = useState(false);
  const [standardMessage, setStandardMessage] = useState(null);

  const [specialForm, setSpecialForm] = useState({ employeeCode: '', amount: '' });
  const [specialSubmitting, setSpecialSubmitting] = useState(false);
  const [specialMessage, setSpecialMessage] = useState(null);

  async function handleStandardSubmit(e) {
    e.preventDefault();
    setStandardSubmitting(true);
    setStandardMessage(null);
    try {
      await leaveBalanceAdminService.assignStandardLeave({
        employeeCode: standardForm.employeeCode.trim(),
        casualLeave: standardForm.casualLeave === '' ? undefined : Number(standardForm.casualLeave),
        sickLeave: standardForm.sickLeave === '' ? undefined : Number(standardForm.sickLeave),
        earnLeave: standardForm.earnLeave === '' ? undefined : Number(standardForm.earnLeave),
      });
      setStandardMessage({ type: 'success', text: `Leave balance updated for ${standardForm.employeeCode}.` });
    } catch (err) {
      setStandardMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update balance.' });
    } finally {
      setStandardSubmitting(false);
    }
  }

  async function handleSpecialSubmit(e) {
    e.preventDefault();
    setSpecialSubmitting(true);
    setSpecialMessage(null);
    try {
      await leaveBalanceAdminService.grantSpecialLeave({
        employeeCode: specialForm.employeeCode.trim(),
        amount: Number(specialForm.amount),
      });
      setSpecialMessage({ type: 'success', text: `${specialForm.amount} day(s) of Special Leave granted to ${specialForm.employeeCode}.` });
      setSpecialForm({ employeeCode: '', amount: '' });
    } catch (err) {
      setSpecialMessage({ type: 'error', text: err.response?.data?.message || 'Failed to grant Special Leave.' });
    } finally {
      setSpecialSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Leave Allocation</h1>
        <p className="text-sm text-gray-500">Assign Casual/Sick/Earn Leave, or grant Special Leave, by employee code.</p>
      </div>

      <form onSubmit={handleStandardSubmit} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Assign Standard Leave</h2>
        <p className="text-xs text-gray-400">
          Sets the total allocated amount for the year/period (replaces the previous value, doesn't add to it).
        </p>

        <input
          required
          placeholder="Employee Code (e.g. EMP001)"
          value={standardForm.employeeCode}
          onChange={(e) => setStandardForm({ ...standardForm, employeeCode: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Casual Leave</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 12"
              value={standardForm.casualLeave}
              onChange={(e) => setStandardForm({ ...standardForm, casualLeave: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Sick Leave</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 10"
              value={standardForm.sickLeave}
              onChange={(e) => setStandardForm({ ...standardForm, sickLeave: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Earn Leave</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 15"
              value={standardForm.earnLeave}
              onChange={(e) => setStandardForm({ ...standardForm, earnLeave: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        {standardMessage && (
          <p className={`text-sm ${standardMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {standardMessage.text}
          </p>
        )}
        <Button type="submit" loading={standardSubmitting}>
          Save Allocation
        </Button>
      </form>

      <form onSubmit={handleSpecialSubmit} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">Grant Special Leave</h2>
        <p className="text-xs text-gray-400">
          Adds to the employee's existing Special Leave balance (doesn't replace it) - Special Leave starts at 0 and is only ever admin-granted.
        </p>

        <div className="flex gap-3">
          <input
            required
            placeholder="Employee Code"
            value={specialForm.employeeCode}
            onChange={(e) => setSpecialForm({ ...specialForm, employeeCode: e.target.value })}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            required
            type="number"
            min="1"
            placeholder="Days"
            value={specialForm.amount}
            onChange={(e) => setSpecialForm({ ...specialForm, amount: e.target.value })}
            className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {specialMessage && (
          <p className={`text-sm ${specialMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {specialMessage.text}
          </p>
        )}
        <Button type="submit" variant="secondary" loading={specialSubmitting}>
          Grant Special Leave
        </Button>
      </form>
    </div>
  );
}