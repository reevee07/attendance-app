import React, { useEffect, useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import Modal from '../../components/common/Modal.jsx';
import * as leaveService from '../../services/leaveService';
import * as leaveBalanceService from '../../services/leaveBalanceService';
import LeaveBalanceSection from '../../components/user/leave/LeaveBalanceSection.jsx';
import DayTypeSelector from '../../components/user/leave/DayTypeSelector.jsx';
import LeaveTypeDropdown, { LEAVE_TYPES } from '../../components/user/leave/LeaveTypeDropdown.jsx';
import { calculateLeaveDuration } from '../../utils/leaveDuration';
import { Palmtree, HeartPulse, CalendarDays, Star, Ban, RefreshCw, Users, FileText } from 'lucide-react';


const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  mixed: 'bg-purple-50 text-purple-700',
};

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function dateOnly(value) {
  if (!value) return null;
  // API dates may be date-only strings or full ISO timestamps.
  // Never append a second time segment to an ISO timestamp (that produces Invalid Date).
  const raw = value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

function parseLocalDate(value) {
  const normalized = dateOnly(value);
  if (!normalized) return null;
  const [year, month, day] = normalized.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function shortDate(value) {
  const date = parseLocalDate(value);
  return date ? date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date unavailable';
}

/**
 * Groups flat Leave documents (one per day) back into their original
 * requests, using groupId. Older leaves created before groupId existed
 * fall back to being their own single-day group (keyed by _id).
 */
function groupLeaves(leaves) {
  const groups = new Map();

  for (const leave of leaves) {
    const key = leave.groupId || leave._id;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(leave);
  }

  return Array.from(groups.values()).map((days) => {
    days.sort((a, b) => (parseLocalDate(a.date)?.getTime() ?? 0) - (parseLocalDate(b.date)?.getTime() ?? 0));
    const statuses = new Set(days.map((d) => String(d.status || 'pending').toLowerCase()));

    let status;
    if (statuses.has('pending')) status = 'pending';
    else if (statuses.size === 1) status = [...statuses][0];
    else status = 'mixed';

    const firstDay = days[0];
    // Support both the API's raw leave-type value and populated/name fields.
    const rawType = firstDay.leaveTypeName ?? firstDay.leaveTypeLabel ?? firstDay.leaveType ?? firstDay.typeName ?? firstDay.type ?? firstDay.leave_type ?? firstDay.leaveTypeId ?? firstDay.leaveTypeID;
    const rawTypeValue = rawType && typeof rawType === 'object'
      ? (rawType.label ?? rawType.name ?? rawType.title ?? rawType.value ?? rawType.typeName ?? rawType.type ?? rawType._id ?? rawType.id ?? '')
      : rawType;
    const normalizedType = String(rawTypeValue ?? '').trim();
    const typeLabel = LEAVE_TYPES.find((t) => String(t.value).toLowerCase() === normalizedType.toLowerCase())?.label
      || (normalizedType ? normalizedType.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : 'Leave request');

    return {
      key: days[0].groupId || days[0]._id,
      startDate: days[0].date,
      endDate: days[days.length - 1].date,
      leaveTypeLabel: typeLabel,
      reason: firstDay.reason ?? firstDay.description ?? firstDay.remarks ?? '',
      status,
      sortDate: days[0].date,
    };
  });
}

export default function LeavePage() {
  const [fromDate, setFromDate] = useState(tomorrowISO());
  const [toDate, setToDate] = useState(tomorrowISO());
  const [dayType, setDayType] = useState('full'); // Part 8 default: Full Day
  const [leaveType, setLeaveType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState('upcoming');

  async function loadMyLeaves() {
    const data = await leaveService.listMine();
    setMyLeaves(data);
  }

  async function loadBalance() {
    const data = await leaveBalanceService.getMyLeaveBalance();
    setBalance(data);
  }

  async function loadAll() {
    setLoading(true);
    try {
      await Promise.all([loadMyLeaves(), loadBalance()]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const duration = calculateLeaveDuration(fromDate, toDate, dayType);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!leaveType) {
      setMessage({ type: 'error', text: 'Please select a leave type.' });
      return;
    }
    if (toDate < fromDate) {
      setMessage({ type: 'error', text: 'End date cannot be before the start date.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const created = await leaveService.requestLeave({ date: fromDate, toDate, leaveType, dayType });
      const dayCount = Array.isArray(created) ? created.length : 1;
      setMessage({
        type: 'success',
        text: `Leave request sent for approval (${dayCount} day${dayCount > 1 ? 's' : ''}).`,
      });
      setLeaveType('');
      setDayType('full');
      loadAll();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit request.' });
    } finally {
      setSubmitting(false);
    }
  }

  const groups = groupLeaves(myLeaves).sort((a, b) => (parseLocalDate(b.sortDate)?.getTime() ?? 0) - (parseLocalDate(a.sortDate)?.getTime() ?? 0));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = groups.filter((g) => { const date = parseLocalDate(g.endDate); return date && date >= today; });
  const past = groups.filter((g) => { const date = parseLocalDate(g.endDate); return date && date < today; });

  const renderGroup = (group) => {
    const status = (group.status || 'pending').toLowerCase();
    const statusStyles = {
      approved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
      pending: 'bg-amber-50 text-amber-700 ring-amber-100',
      rejected: 'bg-rose-50 text-rose-700 ring-rose-100',
      mixed: 'bg-violet-50 text-violet-700 ring-violet-100',
    };
    const type = String(group.leaveTypeLabel || '').toLowerCase();
    const typeStyle = type.includes('sick')
      ? { panel: 'bg-rose-50 text-rose-600', icon: <HeartPulse size={16} /> }
      : type.includes('earned') || type.includes('privilege')
        ? { panel: 'bg-violet-50 text-violet-600', icon: <Star size={16} /> }
        : type.includes('casual')
          ? { panel: 'bg-emerald-50 text-emerald-700', icon: <CalendarDays size={16} /> }
          : { panel: 'bg-blue-50 text-blue-600', icon: <FileText size={16} /> };
    const start = parseLocalDate(group.startDate);
    const end = parseLocalDate(group.endDate);
    const sameDay = dateOnly(group.startDate) === dateOnly(group.endDate);
    const dateLabel = sameDay
      ? shortDate(group.startDate)
      : `${shortDate(group.startDate)} – ${shortDate(group.endDate)}`;
    const monthLabel = start ? start.toLocaleDateString([], { month: 'short' }).toUpperCase() : 'DATE';
    const dayLabel = start ? (sameDay ? start.getDate() : `${start.getDate()}–${end ? end.getDate() : '?'}`) : '—';
    const yearLabel = start ? start.getFullYear() : '';

    return (
      <article key={group.key} className="group flex min-w-0 items-center gap-2 rounded-[16px] border border-blue-100/90 bg-white px-2.5 py-2 shadow-[0_4px_14px_rgba(52,90,160,0.07)] transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:gap-3 sm:px-3 sm:py-2.5">
        <div className="flex h-[48px] w-[48px] shrink-0 flex-col items-center justify-center rounded-[15px] bg-blue-50 text-blue-600">
          
          <span className="text-2xl font-bold leading-tight">
            {new Date(group.startDate).getDate()}
          </span>
          <span className="text-xs font-semibold uppercase">
            {new Date(group.startDate).toLocaleDateString('en-US', {
              month: 'short',
            })}
          </span>
        </div>
        <div className="h-12 w-px shrink-0 bg-indigo-100" />
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs sm:h-8 sm:w-8 sm:text-sm ${typeStyle.panel}`} aria-hidden="true">
          {typeStyle.icon}
        </div>
        <div className="min-w-0 flex-1 py-1">
          <p className="truncate text-[10px] font-bold text-slate-900 sm:text-xs">{group.leaveTypeLabel || 'Leave request'}</p>
          <p className="mt-0.5 text-[10px] font-medium leading-snug text-slate-700 sm:mt-1 sm:text-xs">{dateLabel}</p>
          <p className="mt-0.5 truncate text-[9px] text-slate-500 sm:mt-1 sm:text-[10px]">{group.reason || 'Leave request'}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-bold capitalize ring-1 ring-inset sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[10px] ${statusStyles[status] || statusStyles.pending}`}>
            {status === 'approved' ? '✓' : status === 'rejected' ? '×' : status === 'mixed' ? '◐' : '•'} {status}
          </span>
          <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0 text-slate-400 sm:h-4 sm:w-4" aria-hidden="true"><path d="m7 4 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </article>
    );
  };

  return (
    <div className="mx-auto max-w-md px-4 pt-6">
      <LeaveBalanceSection
        balance={balance}
        leaveHistoryCount={myLeaves.length}
        onHistoryClick={() => setHistoryOpen(true)}
      />

      <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-gray-900">Request Leave</p>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-600">From</label>
            <input
              type="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                if (toDate < e.target.value) setToDate(e.target.value);
                if (toDate !== e.target.value) setDayType('full');
              }}
              className="w-full rounded-full border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-600">To</label>
            <input
              type="date"
              required
              min={fromDate}
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                if (fromDate !== e.target.value) setDayType('full');
              }}
              className="w-full rounded-full border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <LeaveTypeDropdown value={leaveType} onChange={setLeaveType} balance={balance} />
        </div>
        <DayTypeSelector value={dayType} onChange={setDayType} singleDayOnly={fromDate === toDate} />

        <p className="text-xs text-gray-500">
          Requested duration: <span className="font-semibold text-gray-700">{duration} day{duration !== 1 ? 's' : ''}</span>
        </p>

        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}
        <Button type="submit" loading={submitting} className="w-full">
          Submit Request
        </Button>
      </form>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Leave History" variant="leave-history">
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 gap-3 sm:mb-6 sm:gap-4">
              <button type="button" onClick={() => setHistoryTab('upcoming')} className="group relative overflow-hidden rounded-[22px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100/80 p-4 text-left transition hover:shadow-md sm:p-5">
                <div className="absolute -bottom-8 -left-3 h-20 w-32 rounded-full bg-emerald-200/30" />
                <div className="relative flex items-start justify-between gap-2">
                  <div><p className="text-xs font-semibold text-slate-600">Upcoming</p><p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{upcoming.length}</p><p className="mt-0.5 text-xs text-slate-600">leave requests</p></div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-200/70 text-lg text-emerald-700">✓</span>
                </div>
              </button>
              <button type="button" onClick={() => setHistoryTab('past')} className="group relative overflow-hidden rounded-[22px] border border-indigo-100 bg-gradient-to-br from-violet-50 via-indigo-50 to-indigo-100/80 p-4 text-left transition hover:shadow-md sm:p-5">
                <div className="absolute -bottom-8 -left-3 h-20 w-32 rounded-full bg-indigo-200/30" />
                <div className="relative flex items-start justify-between gap-2">
                  <div><p className="text-xs font-semibold text-slate-600">Past</p><p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{past.length}</p><p className="mt-0.5 text-xs text-slate-600">leave requests</p></div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-200/70 text-lg text-indigo-700">◷</span>
                </div>
              </button>
            </div>

            <div className="mb-5 flex rounded-full border border-indigo-100 bg-slate-100/80 p-1">
              <button type="button" onClick={() => setHistoryTab('upcoming')} className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 py-3 text-sm font-bold transition ${historyTab === 'upcoming' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-white/70'}`}>
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.7" /><path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
                <span>Upcoming</span><span className={`rounded-full px-2 py-0.5 text-xs ${historyTab === 'upcoming' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>{upcoming.length}</span>
              </button>
              <button type="button" onClick={() => setHistoryTab('past')} className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 py-3 text-sm font-bold transition ${historyTab === 'past' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-white/70'}`}>
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true"><path d="M3 12a9 9 0 1 0 2.7-6.4L3 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 3v5h5m4-1v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span>Past</span><span className={`rounded-full px-2 py-0.5 text-xs ${historyTab === 'past' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>{past.length}</span>
              </button>
            </div>

            {historyTab === 'upcoming' ? (
              <section>
                <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-bold tracking-tight text-slate-900">Upcoming Requests</h2><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">{upcoming.length}</span></div>
                {upcoming.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center"><p className="text-sm font-semibold text-slate-700">No upcoming requests</p><p className="mt-1 text-xs text-slate-500">Your future leave requests will appear here.</p></div> : <div className="space-y-3">{upcoming.map(renderGroup)}</div>}
              </section>
            ) : (
              <section>
                <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-bold tracking-tight text-slate-900">Past Requests</h2><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">{past.length}</span></div>
                {past.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center"><p className="text-sm font-semibold text-slate-700">No past requests</p><p className="mt-1 text-xs text-slate-500">Completed leave history will appear here.</p></div> : <div className="space-y-3">{past.map(renderGroup)}</div>}
              </section>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}