import React, { useEffect, useState } from 'react';
import Loader from '../common/Loader.jsx';
import * as attendanceService from '../../services/attendanceService';

export default function PunchHistoryPanel() {
  const [punches, setPunches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceService
      .recent(10)
      .then(setPunches)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-blue-100/50 p-4">
      <h2 className="mb-3 text-sm font-semibold text-black">Attendance Punch History</h2>

      {loading ? (
        <Loader />
      ) : punches.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">No punches yet</p>
      ) : (
        <div className="space-y-2">
          {punches.map((punch) => (
            <div
              key={punch._id}
              className="flex items-center justify-between rounded-full border border-gray-100 bg-black/80 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-white">{punch.employeeId?.name}</p>
                <p className="text-xs text-gray-300">{new Date(punch.timestamp).toLocaleString()}</p>
              </div>
              <span
                className={`rounded-full px-3 py-2 text-xs font-medium ${
                  punch.type === 'in' ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'
                }`}
              >
                {punch.type.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}