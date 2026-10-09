import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';
import Loader from '../../components/common/Loader.jsx';
import * as attendanceService from '../../services/attendanceService';
import { groupPunchesByDay, formatDuration, formatDayLabel } from '../../utils/groupAttendance';

const TZ = 'Asia/Kolkata';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const todayKey = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
const currentMonth = () => todayKey().slice(0, 7);

function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

const monthTitle = (month) => {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  });
};

const shortDate = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
  });
};

const formatTime = (ts) =>
  ts
    ? new Date(ts).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true, timeZone: TZ,
    })
    : null;

const formatMinutes = (min) => {
  if (min === null || min === undefined) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};

const STATUS_STYLES = {
  Present: 'bg-green-50 text-green-700',
  'In Progress': 'bg-blue-50 text-blue-700',
  'No Punch': 'bg-gray-100 text-gray-500',
};

// Calendar looks: day circle + status pill
const CAL_STATUS = {
  present: { label: 'Present', circle: 'bg-emerald-100 text-emerald-800 border-emerald-500', pill: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  absent: { label: 'Absent', circle: 'bg-red-100 text-red-700 border-red-500', pill: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  weekly_off: { label: 'Weekly off', circle: 'bg-slate-100 text-slate-500 border-slate-400', pill: 'bg-slate-200 text-slate-600', dot: 'bg-slate-400' },
  holiday: { label: 'Holiday', circle: 'bg-amber-100 text-amber-800 border-amber-500', pill: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
};

function Stat({ label, value, tone }) {
  return (
    <div className={`rounded-2xl px-3 py-2 text-center ${tone}`}>
      <p className="text-lg font-bold">{value ?? '–'}</p>
      <p className="text-[11px] font-medium">{label}</p>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 truncate text-sm font-bold text-gray-900">{value || ''}</p>
    </div>
  );
}

function SelectedDayCard({ day }) {
  const s = day.status ? CAL_STATUS[day.status] : null;

  let location = null;
  if (day.byAdmin) location = 'Entered by admin';
  else if (day.inAddress) location = day.inAddress;
  else if (day.distanceFromOffice !== null && day.distanceFromOffice !== undefined) {
    location = `${Math.round(day.distanceFromOffice)} m from office`;
  }


  return (
    <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-lg font-bold text-gray-500">
          {shortDate(day.date)}
        </p>

        <div className="flex items-center gap-2">
          {day.late && (
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700 whitespace-nowrap">
              Late arrival
            </span>
          )}

          {s ? (
            <span className={`rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${s.pill}`}>
              {s.label}
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500 whitespace-nowrap">
              No status yet
            </span>
          )}
        </div>
      </div>

      {day.holidayName && (
        <p className="mt-2 text-sm font-semibold text-amber-700">
          {day.holidayName}
        </p>
      )}

      <div className="mt-2 grid grid-cols-2 gap-1">
        <InfoBox label="In time" value={formatTime(day.firstIn)} />
        <InfoBox label="Out time" value={formatTime(day.lastOut)} />
        <InfoBox label="Working hours" value={formatMinutes(day.workingMinutes)} />
        <InfoBox label="Location" value={location} />
      </div>
    </div>
  );
}

export default function AttendancePage() {
  // ---- Calendar ----
  const [month, setMonth] = useState(currentMonth());
  const [calendar, setCalendar] = useState(null);
  const [calLoading, setCalLoading] = useState(true);
  const [calError, setCalError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayKey());

  // ---- History (existing) ----
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setCalLoading(true);
    attendanceService
      .myCalendar(month)
      .then((c) => { if (!cancelled) { setCalendar(c); setCalError(null); } })
      .catch((err) => {
        if (!cancelled) setCalError(err.response?.data?.message || 'Could not load calendar');
      })
      .finally(() => { if (!cancelled) setCalLoading(false); });
    return () => { cancelled = true; };
  }, [month]);

  useEffect(() => {
    attendanceService
      .myHistory()
      .then((data) => setDays(groupPunchesByDay(data)))
      .finally(() => setLoading(false));
  }, []);

  function goToMonth(m) {
    setMonth(m);
    setSelectedDate(m === currentMonth() ? todayKey() : null);
  }

  const today = todayKey();
  const leadingBlanks = calendar?.days?.[0]?.weekday ?? 0;
  const selectedDay = calendar?.days.find((d) => d.date === selectedDate) || null;
  const summary = calendar?.summary;

  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      {/* ================= CALENDAR ================= */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <CalendarCheck size={22} />
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight text-blue-950">Attendance Calendar</h1>
          </div>
        </div>
       
      </div>



      {calError && (
        <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{calError}</p>
      )}

      {summary && (
        <div className="mb-3 grid grid-cols-3 gap-1">
          <Stat label="Present" value={summary.present} tone="bg-emerald-100 text-emerald-700" />
          <Stat label="Absent" value={summary.absent} tone="bg-red-100 text-red-600" />
          <Stat label="Late" value={summary.late ?? 0} tone="bg-orange-100 text-orange-600" />
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold bg-blue-100 rounded-full p-1 px-14 text-blue-950">{monthTitle(month)}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => goToMonth(shiftMonth(month, -1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-700 shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => goToMonth(shiftMonth(month, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-700 shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-blue-100 bg-white p-3 shadow-sm">
        {calLoading && !calendar ? (
          <div className="py-12"><Loader /></div>
        ) : (
          <div className={calLoading ? 'opacity-50 transition' : 'transition'}>
            <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold text-gray-400">
              {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-y-2">
              {Array.from({ length: leadingBlanks }).map((_, i) => <div key={`b${i}`} />)}

              {calendar?.days.map((day) => {
                const s = day.status ? CAL_STATUS[day.status] : null;
                const isToday = day.date === today;
                const isSelected = day.date === selectedDate;

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDate(day.date)}
                    className="flex flex-col items-center gap-0.5 focus:outline-none"
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition ${s ? s.circle : 'border-transparent bg-gray-100 text-blue-950'
                        } ${isSelected ? 'ring-4 ring-green-600 ring-offset-2' : ''} ${isToday && !isSelected ? 'ring-2 ring-green-300 ring-offset-1' : ''
                        }`}
                    >
                      {Number(day.date.slice(8))}
                    </span>
                    <span className={`h-1.5 w-1.5 rounded-full ${day.late ? 'bg-orange-400' : 'bg-transparent'}`} />
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 border-t border-gray-100 pt-3 text-[11px] text-gray-500">
              {[
                ['bg-emerald-500', 'Present'],
                ['bg-red-500', 'Absent'],
                ['bg-amber-500', 'Holiday'],
                ['bg-slate-400', 'Weekly off'],
                ['bg-orange-400', 'Late'],
              ].map(([dot, name]) => (
                <span key={name} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedDay ? (
        <SelectedDayCard day={selectedDay} />
      ) : (
        <p className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 px-4 py-3 text-center text-sm text-gray-500">
          Tap a day to see its details.
        </p>
      )}

    </div>
  );
}