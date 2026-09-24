import React, { useEffect, useState } from 'react';
import AttendanceTable from '../../components/admin/AttendanceTable.jsx';
import Loader from '../../components/common/Loader.jsx';
import * as attendanceService from '../../services/attendanceService';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendanceReports() {
  const [date, setDate] = useState(todayISO());
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadSummary(selectedDate) {
    setLoading(true);
    try {
      const data = await attendanceService.dailySummary(selectedDate);
      setSummary(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary(date);
  }, [date]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Daily Attendance</h2>
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>

      {loading ? <Loader /> : <AttendanceTable data={summary} />}
    </div>
  );
}
