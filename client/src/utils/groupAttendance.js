/**
 * Groups a flat list of punches (as returned by attendanceService.myHistory())
 * into one entry per calendar day. Input can be in any order.
 *
 * Per day it returns:
 *  - firstIn / lastOut: first IN and last OUT of the day
 *  - lastType: type of the last punch ('in' = currently checked in)
 *  - workedMinutes: total of every closed IN -> OUT round
 *  - openSince: start of a round that has not been closed yet (else null)
 *  - durationMinutes: workedMinutes, or null when no round has been closed
 *  - status: 'Present' | 'In Progress' | 'No Punch'
 */
export function groupPunchesByDay(punches) {
  const byDay = new Map();

  for (const punch of punches) {
    const day = new Date(punch.timestamp);
    const dayKey = day.toISOString().slice(0, 10);

    if (!byDay.has(dayKey)) {
      byDay.set(dayKey, { dateKey: dayKey, date: day, punches: [] });
    }
    byDay.get(dayKey).punches.push(punch);
  }

  return Array.from(byDay.values())
    .map(({ dateKey, date, punches: dayPunches }) => {
      const sorted = [...dayPunches].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      let firstIn = null;
      let lastOut = null;
      let openSince = null;
      let workedMs = 0;
      let closedRounds = 0;

      for (const p of sorted) {
        if (p.type === 'in') {
          if (!firstIn) firstIn = p.timestamp;
          if (!openSince) openSince = p.timestamp;
        } else if (p.type === 'out') {
          lastOut = p.timestamp;
          if (openSince) {
            workedMs += new Date(p.timestamp) - new Date(openSince);
            closedRounds += 1;
            openSince = null;
          }
        }
      }

      const lastType = sorted.length ? sorted[sorted.length - 1].type : null;
      const workedMinutes = Math.round(workedMs / 60000);

      let status = 'No Punch';
      if (firstIn) status = lastType === 'in' ? 'In Progress' : 'Present';

      return {
        dateKey,
        date,
        firstIn,
        lastOut,
        lastType,
        openSince,
        workedMinutes,
        durationMinutes: closedRounds > 0 ? workedMinutes : null,
        status,
      };
    })
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