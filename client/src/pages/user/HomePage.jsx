import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Bell,
  History,
  Fingerprint,
  CalendarPlus,
  Clock3,
} from "lucide-react";

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
    const interval = setInterval(
      () => setNow(new Date()),
      60000
    );

    return () => clearInterval(interval);
  }, []);


  const punch = usePunch(loadHistory);


  const today = days.find(
    (d) => d.dateKey === new Date().toISOString().slice(0, 10)
  );


  const isCheckedIn = !!today?.firstIn && !today?.lastOut;
  const hasCheckedInToday = !!today?.firstIn;


  const hoursMinutes = today?.firstIn
    ? today.lastOut
      ? today.durationMinutes
      : Math.round((now - new Date(today.firstIn)) / 60000)
    : 0;


  const hoursPercent = Math.min(
    Math.round((hoursMinutes / 480) * 100),
    100
  );


  if (loading) return <Loader />;


  return (
    <div className="relative mx-auto min-h-screen max-w-md overflow-hidden bg-gradient-to-b from-blue-50 via-slate-50 to-blue-50">

      {/* =========================================================
          BACKGROUND EFFECTS
      ========================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Top glow */}
        <div className="absolute -left-24 top-28 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

        {/* Middle glow */}
        <div className="absolute -right-28 top-[420px] h-72 w-72 rounded-full bg-cyan-100/40 blur-3xl" />

        {/* Bottom glow */}
        <div className="absolute -left-28 bottom-24 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />

      </div>


      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 px-6 pb-12 pt-7">

        {/* Header decorative glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/15 blur-2xl" />

        <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-72 rounded-full bg-blue-300/25 blur-2xl" />


        <div className="relative flex items-center justify-between">

          {/* =====================================================
              PROFILE
          ===================================================== */}

          <div className="flex items-center gap-4">

            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.name}
                className="h-16 w-16 rounded-full border-2 border-white/80 object-cover shadow-lg ring-2 ring-white/20"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/80 bg-white text-lg font-bold text-blue-700 shadow-lg ring-2 ring-white/20">
                {getInitials(user.name)}
              </div>
            )}

            <div className="min-w-0">


              {/* Employee Name */}
              <h1 className="mt-1 font-medium text-2xl text-white/90">
                {user.name}
              </h1>

              {/* Employee Designation */}
              <p className=" truncate text-sm  tracking-tight text-white">
                {user.designation}
              </p>


            </div>

          </div>


          {/* =====================================================
              NOTIFICATION
          ===================================================== */}

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-blue-700/40 text-white shadow-md backdrop-blur-md transition hover:bg-white/20 active:scale-95"
          >
            <Bell size={21} strokeWidth={2} />

            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-blue-500" />
          </button>

        </div>

      </div>


      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}

      <div className="relative z-10 -mt-7 space-y-5 px-5 pb-28">


        {/* =======================================================
            STEP 2 — QUICK ACTIONS
        ======================================================= */}

        <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/95 p-4 shadow-[0_12px_35px_rgba(30,64,175,0.10)] backdrop-blur-xl">

          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-100/40 blur-2xl" />

          <div className="pointer-events-none absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-indigo-100/30 blur-2xl" />


          <div className="relative grid grid-cols-3">


            {/* History */}

            <Link
              to="/user/attendance"
              className="group flex flex-col items-center gap-2.5"
            >

              <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full border-[3px] border-blue-500 bg-blue-50 text-blue-600 shadow-[0_5px_15px_rgba(59,130,246,0.15)] transition-all duration-200 group-hover:scale-105 group-hover:bg-blue-100 group-active:scale-95">

                <History
                  size={27}
                  strokeWidth={1.8}
                />

              </div>


              <span className="text-[12px] font-medium text-gray-700">
                History
              </span>

            </Link>



            {/* Punch Attendance */}

            <button
              onClick={punch.openModal}
              className="group flex flex-col items-center gap-2.5"
            >

              <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full border-[3px] border-indigo-500 bg-indigo-50 text-indigo-600 shadow-[0_5px_15px_rgba(99,102,241,0.15)] transition-all duration-200 group-hover:scale-105 group-hover:bg-indigo-100 group-active:scale-95">

                <Fingerprint
                  size={28}
                  strokeWidth={1.8}
                />

              </div>


              <span className="text-[12px] font-medium text-gray-700">
                Punch Attendance
              </span>

            </button>



            {/* Request Leave */}

            <Link
              to="/user/leave"
              className="group flex flex-col items-center gap-2.5"
            >

              <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full border-[3px] border-teal-500 bg-teal-50 text-teal-600 shadow-[0_5px_15px_rgba(20,184,166,0.15)] transition-all duration-200 group-hover:scale-105 group-hover:bg-teal-100 group-active:scale-95">

                <CalendarPlus
                  size={27}
                  strokeWidth={1.8}
                />

              </div>


              <span className="text-[12px] font-medium text-gray-700">
                Request Leave
              </span>

            </Link>

          </div>

        </div>



        {/* =======================================================
            STEP 3 — TODAY'S ATTENDANCE
        ======================================================= */}

        <div className="relative overflow-hidden rounded-[28px] border border-white/90 bg-white/95 p-4 shadow-[0_12px_35px_rgba(30,64,175,0.09)] backdrop-blur-xl">


          {/* Green glow when checked in */}

          {isCheckedIn && (
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-green-100/60 blur-3xl" />
          )}


          {/* Soft blue glow */}

          <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-blue-100/40 blur-3xl" />


          <div className="relative">


            {/* Title */}

            <div className="mb-2.5 flex items-center gap-2">

              <span
                className={`h-2 w-2 rounded-full transition-colors ${hasCheckedInToday
                  ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                  : "bg-gray-300"
                  }`}
              />

              <p className="text-[14px] font-semibold tracking-tight text-gray-900">
                Today's Attendance
              </p>

            </div>


            {/* Status */}

            <span
              className={`mb-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${isCheckedIn
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


            {/* Time + Punch Button */}

            <div className="flex items-end justify-between">


              {/* First punch time */}

              <div>

                {today?.firstIn && (
                  <p className="mb-1 text-[22px] font-bold tracking-tight text-gray-900">

                    {new Date(
                      today.firstIn
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}

                  </p>
                )}


                <p className="text-xs font-medium text-gray-500">

                  {new Date().toLocaleDateString([], {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}

                </p>

              </div>



              {/* Punch Button */}

              <button
                onClick={punch.openModal}
                className={`relative flex h-12 w-[82px] items-center justify-center rounded-full text-base font-bold text-white transition-all duration-200 active:scale-95 ${isCheckedIn
                  ? "bg-red-600 shadow-[0_5px_18px_rgba(239,68,68,0.30)] ring-4 ring-red-200 hover:bg-red-700"
                  : "bg-green-600 shadow-[0_5px_18px_rgba(34,197,94,0.30)] ring-4 ring-green-200 hover:bg-green-700"
                  }`}
              >

                <span className="absolute inset-[3px] rounded-full border border-white/20" />

                <span className="relative">
                  {isCheckedIn ? "Out" : "In"}
                </span>

              </button>

            </div>

          </div>

        </div>



        {/* =======================================================
            STEP 4 — TODAY'S HOURS
        ======================================================= */}



        <div className="relative overflow-hidden rounded-3xl border border-white/90 bg-white/95 p-4 shadow-[0_12px_35px_rgba(30,64,175,0.08)] backdrop-blur-xl">


          {/* Decorative glow */}

          <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-100/40 blur-2xl" />


          <div className="relative">


            {/* Hours + Percentage */}

            <div className="flex items-center justify-between">


              {/* Hours */}

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">

                  <Clock3
                    size={18}
                    strokeWidth={2}
                  />

                </div>


                <p className="text-xl font-bold tracking-tight text-gray-900">

                  {formatDuration(hoursMinutes)}{" "}

                  <span className="text-sm font-normal text-gray-400">
                    / 8h
                  </span>

                </p>

              </div>


              {/* Percentage */}

              <div className="text-lg font-bold text-blue-600">
                {hoursPercent}%
              </div>

            </div>


            {/* Progress bar */}

            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                style={{
                  width: `${hoursPercent}%`,
                }}
              />

            </div>

          </div>

        </div>



        {/* =======================================================
            RECENT ATTENDANCE
        ======================================================= */}

        <div className="relative overflow-hidden rounded-[28px] border border-white/90 bg-white/95 p-4 shadow-[0_12px_35px_rgba(30,64,175,0.08)] backdrop-blur-xl">


          {/* Decorative glow */}

          <div className="pointer-events-none absolute -bottom-12 -right-12 h-28 w-28 rounded-full bg-blue-100/30 blur-2xl" />


          <div className="relative">


            {/* Header */}

            <div className="mb-3 flex items-center justify-between">

              <p className="text-[14px] font-semibold tracking-tight text-gray-900">
                Recent Attendance
              </p>


              <Link
                to="/user/attendance"
                className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
              >
                View All
              </Link>

            </div>


            {/* Attendance List */}

            <div className="divide-y divide-gray-100">

              {days.slice(0, 4).map((day) => (

                <div
                  key={day.dateKey}
                  className="flex items-center justify-between py-3"
                >


                  {/* Date + Times */}

                  <div className="flex items-center gap-3">


                    {/* Status dot */}

                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${day.status === "No Punch"
                        ? "bg-gray-300"
                        : "bg-green-500"
                        }`}
                    />


                    <div>

                      <p className="text-sm font-medium text-gray-800">
                        {formatDayLabel(day.date)}
                      </p>


                      <p className="mt-0.5 text-xs text-gray-400">

                        {day.firstIn
                          ? new Date(
                            day.firstIn
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "—"}

                        {" – "}

                        {day.lastOut
                          ? new Date(
                            day.lastOut
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : "—"}

                      </p>

                    </div>

                  </div>


                  {/* Status */}

                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-700">

                    {day.status}

                  </span>

                </div>

              ))}


              {/* Empty State */}

              {days.length === 0 && (

                <p className="py-5 text-center text-sm text-gray-400">
                  No attendance yet
                </p>

              )}

            </div>

          </div>

        </div>

      </div>



      {/* =========================================================
          LOCATION CONFIRMATION MODAL
      ========================================================= */}

      <Modal
        open={punch.open}
        onClose={punch.closeModal}
        title="Location Confirmation"
      >

        <div className="space-y-4 px-1">

          <LocationStatus
            location={punch.location}
            loading={punch.locLoading}
            error={punch.locError}
            address={punch.address}
            addressLoading={punch.addressLoading}
          />


          {punch.error && (
            <p className="text-sm text-red-600">
              {punch.error}
            </p>
          )}


          <Button
            onClick={punch.handleSubmit}
            loading={punch.submitting}
            disabled={!punch.canPunch}          >
            Confirm Punch
          </Button>

        </div>

      </Modal>

    </div>
  );
}