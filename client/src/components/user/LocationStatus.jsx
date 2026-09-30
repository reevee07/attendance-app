import React from 'react';


export default function LocationStatus({ location, loading, error, address, addressLoading }) {
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
           ({location.latitude.toFixed(5)}, {location.longitude.toFixed(5)})
        </p>
        {addressLoading ? (
          <p className="mt-1 text-xs text-gray-400">Looking up address...</p>
        ) : address ? (
          <p className="mt-1 text-xs text-gray-900">{address}</p>
        ) : null}
      </div>
    );
  }
  return <p className="text-sm text-gray-400">Location not yet captured</p>;
}