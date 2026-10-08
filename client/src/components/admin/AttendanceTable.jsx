import React from 'react';
import {
  User,
  ArrowUp,
  ArrowDown,
  Clock,
  MapPin,
  Map,
  CircleUserRound,
  AlertCircle,
} from 'lucide-react';

function formatTime(dateStr) {
  if (!dateStr) return '—';

  return new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ============================================================
   CHECK LATE STATUS
   Late if first punch is AFTER 10:10 AM
============================================================ */

function isLatePunch(dateStr) {
  if (!dateStr) return false;

  const date = new Date(dateStr);

  const hours = date.getHours();
  const minutes = date.getMinutes();

  // 10:10 AM is NOT late
  // 10:11 AM onwards is late
  return hours > 10 || (hours === 10 && minutes > 10);
}

/*
  Layout:

  Employee | IN | OUT

  Source is displayed below employee code.
*/
const ROW_GRID =
  'grid-cols-[minmax(220px,1fr)_minmax(0,3fr)_minmax(0,3fr)]';

function getInitials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/* ============================================================
   IN / OUT CARD
============================================================ */

function PunchGroup({
  time,
  lat,
  lng,
  address,
  tint,
  border,
  iconColor,
}) {
  return (
    <div
      className={`
        min-w-0
        w-full
        rounded-2xl
        border-l-4
        ${border}
        ${tint}
        px-3
        py-3
        flex
        items-start
        gap-2
      `}
    >
      {/* TIME */}

      <div className="shrink-0">
        <span
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-white
            border
            border-gray-200
            px-2
            py-1.5
            text-sm
            font-semibold
            text-blue-950
            whitespace-nowrap
          "
        >
          <Clock
            size={12}
            className={`shrink-0 ${iconColor}`}
          />

          <span>
            {time}
          </span>
        </span>
      </div>

      {/* ADDRESS + LOCATION */}

      <div
        className="
          min-w-0
          flex-1
          flex
          flex-col
          justify-center
          gap-0
        "
      >
        {/* ADDRESS */}

        <div
          className="
            flex
            items-start
            gap-2
            min-w-0
            text-sm
            font-medium
            leading-5
            text-blue-950
          "
        >
          <Map
            size={13}
            className={`mt-0.5 shrink-0 ${iconColor}`}
          />

          {address ? (
            <span
              className="
                min-w-0
                break-words
                whitespace-normal
              "
              title={address}
            >
              {address}
            </span>
          ) : (
            <span className="text-gray-400">
              Address
            </span>
          )}
        </div>

        {/* LOCATION */}

        <div
          className="
            flex
            items-center
            gap-2
            min-w-0
            text-sm
            font-medium
            leading-5
            text-blue-950
          "
        >
          <MapPin
            size={13}
            className={`shrink-0 ${iconColor}`}
          />

          {lat !== undefined && lat !== null ? (
            <span className="break-words">
              {lat.toFixed(5)}, {lng?.toFixed(5) ?? ''}
            </span>
          ) : (
            <span className="text-gray-400">
              Location
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ATTENDANCE TABLE
============================================================ */

export default function AttendanceTable({ data, onRowClick, emptyMessage }) {
  if (!data || data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-gray-400">
        {emptyMessage || 'No attendance recorded for this day'}
      </p>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <div className="w-full">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className={`
            ${ROW_GRID}
            mb-2
            grid
            w-full
            items-stretch
            gap-2
          `}
        >

          {/* ==================================================
              EMPLOYEE HEADER
          ================================================== */}

          <div
            className="
              flex
              min-w-0
              items-center
              gap-2
              px-2
              text-sm
              font-bold
              text-blue-950
            "
          >
            <User
              size={16}
              className="shrink-0"
            />

            <span>
              Employee
            </span>
          </div>

          {/* ==================================================
              IN HEADER
          ================================================== */}

          <div
            className="
              min-w-0
              overflow-hidden
              rounded-2xl
              bg-green-50
            "
          >

            {/* IN TITLE */}

            <div
              className="
                flex
                items-center
                gap-2
                bg-green-100
                px-3
                py-2
              "
            >
              <span
                className="
                  flex
                  h-6
                  w-6
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-green-600
                  text-white
                "
              >
                <ArrowUp size={14} />
              </span>

              <span className="text-sm font-bold text-green-800">
                IN
              </span>
            </div>

            {/* IN SUB HEADERS */}

            <div
              className="
                grid
                grid-cols-[85px_minmax(0,1fr)]
                gap-3
                px-3
                py-2
                text-xs
                font-semibold
                text-green-700
              "
            >
              <span>
                Time
              </span>

              <div className="grid grid-cols-2 gap-2">
                <span>
                  Address
                </span>

                <span>
                  Location
                </span>
              </div>
            </div>

          </div>

          {/* ==================================================
              OUT HEADER
          ================================================== */}

          <div
            className="
              min-w-0
              overflow-hidden
              rounded-2xl
              bg-red-50
            "
          >

            {/* OUT TITLE */}

            <div
              className="
                flex
                items-center
                gap-2
                bg-red-100
                px-3
                py-2
              "
            >
              <span
                className="
                  flex
                  h-6
                  w-6
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-red-500
                  text-white
                "
              >
                <ArrowDown size={14} />
              </span>

              <span className="text-sm font-bold text-red-800">
                OUT
              </span>
            </div>

            {/* OUT SUB HEADERS */}

            <div
              className="
                grid
                grid-cols-[85px_minmax(0,1fr)]
                gap-3
                px-3
                py-2
                text-xs
                font-semibold
                text-red-700
              "
            >
              <span>
                Time
              </span>

              <div className="grid grid-cols-2 gap-2">
                <span>
                  Address
                </span>

                <span>
                  Location
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* ====================================================
            DATA ROWS
        ==================================================== */}

        <div className="space-y-3">

          {data.map((row) => {

            const isLate = isLatePunch(row.firstIn);

            return (
              <div
                key={row.employeeId}
                role="button"
                tabIndex={0}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onRowClick?.(row);
                }}
                className={`
                  ${ROW_GRID}
                  grid
                  w-full
                  cursor-pointer
                  items-start
                  gap-2
                  rounded-2xl
                  border
                  border-gray-200
                  bg-white
                  p-3
                  shadow-sm
                  transition
                  hover:border-blue-300
                  hover:shadow-md
                `}
              >

                {/* =================================================
                    EMPLOYEE + SOURCE
                ================================================= */}

                <div
                  className="
                    flex
                    min-w-0
                    items-start
                    gap-3
                    px-1
                    py-2
                  "
                >

                  {/* INITIALS */}

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-blue-100
                      text-xs
                      font-bold
                      text-blue-700
                    "
                  >
                    {getInitials(row.name)}
                  </div>

                  {/* NAME + CODE + SOURCE */}

                  <div className="min-w-0">

                    {/* NAME */}

                    <div
                      className="
                        break-words
                        whitespace-normal
                        text-sm
                        font-bold
                        uppercase
                        leading-5
                        text-blue-950
                      "
                    >
                      {row.name || '—'}
                    </div>

                    {/* EMPLOYEE CODE */}

                    <div className="mt-1">
                      <span
                        className="
                          inline-flex
                          max-w-full
                          items-center
                          rounded-full
                          bg-gray-100
                          px-2.5
                          py-1
                          text-xs
                          font-bold
                          text-blue-950
                        "
                      >
                        {row.employeeCode || '—'}
                      </span>
                    </div>

                    {/* SOURCE */}

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">

                      {row.hasAdminEntry ? (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1
                            whitespace-nowrap
                            rounded-full
                            bg-amber-100
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            text-amber-800
                          "
                        >


                          <span>
                            By Admin
                          </span>
                        </span>
                      ) : (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1
                            whitespace-nowrap
                            rounded-full
                            bg-green-100
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            text-green-800
                          "
                        >


                          <span>
                            Self Punch
                          </span>
                        </span>
                      )}

                      {/* =================================================
                          LATE TAG
                      ================================================= */}

                      {isLate && (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1
                            whitespace-nowrap
                            rounded-full
                            bg-red-100
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            text-red-700
                          "
                        >


                          <span>
                            Late
                          </span>
                        </span>
                      )}

                    </div>

                  </div>

                </div>

                {/* =================================================
                    IN
                ================================================= */}

                <PunchGroup
                  time={formatTime(row.firstIn)}
                  lat={row.inLatitude}
                  lng={row.inLongitude}
                  address={row.inAddress}
                  tint="bg-green-50"
                  border="border-green-500"
                  iconColor="text-green-600"
                />

                {/* =================================================
                    OUT
                ================================================= */}

                <PunchGroup
                  time={formatTime(row.lastOut)}
                  lat={row.outLatitude}
                  lng={row.outLongitude}
                  address={row.outAddress}
                  tint="bg-red-50"
                  border="border-red-500"
                  iconColor="text-red-500"
                />

              </div>
            );
          })}

        </div>

      </div>
    </div>
  );
}