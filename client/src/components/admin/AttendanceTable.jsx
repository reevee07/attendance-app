import React from 'react';
import Table from '../common/Table.jsx';

function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Renders the admin daily summary: first-in / last-out per employee.
 * Rows with any admin-entered punch get a visible "Admin Entry" badge -
 * these are trust-based (no photo/location) and should never be mistaken
 * for a verified self-punch.
 */
export default function AttendanceTable({ data }) {
  const columns = [
    { key: 'name', header: 'Employee' },
    { key: 'email', header: 'Email' },
    {
      key: 'firstIn',
      header: 'First In',
      render: (row) => formatTime(row.firstIn),
    },
    {
      key: 'lastOut',
      header: 'Last Out',
      render: (row) => formatTime(row.lastOut),
    },
    { key: 'totalPunches', header: 'Punches' },
    {
      key: 'hasAdminEntry',
      header: 'Source',
      render: (row) =>
        row.hasAdminEntry ? (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            Admin Entry
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            Self Punch
          </span>
        ),
    },
  ];

  return <Table columns={columns} data={data} emptyLabel="No attendance recorded for this day" />;
}
