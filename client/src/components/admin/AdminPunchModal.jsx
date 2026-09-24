import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import * as attendanceService from '../../services/attendanceService';

/**
 * Lets an admin punch attendance on behalf of ANY employee - for those
 * without mobile/camera access. No photo or geolocation is captured;
 * this entry is trust-based and flagged as "Admin Entry" in reports.
 */
export default function AdminPunchModal({ employee, open, onClose, onSuccess }) {
  const [type, setType] = useState('auto');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const record = await attendanceService.adminPunch({
        employeeId: employee._id,
        type: type === 'auto' ? undefined : type,
        note: note.trim() || undefined,
      });
      onSuccess?.(record);
      onClose();
      setNote('');
      setType('auto');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record punch');
    } finally {
      setSubmitting(false);
    }
  }

  if (!employee) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Punch for ${employee.name}`}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          This entry is recorded without photo or location and will be marked as an{' '}
          <span className="font-medium text-amber-700">Admin Entry</span> in reports.
        </p>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Punch type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-full border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="auto">Auto-detect (recommended)</option>
            <option value="in">In</option>
            <option value="out">Out</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. No phone access"
            className="w-full rounded-full border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button onClick={handleSubmit} loading={submitting} className="w-full">
          Record Punch
        </Button>
      </div>
    </Modal>
  );
}
