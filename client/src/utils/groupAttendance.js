
/**
 * Groups a flat list of punches (as returned by attendanceService.myHistory())
 * into one entry per calendar day, with that day's first-in, last-out,
 * a formatted duration, and a status label. Input can be in any order.
 */
export function groupPunchesByDay(punches) {
  const byDay = new Map();

  for (const punch of punches) {
    const day = new Date(punch.timestamp);
    const dayKey = day.toISOString().slice(0, 10);

    if (!byDay.has(dayKey)) {
      byDay.set(dayKey, { dateKey: dayKey, date: day, firstIn: null, lastOut: null });
    }
    const entry = byDay.get(dayKey);

    if (punch.type === 'in') {
      if (!entry.firstIn || new Date(punch.timestamp) < new Date(entry.firstIn)) {
        entry.firstIn = punch.timestamp;
      }
    } else if (punch.type === 'out') {
      if (!entry.lastOut || new Date(punch.timestamp) > new Date(entry.lastOut)) {
        entry.lastOut = punch.timestamp;
      }
    }
  }

  return Array.from(byDay.values())
    .map((entry) => ({
      ...entry,
      durationMinutes: entry.firstIn && entry.lastOut
        ? Math.round((new Date(entry.lastOut) - new Date(entry.firstIn)) / 60000)
        : null,
      status: entry.firstIn ? (entry.lastOut ? 'Present' : 'In Progress') : 'No Punch',
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function formatDuration(minutes) {
  if (minutes === null || minutes === undefined) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function formatDayLabel(date) {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return 'Today';
  return date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
}
