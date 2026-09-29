import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Clock, CalendarDays, User } from 'lucide-react';

const items = [
  { to: '/user', label: 'Home', icon: Home, end: true },
  { to: '/user/attendance', label: 'Attendance', icon: Clock },
  { to: '/user/leave', label: 'Leave', icon: CalendarDays },
  { to: '/user/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-1 text-xs font-medium ${
                isActive ? 'text-brand-600' : 'text-gray-400'
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}