import { useState, useEffect, useCallback } from "react";
import { useGeolocation } from "./useGeolocation";
import * as attendanceService from "../services/attendanceService";

/**
 * Shared logic behind a "punch" action: open a confirm modal, get geolocation,
 * reverse-geocode it to an address, and submit.
 * A punch is only allowed when BOTH coordinates and an address are available.
 */
export function usePunch(onPunchSuccess) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressFailed, setAddressFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const {
    location,
    loading: locLoading,
    error: locError,
    getLocation,
  } = useGeolocation();

  useEffect(() => {
    if (!location) {
      setAddress(null);
      setAddressFailed(false);
      return;
    }
    setAddressLoading(true);
    setAddressFailed(false);
    setAddress(null);

    const controller = new AbortController();
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.latitude}&lon=${location.longitude}`,
      { signal: controller.signal },
    )
      .then((res) => {
        if (!res.ok) throw new Error("lookup failed");
        return res.json();
      })
      .then((data) => {
        if (data.display_name) setAddress(data.display_name);
        else setAddressFailed(true);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setAddressFailed(true);
      })
      .finally(() => setAddressLoading(false));

    return () => controller.abort();
  }, [location, retryCount]);

  const retryAddress = useCallback(() => setRetryCount((n) => n + 1), []);

  function openModal() {
    setOpen(true);
    setError(null);
    getLocation().catch(() => {});
  }

  function closeModal() {
    setOpen(false);
  }

  // Both location and address are required
  const canPunch = !!location && !!address && !addressLoading && !locLoading;
  async function handleSubmit() {
    if (!location) {
      setError(
        "Location is required. Please allow location access and try again.",
      );
      return;
    }
    if (!address) {
      setError(
        addressLoading
          ? "Still finding your address. Please wait a moment."
          : "Address could not be found. Tap Retry and try again.",
      );
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
      setError(
        err.response?.data?.message || "Failed to submit punch. Try again.",
      );
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
    addressFailed,
    retryAddress,
    canPunch,
  };
}
