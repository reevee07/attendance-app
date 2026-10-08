import React, { useEffect, useState } from 'react';
import { Mail, Phone, Briefcase, Hash, Building2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button.jsx';
import * as officeService from '../../services/officeService';

function getInitials(name = '') {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [officeName, setOfficeName] = useState(null);

  useEffect(() => {
    if (!user.officeId) return;
    officeService.listOffices().then((offices) => {
      const match = offices.find((o) => o._id === user.officeId || o._id === user.officeId?._id);
      if (match) setOfficeName(match.name);
    });
  }, [user.officeId]);

  const details = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Contact Number', value: user.contactNumber },
    { icon: Briefcase, label: 'Designation', value: user.designation },
    { icon: Hash, label: 'Employee Code', value: user.employeeCode },
    { icon: Building2, label: 'Office', value: officeName },
    { icon: ShieldCheck, label: 'Role', value: user.role, capitalize: true },
  ].filter((d) => d.value);

  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      {/* Header card with gradient banner behind the avatar */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="h-16 bg-gradient-to-r from-blue-400 to-blue-300" />
        <div className="flex flex-col items-center px-6 pb-6">
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.name}
              className="-mt-10 h-20 w-20 rounded-full border-4 border-white object-cover shadow-sm"
            />
          ) : (
            <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-brand-100 text-xl font-semibold text-brand-700 shadow-sm">
              {getInitials(user.name)}
            </div>
          )}
          <h1 className="mt-3 text-lg font-bold text-gray-900">{user.name}</h1>
          {user.designation && <p className="text-sm text-gray-500">{user.designation}</p>}
        </div>
      </div>

      {/* Details list */}
      <div className="mb-6 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white shadow-sm">
        {details.map(({ icon: Icon, label, value, capitalize }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400">
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`truncate text-sm font-medium text-gray-800 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
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