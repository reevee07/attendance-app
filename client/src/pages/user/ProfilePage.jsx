import React from 'react';
import { Mail, Phone, Briefcase, Hash } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button.jsx';

function getInitials(name) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const details = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Contact', value: user.contactNumber },
    { icon: Briefcase, label: 'Designation', value: user.designation },
    { icon: Hash, label: 'Employee Code', value: user.employeeCode },
  ].filter((d) => d.value);

  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      <div className="mb-4 flex flex-col items-center rounded-0xl border border-gray-200 bg-white p-6 shadow-sm">
        {user.photoUrl ? (
          <img src={user.photoUrl} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700">
            {getInitials(user.name)}
          </div>
        )}
        <h1 className="mt-3 text-lg font-bold text-gray-900">{user.name}</h1>
        <p className="text-xs uppercase tracking-wide text-gray-400">{user.role}</p>
      </div>

      <div className="mb-6 divide-y divide-gray-100 rounded-0xl border border-gray-200 bg-white shadow-sm">
        {details.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3">
            <Icon size={18} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <Button variant="danger" onClick={logout} className="w-full">
        Logout
      </Button>
    </div>
  );
}