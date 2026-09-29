import React, { useEffect, useState } from 'react';

export default function LocationStatus({ location, loading, error }) {
  const [address, setAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);

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
    .catch(() => setAddress(null)) // silent fail - address is a nice-to-have, not required
    .finally(() => setAddressLoading(false));

  return () => controller.abort();
}, [location]);


  if (loading) {
    return <p className="text-sm text-gray-500">Fetching your location...</p>;
  }
  if (error) {
    return <p className="text-sm text-red-600">Location error: {error}</p>;
  }
  if (location) {
  return (
    <div>
      <p className="text-sm text-green-600">
        Location captured ({location.latitude.toFixed(5)}, {location.longitude.toFixed(5)})
      </p>
      {addressLoading ? (
        <p className="mt-1 text-xs text-gray-400">Looking up address...</p>
      ) : address ? (
        <p className="mt-1 text-xs text-gray-500">{address}</p>
      ) : null}
    </div>
  );
}
  return <p className="text-sm text-gray-400">Location not yet captured</p>;
}
