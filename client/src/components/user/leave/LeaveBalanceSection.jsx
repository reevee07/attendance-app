import React from 'react';
import { Palmtree, HeartPulse, CalendarDays, Star, Ban, RefreshCw, Users, FileText } from 'lucide-react';
import LeaveBalanceCard from './LeaveBalanceCard.jsx';
import Loader from '../../common/Loader.jsx';
import { computeTotalLeaveBalance } from '../../../utils/leaveBalanceCalc';

export default function LeaveBalanceSection({ balance, leaveHistoryCount = 0 }) {
  if (!balance) return <Loader />;

  const total = computeTotalLeaveBalance(balance);

  const cards = [
    {
      icon: Palmtree,
      label: 'Casual Leave',
      value: balance.casualLeave.available,
      max: balance.casualLeave.allocated,
      tint: 'bg-green-200',
      iconColor: 'text-green-600',
    },
    {
      icon: HeartPulse,
      label: 'Sick Leave',
      value: balance.sickLeave.available,
      max: balance.sickLeave.allocated,
      tint: 'bg-red-200',
      iconColor: 'text-red-600',
    },
    {
      icon: CalendarDays,
      label: 'Earn Leave',
      value: balance.earnLeave.available,
      max: balance.earnLeave.allocated,
      tint: 'bg-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      icon: Star,
      label: 'Special Leave',
      value: balance.specialLeave.available,
      max: balance.specialLeave.allocated,
      tint: 'bg-purple-200',
      iconColor: 'text-purple-600',
    },
    {
      icon: Ban,
      label: 'Without Pay',
      value: balance.leaveWithoutPay.available,
      tint: 'bg-orange-200',
      iconColor: 'text-orange-600',
    },
    {
      icon: RefreshCw,
      label: 'Comp Off',
      value: balance.compOff.available,
      max: balance.compOff.earned,
      tint: 'bg-teal-200',
      iconColor: 'text-teal-600',
    },
    {
      icon: Users,
      label: 'Leave Balance',
      value: total.available,
      max: total.allocated,
      tint: 'bg-slate-200',
      iconColor: 'text-slate-600',
    },
    {
      icon: FileText,
      label: 'Leave History',
      value: leaveHistoryCount,
      tint: 'bg-pink-200',
      iconColor: 'text-pink-600',
    },
  ];

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

      <div className="grid grid-cols-2 gap-2">
        {cards.map((card) => (
          <LeaveBalanceCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}