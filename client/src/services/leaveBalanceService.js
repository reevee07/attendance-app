import api from './api';

/**
 * Real balance for the logged-in employee (Part 2). Casual/Sick/Earn and
 * Comp Off now come from the backend's LeaveBalance model. Leave Without
 * Pay has no backend record (Part 4 - it's not a tracked balance), so
 * it's added here as a constant for display consistency with the rest
 * of the Leave Balance grid.
 */
export async function getMyLeaveBalance() {
  const { data } = await api.get('/leave-balance/me');
  return {
    ...data.data,
    leaveWithoutPay: { available: 0 },
  };
}
