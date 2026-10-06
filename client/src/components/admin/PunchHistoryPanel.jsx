import React, { useEffect, useState } from 'react';
import { ClipboardClock, Calendar, Clock, LogIn, LogOut, ChevronRight } from 'lucide-react';
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

  const todayLabel = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <ClipboardClock size={18} className="text-blue-600" />
          Recent Attendance
        </h2>
      </div>

      {loading ? (
        <Loader />
      ) : punches.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">No punches yet</p>
      ) : (
        <div className="max-h-[32rem] space-y-3 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {punches.map((punch) => {
            const isIn = punch.type === 'in';
            const Icon = isIn ? LogIn : LogOut;

            return (
              <div
                key={punch._id}
                className={`flex items-center gap-3 rounded-full border px-3 py-2 ${isIn ? 'border-green-100 bg-green-50/60' : 'border-red-100 bg-red-50/60'
                  }`}
              >
                {/* Icon circle */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isIn ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                    }`}
                >
                  <Icon size={20} />
                </div>

                {/* Name */}
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">
                  {punch.employeeId?.name || 'Unknown'}
                </p>

                {/* Time only (date is shown in the header pill) */}
                <div className="flex w-28 shrink-0 items-center justify-end gap-1.5 text-xs tabular-nums text-gray-500">
                  {new Date(punch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>


                {/* IN / OUT pill */}
                <span
                  className={`flex w-16 shrink-0 items-center justify-center gap-1.5 rounded-full py-3 px-3 text-xs font-bold ${isIn ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}
                >
                  <span className={`h-2 w-2 rounded-full ${isIn ? 'bg-green-500' : 'bg-red-500'}`} />
                  {punch.type.toUpperCase()}
                </span>


              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}