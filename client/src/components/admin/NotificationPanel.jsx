import React, { useEffect, useState } from 'react';
import {
  CalendarClock,
  ChevronRight,
  Sun,
  HeartPulse,
  Briefcase,
  Home,
  Wallet,
  CalendarDays,
  X,
  Check,
} from 'lucide-react';
import Loader from '../common/Loader.jsx';
import * as leaveService from '../../services/leaveService';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

// "leaveWithoutPay" -> "Leave Without Pay"
function prettifyType(type = '') {
  const spaced = type.replace(/([A-Z])/g, ' $1').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Icon + colors per leave type. Unknown types use the default.
function getLeaveStyle(type = '') {
  const t = type.toLowerCase();
  if (t.includes('casual'))
    return { Icon: Sun, pill: 'bg-blue-50', text: 'text-blue-600', row: 'bg-blue-50/40', ring: 'ring-blue-300' };
  if (t.includes('sick'))
    return { Icon: HeartPulse, pill: 'bg-green-50', text: 'text-green-600', row: 'bg-green-50/40', ring: 'ring-green-300' };
  if (t.includes('personal'))
    return { Icon: Briefcase, pill: 'bg-purple-50', text: 'text-purple-600', row: 'bg-purple-50/40', ring: 'ring-purple-300' };
  if (t.includes('home') || t.includes('wfh'))
    return { Icon: Home, pill: 'bg-sky-50', text: 'text-sky-600', row: 'bg-sky-50/40', ring: 'ring-sky-300' };
  if (t.includes('withoutpay') || t.includes('unpaid'))
    return { Icon: Wallet, pill: 'bg-orange-50', text: 'text-orange-600', row: 'bg-orange-50/40', ring: 'ring-orange-300' };
  return { Icon: CalendarDays, pill: 'bg-amber-50', text: 'text-amber-600', row: 'bg-amber-50/40', ring: 'ring-amber-300' };
}

// "2 hours ago" from createdAt
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}


const PHOTO_FIELD = 'photoUrl'; // <-- must match the field name in your Employee model

// Handles full URLs (Cloudinary/S3), base64 data, and relative server paths
function resolvePhoto(photo) {
  if (!photo || typeof photo !== 'string') return null;
  if (/^(https?:|data:)/.test(photo)) return photo;
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
  return `${base}/${photo.replace(/^\//, '')}`;
}

function Avatar({ name = '', photo, ringClass = 'ring-gray-300' }) {
  const [failed, setFailed] = useState(false);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  if (photo && !failed) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setFailed(true)}
        className={`h-11 w-11 shrink-0 rounded-full object-cover ring-2 ${ringClass}`}
      />
    );
  }

  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-gray-700 ring-2 ${ringClass}`}
    >
      {initials || '?'}
    </div>
  );
}

export default function NotificationPanel() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decidingId, setDecidingId] = useState(null);

  async function loadLeaves() {
    setLoading(true);
    try {
      const data = await leaveService.listPendingLeaves();
      setLeaves(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  async function handleDecision(id, decision) {
    setDecidingId(id);
    try {
      await leaveService.decideLeave(id, decision);
      setLeaves((prev) => prev.filter((leave) => leave._id !== id));
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <CalendarClock size={18} className="text-blue-600" />
          Leave Request
        </h2>
        {/* Add onClick or a router link here when you have a "all leaves" page */}
        <button
          type="button"
          className="flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          View All
          <ChevronRight size={14} />
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : leaves.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">No pending requests</p>
      ) : (
        <div className="space-y-3">
          {leaves.map((leave) => {
            const { Icon, pill, text, row, ring } = getLeaveStyle(leave.leaveType);
            const name = leave.employeeId?.name || 'Unknown';
            const photo = resolvePhoto(leave.employeeId?.[PHOTO_FIELD]);
            const busy = decidingId === leave._id;
            const detail =
              leave.reason ||
              `${prettifyType(leave.dayType)}${leave.duration ? ` · ${leave.duration} day` : ''}`;

            return (
              <div
                key={leave._id}
                className={`flex items-center gap-3 rounded-full border border-gray-200 px-3 py-2 ${row}`}
              >
                {/* Avatar + name + time ago */}
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={name} photo={photo} ringClass={ring} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{timeAgo(leave.createdAt)}</p>
                  </div>
                </div>

                {/* Leave type pill */}
                <div className={`flex min-w-0 flex-1 items-center gap-2 rounded-full px-3 py-1.5 ${pill}`}>
                  <Icon size={18} className={`shrink-0 ${text}`} />
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-medium ${text}`}>{prettifyType(leave.leaveType)}</p>
                    <p className="truncate text-xs text-gray-500">
                      {formatDate(leave.date)} · {detail}
                    </p>
                  </div>
                </div>

                {/* Reject / Accept */}
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    aria-label="Reject"
                    disabled={busy}
                    onClick={() => handleDecision(leave._id, 'rejected')}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition hover:bg-red-600 disabled:opacity-50"
                  >
                    <X size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label="Accept"
                    disabled={busy}
                    onClick={() => handleDecision(leave._id, 'approved')}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}