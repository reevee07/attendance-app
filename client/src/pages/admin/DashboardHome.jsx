import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserCheck, CalendarX, Users, Building2 } from 'lucide-react';
import StatCard from '../../components/admin/StatCard.jsx';
import NotificationPanel from '../../components/admin/NotificationPanel.jsx';
import PunchHistoryPanel from '../../components/admin/PunchHistoryPanel.jsx';
import Loader from '../../components/common/Loader.jsx';
import * as attendanceService from '../../services/attendanceService';
import * as employeeService from '../../services/employeeService';
import * as leaveService from '../../services/leaveService';

const OFFICE_THEMES = ['purple', 'cyan', 'pink'];

export default function DashboardHome() {
  const [officeStats, setOfficeStats] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [onLeaveToday, setOnLeaveToday] = useState(0);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [offices, employees, summary, leaveCount, trend] = await Promise.all([
          attendanceService.byOffice(),
          employeeService.listEmployees({ status: 'active' }),
          attendanceService.dailySummary(),
          leaveService.todayLeaveCount(),
          attendanceService.trend(7),
        ]);

        setOfficeStats(offices);
        setTotalEmployees(employees.length);
        setPresentToday(summary.length);
        setOnLeaveToday(leaveCount);
        setTrendData(trend);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) return <Loader />;

  const statCards = [
    { label: 'Present Employee', value: presentToday, total: totalEmployees, theme: 'green', icon: UserCheck },
    { label: 'On Leave Employee', value: onLeaveToday, total: totalEmployees, theme: 'orange', icon: CalendarX },
    { label: 'Total Employee', value: totalEmployees, total: totalEmployees, theme: 'blue', icon: Users },
    ...officeStats.slice(0, 3).map((office, i) => ({
      label: office.officeName,
      value: office.presentToday,
      total: office.totalEmployees,
      theme: OFFICE_THEMES[i],
      icon: Building2,
    })),
  ];

  return (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    {/* Top-left: bar graph */}
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-blue-100/50 p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-900">Attendance</h2>
      <div className="relative min-h-[300px] flex-1">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(d) => new Date(d).toLocaleDateString([], { day: 'numeric', month: 'short' })}
              />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} />
              <Bar dataKey="count" fill="#2f4bc4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* Top-right: six stat cards, 2 columns x 3 rows */}
    <div className="grid grid-cols-1 content-start gap-3 sm:grid-cols-2">
      {statCards.map((card) => (
        <StatCard key={card.label} {...card} compact />
      ))}
    </div>

    {/* Bottom-left: Leave Requests */}
    <NotificationPanel />

    {/* Bottom-right: Attendance Punch History */}
    <PunchHistoryPanel />
  </div>
);
}