import React from 'react';

export default function LocationStatus({ location, loading, error }) {
  if (loading) {
    return <p className="text-sm text-gray-500">Fetching your location...</p>;
  }
  if (error) {
    return <p className="text-sm text-red-600">Location error: {error}</p>;
  }
  if (location) {
    return (
      <p className="text-sm text-green-600">
        Location captured ({location.latitude.toFixed(5)}, {location.longitude.toFixed(5)})
      </p>
    );
  }
  return <p className="text-sm text-gray-400">Location not yet captured</p>;
}
