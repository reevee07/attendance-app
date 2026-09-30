import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from 'lucide-react';

import { History, Fingerprint, CalendarPlus } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { usePunch } from "../../hooks/usePunch";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";
import LocationStatus from "../../components/user/LocationStatus.jsx";
import Loader from "../../components/common/Loader.jsx";
import * as attendanceService from "../../services/attendanceService";
import {
  groupPunchesByDay,
  formatDuration,
  formatDayLabel,
} from "../../utils/groupAttendance";

function getInitials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function HomePage() {
  const { user } = useAuth();
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  async function loadHistory() {
    setLoading(true);
    try {
      const data = await attendanceService.myHistory();
      setDays(groupPunchesByDay(data));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  // Tick every minute so "Today's Hours" stays roughly live while checked in.
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const punch = usePunch(loadHistory);

  const today = days.find(
    (d) => d.dateKey === new Date().toISOString().slice(0, 10),
  );
  const isCheckedIn = !!today?.firstIn && !today?.lastOut;
  const hasCheckedInToday = !!today?.firstIn;

  const hoursMinutes = today?.firstIn
    ? today.lastOut
      ? today.durationMinutes
      : Math.round((now - new Date(today.firstIn)) / 60000)
    : 0;
  const hoursPercent = Math.min(Math.round((hoursMinutes / 480) * 100), 100); // 480min = 8h target

  if (loading) return <Loader />;

  return (
    <div className="mx-auto max-w-md">
      <div className="bg-gradient-to-b from-blue-500 to-blue-400 px-5 pb-6 pt-6">
  <div className="flex items-center justify-between">

    {/* Profile */}
    <div className="flex items-center gap-3">
      {user.photoUrl ? (
        <img
          src={user.photoUrl}
          alt={user.name}
          className="h-14 w-14 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-brand-700">
          {getInitials(user.name)}
        </div>
      )}

      <div>
        <p className="text-sm text-blue-900">Welcomee,</p>

        <h1 className="text-xl font-bold text-blue-950">
          {user.name}
        </h1>
      </div>
    </div>

    {/* Notification */}
    <button
      type="button"
      aria-label="Notifications"
      className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 text-white backdrop-blur-sm transition hover:bg-white/30 active:scale-95"
    >
      <Bell size={20} strokeWidth={2} />

      {/* Notification dot */}
      <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-blue-500" />
    </button>

  </div>
</div>

      <div className="-mt-3 space-y-4 px-4">
        {/* Quick actions */}
        <div className="flex justify-around rounded-t-3xl border border-gray-200 bg-white p-4 shadow-sm">
          <Link
            to="/user/attendance"
            className="flex flex-col items-center      gap-2"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-blue-500 bg-blue-100 text-blue-600">
              <History size={27} />
            </div>
            <span className="text-xs font-medium text-gray-700">History</span>
          </Link>
          <button
            onClick={punch.openModal}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-indigo-500 bg-indigo-100 text-indigo-600">
              <Fingerprint size={28} />
            </div>
            <span className="text-xs font-medium text-gray-700">
              Punch Attendance
            </span>
          </button>
          <Link to="/user/leave" className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-teal-500 bg-teal-100 text-teal-600">
              <CalendarPlus size={27} />
            </div>
            <span className="text-xs font-medium text-gray-700">
              Request Leave
            </span>
          </Link>
        </div>

        {/* Today's Attendance */}
        <div className="rounded-0xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${hasCheckedInToday ? "bg-green-500" : "bg-gray-300"}`}
            />
            <p className="text-sm font-semibold text-gray-900">
              Today's Attendance
            </p>
          </div>

          <span
            className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isCheckedIn
                ? "bg-green-100 text-green-700"
                : hasCheckedInToday
                  ? "bg-gray-100 text-gray-600"
                  : "bg-amber-100 text-amber-700"
            }`}
          >
            {isCheckedIn
              ? "Checked In"
              : hasCheckedInToday
                ? "Checked Out"
                : "Not Checked In"}
          </span>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {today?.firstIn
                  ? new Date(today.firstIn).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </p>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString([], {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <button
              onClick={punch.openModal}
              className={`flex h-11 w-20 items-center justify-center rounded-full text-xl font-semibold text-white shadow-md transition-all duration-200 ${
                isCheckedIn
                  ? "bg-red-700 border-4 border-red-500 ring-4 ring-red-300 hover:bg-red-900 "
                  : "bg-green-700 border-4 border-green-500 ring-4 ring-green-300 hover:bg-green-900 "
              }`}
            >
              {isCheckedIn ? <>Out</> : <>In</>}
            </button>
          </div>
        </div>

        {/* Today's Hours */}
        <div className="rounded-0xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">
                {formatDuration(hoursMinutes)}{" "}
                <span className="text-sm font-normal text-gray-400">/ 8h</span>
              </p>
            </div>
            <div className="text-lg font-bold text-brand-600">
              {hoursPercent}%
            </div>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-brand-600"
              style={{ width: `${hoursPercent}%` }}
            />
          </div>
        </div>

        {/* Recent Attendance preview */}
        <div className="rounded-0xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">
              Recent Attendance
            </p>
            <Link
              to="/user/attendance"
              className="text-xs font-medium text-brand-600"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {days.slice(0, 4).map((day) => (
              <div
                key={day.dateKey}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      day.status === "No Punch" ? "bg-gray-300" : "bg-green-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {formatDayLabel(day.date)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {day.firstIn
                        ? new Date(day.firstIn).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                      {" – "}
                      {day.lastOut
                        ? new Date(day.lastOut).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                  {day.status}
                </span>
              </div>
            ))}
            {days.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400">
                No attendance yet
              </p>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={punch.open}
        onClose={punch.closeModal}
        title="Location Confirmation"
      >
        <div className="space-y-4 px-1  ">
          <LocationStatus
            location={punch.location}
            loading={punch.locLoading}
            error={punch.locError}
            address={punch.address}
            addressLoading={punch.addressLoading}
          />
          {punch.error && <p className="text-sm text-red-600">{punch.error}</p>}
          <Button
            onClick={punch.handleSubmit}
            loading={punch.submitting}
            disabled={!punch.location}
            className="w-full"
          >
            Confirm Punch
          </Button>
        </div>
      </Modal>
    </div>
  );
}
