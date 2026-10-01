/**
 * Part 6: Total Leave Balance calculation, kept out of JSX on purpose
 * (Part 12 architecture rule) so it's testable and reusable independent
 * of any component.
 *
 * Deliberately excludes Leave Without Pay (not a paid balance) and
 * Leave History (informational, not a balance at all).
 */
export function computeTotalLeaveBalance(balance) {
  const { casualLeave, sickLeave, earnLeave, specialLeave, compOff } = balance;

  const available =
    casualLeave.available +
    sickLeave.available +
    earnLeave.available +
    specialLeave.available +
    compOff.available;

  const allocated =
    casualLeave.allocated +
    sickLeave.allocated +
    earnLeave.allocated +
    specialLeave.allocated +
    compOff.earned;

  return { available, allocated };
}