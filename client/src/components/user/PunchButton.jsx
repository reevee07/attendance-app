import React, { useState } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import LocationStatus from './LocationStatus.jsx';
import { useGeolocation } from '../../hooks/useGeolocation';
import * as attendanceService from '../../services/attendanceService';

export default function PunchButton({ onPunchSuccess }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { location, loading: locLoading, error: locError, getLocation } = useGeolocation();

  function openModal() {
    setOpen(true);
    setError(null);
    getLocation().catch(() => {}); // error surfaced via locError
  }

  function closeModal() {
    setOpen(false);
  }

  async function handleSubmit() {
    if (!location) {
      setError('Location is required. Please allow location access and try again.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const record = await attendanceService.selfPunch({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      closeModal();
      onPunchSuccess?.(record);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit punch. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button onClick={openModal} className="w-full py-3 text-base">
        Punch Attendance
      </Button>

      <Modal open={open} onClose={closeModal} title="Confirm Punch">
        <div className="space-y-4">
          <LocationStatus location={location} loading={locLoading} error={locError} />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button onClick={handleSubmit} loading={submitting} disabled={!location} className="w-full">
            Confirm Punch
          </Button>
        </div>
      </Modal>
    </>
  );
}