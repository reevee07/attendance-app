
import { useState, useEffect } from 'react';
import { useGeolocation } from './useGeolocation';
import * as attendanceService from '../services/attendanceService';

/**
 * All the shared logic behind a "punch" action: opening a confirm modal,
 * fetching geolocation, reverse-geocoding it to an address, and submitting.
 * Used by any button that should trigger a punch (quick-action circle,
 * the big Punch In/Out card button, etc.) so the logic lives in one place.
 */
export function usePunch(onPunchSuccess) {
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
      .catch(() => setAddress(null))
      .finally(() => setAddressLoading(false));

    return () => controller.abort();
  }, [location]);

  function openModal() {
    setOpen(true);
    setError(null);
    getLocation().catch(() => {});
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

  return {
    open,
    openModal,
    closeModal,
    handleSubmit,
    submitting,
    error,
    location,
    locLoading,
    locError,
    address,
    addressLoading,
  };
}
