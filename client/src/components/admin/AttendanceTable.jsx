import React from 'react';
import Table from '../common/Table.jsx';

function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AttendanceTable({ data }) {
  const columns = [
    {
  key: 'name',
  header: 'Name',
  render: (row) => (
    <span className="font-bold uppercase">
      {row.name || '—'}
    </span>
  ),
},
{
  key: 'employeeCode',
  header: 'Code',
  render: (row) => (
    <span className="whitespace-nowrap font-semibold">
      {row.employeeCode || ''}
    </span>
  ),
},
    {
  key: 'firstIn',
  header: 'In',
  render: (row) => (
    <span className="whitespace-nowrap font-semibold">
      {formatTime(row.firstIn)}
    </span>
  ),
},
{
  key: 'lastOut',
  header: 'Out',
  render: (row) => (
    <span className="whitespace-nowrap font-semibold ">
      {formatTime(row.lastOut)}
    </span>
  ),
},
    {
      key: 'address',
      header: 'Address',
      render: (row) => (
        <span className="line-clamp-3 break-words text-xs font-semibold leading-4" title={row.address || ''}>
          {row.address || ''}
        </span>
      ),
    },
    {
  key: 'coordinates',
  header: 'Location',
  render: (row) =>
    row.latitude !== undefined && row.latitude !== null ? (
      <span className="line-clamp-3 text-xs font-semibold ">
        {`${row.latitude.toFixed(5)}, ${row.longitude.toFixed(5)}`}
      </span>
    ) : (
      ''
    ),
},
    {
      key: 'hasAdminEntry',
      header: 'Source',
      render: (row) =>
        row.hasAdminEntry ? (
          <span className="inline-flex whitespace-nowrap items-center rounded-full bg-amber-300 px-3 py-2 text-xs font-medium text-amber-800">
            By Admin
          </span>
        ) : (
          <span className="inline-flex whitespace-nowrap items-center rounded-full bg-green-300 px-3 py-2 text-xs font-medium text-green-800">
            Self Punch
          </span>
        ),
    },
  ];

  return <Table columns={columns} data={data} emptyLabel="No attendance recorded for this day" />;


}