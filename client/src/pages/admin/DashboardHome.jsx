import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LiveRing from '../../components/admin/LiveRing.jsx';
import NotificationPanel from '../../components/admin/NotificationPanel.jsx';
import PunchHistoryPanel from '../../components/admin/PunchHistoryPanel.jsx';
import Loader from '../../components/common/Loader.jsx';
import * as attendanceService from '../../services/attendanceService';
import * as employeeService from '../../services/employeeService';
import * as leaveService from '../../services/leaveService';

const OFFICE_COLORS = ['#2f4bc4', '#0891b2', '#7c3aed'];

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

  // Top row 1: Present / On Leave / Total. Top row 2: one ring per office (up to 3 shown here).
  const topRingsRow1 = [
    { label: 'Present Employee', value: presentToday, total: totalEmployees, color: '#16a34a' },
    { label: 'On Leave Employee', value: onLeaveToday, total: totalEmployees, color: '#dc2626' },
    { label: 'Total Employee', value: totalEmployees, total: totalEmployees, color: '#4b5563' },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Top-left: bar graph */}
      <div className="rounded-2xl border border-gray-200 bg-blue-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Attendance Trend</h2>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
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

      {/* Top-right: 3x2 ring grid */}
      <div className="rounded-2xl border border-gray-200 bg-blue-200 p-4">
        <div className="grid grid-cols-3 gap-4">
          {topRingsRow1.map((ring) => (
            <LiveRing key={ring.label} {...ring} />
          ))}
          {[0, 1, 2].map((i) =>
            officeStats[i] ? (
              <LiveRing
                key={officeStats[i].officeId}
                label={officeStats[i].officeName}
                value={officeStats[i].presentToday}
                total={officeStats[i].totalEmployees}
                color={OFFICE_COLORS[i]}
              />
            ) : (
              <div key={`empty-${i}`} />
            )
          )}
        </div>
      </div>

      {/* Bottom-left: Leave Requests */}
      <NotificationPanel />

      {/* Bottom-right: Attendance Punch History */}
      <PunchHistoryPanel />
    </div>
  );
}