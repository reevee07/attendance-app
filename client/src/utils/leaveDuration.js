/**
 * Part 11: Leave duration calculation, kept as a standalone reusable
 * function so both the live UI preview and the eventual backend-facing
 * submit logic can share the exact same math.
 *
 * dayType is one of: 'full', 'firstHalf', 'secondHalf'
 */
export function calculateLeaveDuration(fromDate, toDate, dayType) {
  if (!fromDate || !toDate) return 0;

  const start = new Date(fromDate);
  const end = new Date(toDate);
  if (end < start) return 0;

  const dayCount = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Half-day options only make sense for a single-day request. For a
  // multi-day range, First/Second Half still only shaves half a day off
  // the LAST day (a common HRMS convention) - everything else counts full.
  if (dayType === 'full') return dayCount;
  if (dayCount === 1) return 0.5;
  return dayCount - 0.5;
}