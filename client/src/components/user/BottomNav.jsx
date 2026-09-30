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
    <nav className="fixed inset-x-0 bottom-3 z-20 px-4">
  <div className="mx-auto flex max-w-md items-center justify-around
                  rounded-full border border-gray-200 bg-white/95
                  px-2 py-2 shadow-lg backdrop-blur-md">

    {items.map(({ to, label, icon: Icon, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end}
        className={({ isActive }) =>
          `flex min-w-[72px] flex-col items-center justify-center
           gap-1 rounded-full px-4 py-2 text-xs font-medium
           transition-all duration-200 ${
             isActive
               ? 'bg-blue-500 text-white shadow-md'
               : 'text-gray-500 hover:bg-gray-100'
           }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
            <span>{label}</span>
          </>
        )}
      </NavLink>
    ))}
  </div>
</nav>
  );
}