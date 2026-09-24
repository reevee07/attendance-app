import React from 'react';

export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
