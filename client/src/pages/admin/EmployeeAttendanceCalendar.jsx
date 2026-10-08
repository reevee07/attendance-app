import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, ChevronLeft, ChevronRight, CalendarCheck, Mail, Phone,
    Building2, Briefcase, IdCard, BarChart3,
} from 'lucide-react';

import Loader from '../../components/common/Loader.jsx';
import * as employeeService from '../../services/employeeService';
import * as attendanceService from '../../services/attendanceService';

const TZ = 'Asia/Kolkata';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const todayKey = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });
const currentMonth = () => todayKey().slice(0, 7);

function shiftMonth(month, delta) {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

const monthLabel = (month) => {
    const [y, m] = month.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', {
        month: 'long', year: 'numeric', timeZone: 'UTC',
    });
};

const longDate = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    });
};

const formatTime = (ts) =>
    ts
        ? new Date(ts).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true, timeZone: TZ,
        })
        : null;

const getInitials = (name = '') =>
    name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

// One look per status: cell tint, status pill, legend dot
const STATUS = {
    present: { label: 'Present', dot: 'bg-emerald-500', pill: 'bg-emerald-300 text-emerald-800', cell: 'bg-emerald-100/90', badge: 'bg-emerald-600 text-white' },
    absent: { label: 'Absent', dot: 'bg-red-500', pill: 'bg-red-300 text-red-700', cell: 'bg-red-100/90', badge: 'bg-red-500 text-white' },
    weekly_off: { label: '', dot: 'bg-slate-400', pill: 'bg-slate-200 text-slate-600', cell: 'bg-slate-100/80', badge: 'bg-slate-400 text-white' },
    holiday: { label: 'Holiday', dot: 'bg-amber-500', pill: 'bg-amber-300 text-amber-800', cell: 'bg-amber-100', badge: 'bg-amber-600 text-white' },
};

const isWeekendIdx = (i) => i === 0 || i === 6;

function SummaryCard({ label, value, total, tone }) {
    const tones = {
        green: 'border-emerald-100 from-emerald-50 text-emerald-600',
        red: 'border-red-100 from-red-50 text-red-500',
        blue: 'border-blue-100 from-blue-50 text-blue-600',
    };
    return (
        <div className={`rounded-xl border bg-gradient-to-br to-white px-5 py-4 shadow-sm ${tones[tone]}`}>
            <p className="text-xs font-medium text-[#6685B5]">{label}</p>
            <p className="mt-1 text-3xl font-bold text-[#12356F]">{value}</p>
            <p className="text-xs text-[#6685B5]">of {total} days</p>
        </div>
    );
}

function InfoItem({ icon: Icon, value, label }) {
    return (
        <div className="flex items-center gap-2 text-sm text-[#4F709F]">
            <Icon size={16} className="shrink-0 text-[#6686B6]" />
            <div className="min-w-0">
                <p className="truncate font-medium text-[#12356F]">{value || '—'}</p>
                {label && <p className="text-[11px] text-[#6D8AB7]">{label}</p>}
            </div>
        </div>
    );
}

function DetailRow({ label, value }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-[#6685B5]">{label}</span>
            <span className="font-semibold text-[#12356F]">{value || '—'}</span>
        </div>
    );
}

// Card shown when a day is clicked
function DayDetail({ day }) {
    const s = day.status ? STATUS[day.status] : null;
    const inT = formatTime(day.firstIn);
    const outT = formatTime(day.lastOut);

    return (
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-[#6D8AB7]">Selected day</p>
            <h3 className="mt-1 font-bold text-[#12356F]">{longDate(day.date)}</h3>

            <div className="mt-3 flex flex-wrap gap-2">
                {s ? (
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.pill}`}>{s.label}</span>
                ) : (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
                        No status yet
                    </span>
                )}
                {day.late && (
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                        Late
                    </span>
                )}
                {day.byAdmin && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        By Admin
                    </span>
                )}
            </div>

            <div className="mt-4 space-y-2 border-t border-blue-50 pt-4">
                {day.holidayName && <DetailRow label="Holiday" value={day.holidayName} />}
                <DetailRow label="First in" value={inT} />
                <DetailRow label="Last out" value={outT} />
                <DetailRow label="Punches" value={day.punchCount ? String(day.punchCount) : null} />
            </div>
        </div>
    );
}

export default function EmployeeAttendanceCalendar() {
    const { employeeId } = useParams();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [month, setMonth] = useState(currentMonth());
    const [calendar, setCalendar] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    const [loadingEmployee, setLoadingEmployee] = useState(true);
    const [loadingCalendar, setLoadingCalendar] = useState(true);
    const [error, setError] = useState(null);

    // Employee details (once per employee)
    useEffect(() => {
        let cancelled = false;
        setLoadingEmployee(true);
        employeeService
            .getEmployee(employeeId)
            .then((e) => { if (!cancelled) setEmployee(e); })
            .catch((err) => {
                if (!cancelled) setError(err.response?.data?.message || 'Could not load employee');
            })
            .finally(() => { if (!cancelled) setLoadingEmployee(false); });
        return () => { cancelled = true; };
    }, [employeeId]);

    // Calendar (every time the month changes)
    useEffect(() => {
        let cancelled = false;
        setLoadingCalendar(true);
        attendanceService
            .employeeCalendar(employeeId, month)
            .then((c) => { if (!cancelled) { setCalendar(c); setError(null); } })
            .catch((err) => {
                if (!cancelled) setError(err.response?.data?.message || 'Could not load attendance');
            })
            .finally(() => { if (!cancelled) setLoadingCalendar(false); });
        return () => { cancelled = true; };
    }, [employeeId, month]);

    if (loadingEmployee) {
        return (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white">
                <Loader />
            </div>
        );
    }

    const company = employee?.officeId && typeof employee.officeId === 'object'
        ? employee.officeId.name
        : null;
    const isActive = employee?.status !== 'inactive';
    const isCurrentMonth = month === currentMonth();
    const today = todayKey();

    const summary = calendar?.summary;
    const totalDays = calendar?.daysInMonth || 0;
    const offDays = summary ? summary.weeklyOff + summary.holiday : 0;
    const pct = (n) => (totalDays ? ((n / totalDays) * 100).toFixed(1) : '0.0');

    const leadingBlanks = calendar?.days?.[0]?.weekday ?? 0;
    const selectedDay = calendar?.days.find((d) => d.date === selectedDate) || null;

    return (
        <div>
            {/* ---------- Header card ---------- */}
            <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/attendance')}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
                        title="Back to daily attendance"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    {employee?.photoUrl ? (
                        <img src={employee.photoUrl} alt={employee.name}
                            className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-blue-50" />
                    ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-200 to-blue-300 text-2xl font-bold text-blue-700 ring-4 ring-blue-50">
                            {getInitials(employee?.name)}
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="truncate text-2xl font-bold text-[#12356F]">{employee?.name}</h1>
                            <span className={`flex items-center gap-1.5 text-xs font-medium ${isActive ? 'text-emerald-600' : 'text-red-500'}`}>
                                <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                {isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <p className="mt-0.5 text-sm text-[#6685B5]">{employee?.designation || 'Employee'}</p>

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <InfoItem icon={Mail} value={employee?.email} />
                            <InfoItem icon={Phone} value={employee?.contactNumber} />
                            <InfoItem icon={IdCard} value={employee?.employeeCode} label="Employee Code" />
                            <InfoItem icon={Building2} value={company} label="Company" />
                            <InfoItem icon={Briefcase} value={employee?.department} label="Department" />
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
            )}

            {/* ---------- Summary cards ---------- */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryCard label="Present Days" value={summary?.present ?? '–'} total={totalDays} tone="green" />
                <SummaryCard label="Absent Days" value={summary?.absent ?? '–'} total={totalDays} tone="red" />
                <SummaryCard label="Holidays & Weekly Offs" value={summary ? offDays : '–'} total={totalDays} tone="blue" />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
                {/* ---------- Calendar ---------- */}
                <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <CalendarCheck size={20} />
                            </span>
                            <h2 className="text-lg font-bold text-[#12356F]">Attendance Calendar</h2>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setMonth((m) => shiftMonth(m, -1))}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 text-blue-600 hover:bg-blue-50"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <input
                                type="month"
                                value={month}
                                onChange={(e) => e.target.value && setMonth(e.target.value)}
                                className="h-9 rounded-lg border border-blue-100 px-3 text-sm font-medium text-[#12356F] outline-none focus:border-blue-300"
                            />

                            <button
                                type="button"
                                disabled={isCurrentMonth}
                                onClick={() => setMonth((m) => shiftMonth(m, 1))}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 text-blue-600 hover:bg-blue-50 disabled:opacity-40"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <p className="mb-3 text-sm font-semibold text-[#6685B5]">{monthLabel(month)}</p>

                    {loadingCalendar && !calendar ? (
                        <div className="flex min-h-[300px] items-center justify-center"><Loader /></div>
                    ) : (
                        <div className={loadingCalendar ? 'opacity-50 transition' : 'transition'}>
                            {/* Weekday header: Sat and Sun are tinted */}
                            <div className="grid grid-cols-7 overflow-hidden rounded-t-xl bg-[#F3F8FF] text-center text-xs font-semibold text-[#5276AA]">
                                {WEEKDAYS.map((d, i) => (
                                    <div
                                        key={d}
                                        className={`py-3 ${isWeekendIdx(i) ? 'bg-slate-200/70 text-slate-600' : ''}`}
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 border-l border-t border-blue-50">
                                {/* Blank cells before day 1 */}
                                {Array.from({ length: leadingBlanks }).map((_, i) => (
                                    <div
                                        key={`b${i}`}
                                        className={`min-h-[96px] border-b border-r border-blue-50 ${isWeekendIdx(i) ? 'bg-slate-50' : 'bg-gray-50/40'}`}
                                    />
                                ))}

                                {calendar?.days.map((day) => {
                                    const s = day.status ? STATUS[day.status] : null;
                                    const inT = formatTime(day.firstIn);
                                    const outT = formatTime(day.lastOut);
                                    const isToday = day.date === today;
                                    const isSelected = day.date === selectedDate;
                                    const weekend = isWeekendIdx(day.weekday);

                                    // Cell background: status tint, or a light weekend tint when there is no status
                                    const cellBg = s ? s.cell : weekend ? 'bg-slate-50' : 'bg-white';

                                    // Date number badge
                                    // Date number badge: round, colored by status
                                    let badge = s ? s.badge : 'bg-gray-100 text-[#12356F]';
                                    if (isToday && !s) badge = 'bg-blue-600 text-white';
                                    if (isToday) badge += ' ring-2 ring-blue-500 ring-offset-2';

                                    const tip = [
                                        day.holidayName,
                                        inT && `In: ${inT}`,
                                        outT && `Out: ${outT}`,
                                        day.late && 'Late',
                                        day.byAdmin && 'Punched by admin',
                                    ].filter(Boolean).join(' • ');

                                    return (
                                        <button
                                            key={day.date}
                                            type="button"
                                            title={tip || undefined}
                                            onClick={() => setSelectedDate(day.date)}
                                            className={`flex flex-col items-stretch justify-start relative min-h-[96px] border-b border-r border-blue-50 p-2 text-left transition duration-150 hover:z-10 hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${cellBg} ${isSelected ? 'z-10 ring-2 ring-blue-500' : ''}`}                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${badge}`}>
                                                    {Number(day.date.slice(8))}
                                                </span>
                                                {isToday && (
                                                    <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                                                        
                                                    </span>
                                                )}
                                            </div>

                                            {s && (
                                                <div className={`mt-2 truncate rounded-full px-2 py-1 text-center text-[11px] font-semibold ${s.pill}`}>
                                                    {day.status === 'holiday' && day.holidayName ? day.holidayName : s.label}
                                                </div>
                                            )}

                                            {day.status === 'present' && inT && (
                                                <p className="mt-1 text-center text-[10px] text-[#6D8AB7]">
                                                    {inT}{outT ? ` – ${outT}` : ''}
                                                </p>
                                            )}

                                            {day.late && (
                                                <div className="mt-1 text-center">
                                                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                                                        Late
                                                    </span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ---------- Side panels ---------- */}
                <div className="space-y-6">
                    {selectedDay ? (
                        <DayDetail day={selectedDay} />
                    ) : (
                        <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-5 text-center text-sm text-[#6685B5]">
                            Click any day on the calendar to see its details.
                        </div>
                    )}

                    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <BarChart3 size={18} className="text-blue-600" />
                            <h3 className="font-bold text-[#12356F]">Monthly Summary</h3>
                        </div>
                        {summary ? (
                            <div className="space-y-3 text-sm">
                                {[
                                    { label: 'Present', n: summary.present, dot: 'bg-emerald-500' },
                                    { label: 'Absent', n: summary.absent, dot: 'bg-red-500' },
                                    { label: 'Weekly off', n: summary.weeklyOff, dot: 'bg-slate-400' },
                                    { label: 'Holiday', n: summary.holiday, dot: 'bg-amber-500' },
                                    { label: 'Late (included in Present)', n: summary.late ?? 0, dot: 'bg-orange-400' },
                                ].map((row) => (
                                    <div key={row.label} className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-[#4F709F]">
                                            <span className={`h-2.5 w-2.5 rounded-full ${row.dot}`} />
                                            {row.label}
                                        </span>
                                        <span className="font-semibold text-[#12356F]">
                                            {row.n} {row.n === 1 ? 'day' : 'days'}
                                            <span className="ml-3 font-normal text-[#6D8AB7]">{pct(row.n)}%</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No data</p>
                        )}
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 font-bold text-[#12356F]">Legend</h3>
                        <div className="space-y-3 text-sm">
                            {[
                                { dot: 'bg-emerald-500', name: 'Present', desc: 'Punched in' },
                                { dot: 'bg-red-500', name: 'Absent', desc: 'No punch on a working day' },
                                { dot: 'bg-amber-500', name: 'Holiday', desc: 'Company holiday' },
                                { dot: 'bg-slate-400', name: 'Weekly off', desc: 'Saturday and Sunday' },
                                { dot: 'bg-orange-400', name: 'Late', desc: 'First punch after 10:10 AM' },
                            ].map((l) => (
                                <div key={l.name} className="flex items-center gap-3">
                                    <span className={`h-2.5 w-2.5 rounded-full ${l.dot}`} />
                                    <span className="font-medium text-[#12356F]">{l.name}</span>
                                    <span className="text-xs text-[#6D8AB7]">– {l.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}