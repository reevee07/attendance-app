import React, { useEffect, useState } from 'react';
import { Sparkles, User, UserX, Users, Building2, ShieldCheck, Box } from 'lucide-react';
import LiveRing from '../../components/admin/LiveRing.jsx';
import NotificationPanel from '../../components/admin/NotificationPanel.jsx';
import PunchHistoryPanel from '../../components/admin/PunchHistoryPanel.jsx';
import Loader from '../../components/common/Loader.jsx';
import * as attendanceService from '../../services/attendanceService';
import * as employeeService from '../../services/employeeService';
import * as leaveService from '../../services/leaveService';

const THEMES = {
  green: { color: '#16a34a', track: '#bbf7d0', bg: 'bg-green-50', border: 'border-green-200' },
  red: { color: '#ef4444', track: '#fecaca', bg: 'bg-red-50', border: 'border-red-200' },
  blue: { color: '#2563eb', track: '#bfdbfe', bg: 'bg-blue-50', border: 'border-blue-200' },
  purple: { color: '#9333ea', track: '#e9d5ff', bg: 'bg-purple-50', border: 'border-purple-200' },
  amber: { color: '#f59e0b', track: '#fde68a', bg: 'bg-amber-50', border: 'border-amber-200' },
  cyan: { color: '#06b6d4', track: '#a5f3fc', bg: 'bg-cyan-50', border: 'border-cyan-200' },
};

const OFFICE_THEMES = [
  { Icon: Building2, ...THEMES.purple },
  { Icon: ShieldCheck, ...THEMES.amber },
  { Icon: Box, ...THEMES.cyan },
];


export default function DashboardHome() {
  const [officeStats, setOfficeStats] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [onLeaveToday, setOnLeaveToday] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [offices, employees, summary, leaveCount] = await Promise.all([
          attendanceService.byOffice(),
          employeeService.listEmployees({ status: 'active' }),
          attendanceService.dailySummary(),
          leaveService.todayLeaveCount(),
        ]);

        setOfficeStats(offices);
        setTotalEmployees(employees.length);
        setPresentToday(summary.length);
        setOnLeaveToday(leaveCount);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) return <Loader />;

  const rings = [
    { label: 'Present Employee', value: presentToday, total: totalEmployees, Icon: User, ...THEMES.green },
    { label: 'On Leave Employee', value: onLeaveToday, total: totalEmployees, Icon: UserX, ...THEMES.red },
    { label: 'Total Employee', value: totalEmployees, total: totalEmployees, Icon: Users, ...THEMES.blue },
    ...officeStats.slice(0, 3).map((office, i) => ({
      label: office.officeName,
      value: office.presentToday,
      total: office.totalEmployees,
      ...OFFICE_THEMES[i],
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 px-6 py-8 text-white shadow-sm">
        <Sparkles size={28} className="shrink-0 text-white/80" />
        <div>
          <p className="text-lg font-semibold">Welcome back!</p>
          <p className="text-sm text-white/80">Here's what's happening with your team today.</p>
        </div>
      </div>

      {/* Stat rings */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-3 lg:grid-cols-6">        {rings.map((ring) => (
        <LiveRing key={ring.label} {...ring} />
      ))}
      </div>

      {/* Attendance Board + Leave Request, side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PunchHistoryPanel />
        <NotificationPanel />
      </div>
    </div>
  );
}