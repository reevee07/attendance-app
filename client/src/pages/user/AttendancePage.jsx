import React, { useEffect, useState } from 'react';
import Loader from '../../components/common/Loader.jsx';
import * as attendanceService from '../../services/attendanceService';
import { groupPunchesByDay, formatDuration, formatDayLabel } from '../../utils/groupAttendance';

const STATUS_STYLES = {
  Present: 'bg-green-50 text-green-700',
  'In Progress': 'bg-blue-50 text-blue-700',
  'No Punch': 'bg-gray-100 text-gray-500',
};

export default function AttendancePage() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceService
      .myHistory()
      .then((data) => setDays(groupPunchesByDay(data)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      <h1 className="mb-4 text-lg font-bold text-gray-900">Attendance History</h1>

      {loading ? (
        <Loader />
      ) : days.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">No attendance recorded yet</p>
      ) : (
        <div className="space-y-2">
          {days.map((day) => (
            <div
              key={day.dateKey}
              className="flex items-center justify-between rounded-3xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">{formatDayLabel(day.date)}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {day.firstIn ? new Date(day.firstIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  {' – '}
                  {day.lastOut ? new Date(day.lastOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">{formatDuration(day.durationMinutes)}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[day.status]}`}>
                {day.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

