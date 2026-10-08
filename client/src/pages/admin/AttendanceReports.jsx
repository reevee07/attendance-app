import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

import AttendanceTable from '../../components/admin/AttendanceTable.jsx';
import Loader from '../../components/common/Loader.jsx';
import * as attendanceService from '../../services/attendanceService';
import * as employeeService from '../../services/employeeService';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const getInitials = (name = '') =>
  name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

export default function AttendanceReports() {
  const navigate = useNavigate();

  const [date, setDate] = useState(todayISO());
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);

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

  // All employees, so search also finds people who did not punch today
  useEffect(() => {
    employeeService
      .listEmployees()
      .then(setAllEmployees)
      .catch(() => setAllEmployees([]));
  }, []);

  const q = query.trim().toLowerCase();

  const matches = (e) =>
    e.name?.toLowerCase().includes(q) ||
    e.employeeCode?.toLowerCase().includes(q) ||
    e.email?.toLowerCase().includes(q);

  // Filters the daily list
  const filteredSummary = useMemo(
    () => (q ? summary.filter(matches) : summary),
    [summary, q]
  );

  // Dropdown: any employee, not only those in today's list
  const suggestions = useMemo(
    () => (q ? allEmployees.filter(matches).slice(0, 6) : []),
    [allEmployees, q]
  );

  const openCalendar = (employeeId) => navigate(`/admin/attendance/${employeeId}`);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-blue-950">Daily Attendance</h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative w-64">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search by name, code or email..."
              className="h-9 w-full rounded-full border border-blue-100 bg-white pl-9 pr-8 text-sm text-blue-950 shadow-sm outline-none placeholder:text-[#7391BD] focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
            {query && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}

            {/* Dropdown with every matching employee */}
            {focused && q && (
              <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-[0_8px_25px_rgba(18,53,111,0.15)]">
                {suggestions.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-gray-400">No employee found</p>
                ) : (
                  suggestions.map((emp) => (
                    <button
                      key={emp._id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        openCalendar(emp._id);
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-blue-50"
                    >
                      {emp.photoUrl ? (
                        <img src={emp.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                          {getInitials(emp.name)}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-blue-950">
                          {emp.name}
                        </span>
                        <span className="block truncate text-xs text-[#6D8AB7]">
                          {emp.employeeCode || emp.email}
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-full border border-black bg-blue-100 px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <AttendanceTable
          data={filteredSummary}
          onRowClick={(row) => openCalendar(row.employeeId)}
          emptyMessage={
            q
              ? `Nobody matching "${query}" has punched on this day. Pick them from the search dropdown to see their calendar.`
              : undefined
          }
        />
      )}
    </div>
  );
}