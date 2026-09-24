import React from 'react';

const variants = {
  primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow-md',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
};

export default function Button({
  children,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium
        transition-all duration-200 active:scale-95
        disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100
        ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}