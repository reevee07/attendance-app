import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import LocationStatus from './LocationStatus.jsx';
import { useGeolocation } from '../../hooks/useGeolocation';
import * as attendanceService from '../../services/attendanceService';

export default function PunchButton({ onPunchSuccess }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const { location, loading: locLoading, error: locError, getLocation } = useGeolocation();

  useEffect(() => {
    if (!location) {
      setAddress(null);
      return;
    }

    setAddressLoading(true);
    setAddress(null);

    const controller = new AbortController();

    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.latitude}&lon=${location.longitude}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => setAddress(data.display_name || null))
      .catch(() => setAddress(null)) // silent fail - punch still works without an address
      .finally(() => setAddressLoading(false));

    return () => controller.abort();
  }, [location]);

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
        address,
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
          <LocationStatus
            location={location}
            loading={locLoading}
            error={locError}
            address={address}
            addressLoading={addressLoading}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button onClick={handleSubmit} loading={submitting} disabled={!location} className="w-full">
            Confirm Punch
          </Button>
        </div>
      </Modal>
    </>
  );
}