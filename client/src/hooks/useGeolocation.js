import { useState, useCallback } from 'react';

/**
 * Wraps navigator.geolocation with loading/error state.
 * No geofence enforcement here - this just captures the coordinates.
 */
export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = 'Geolocation is not supported by this browser';
        setError(err);
        reject(new Error(err));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(coords);
          setLoading(false);
          resolve(coords);
        },
        (err) => {
          setError(err.message || 'Failed to get location');
          setLoading(false);
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  return { location, error, loading, getLocation };
}
