import React from 'react';

export const inputCls =
  'w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm text-[#12356F] outline-none transition placeholder:text-[#7391BD] focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50';

// Label + required star + children
export function Field({ label, required, children, className = '' }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold text-[#12356F]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

// Text, email, date, tel, password inputs
export function TextField({ label, name, value, onChange, required, type = 'text', ...rest }) {
  return (
    <Field label={label} required={required}>
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        required={required}
        className={inputCls}
        {...rest}
      />
    </Field>
  );
}

// Accepts 3 option shapes: 'Male' | { value, label } | { _id, name }
function normalizeOption(o) {
  if (typeof o === 'string') return { value: o, label: o };
  if (o.value !== undefined) return { value: o.value, label: o.label };
  return { value: o._id, label: o.name };
}

export function SelectField({ label, name, value, onChange, options = [], required, placeholder, ...rest }) {
  return (
    <Field label={label} required={required}>
      <select
        name={name}
        value={value ?? ''}
        onChange={onChange}
        required={required}
        className={inputCls}
        {...rest}
      >
        <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
        {options.map(normalizeOption).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

// Section heading bar + grid wrapper (used in Step 6)
export function Section({ title, icon: Icon, children }) {
  return (
    <section className="mb-6">
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-[#F3F8FF] px-4 py-3">
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Icon size={17} />
          </span>
        )}
        <h2 className="font-semibold text-[#12356F]">{title}</h2>
      </div>
      {children}
    </section>
  );
}