const MOCK_BALANCE = {
  casualLeave: { allocated: 12, used: 4, available: 8 },
  sickLeave: { allocated: 10, used: 5, available: 5 },
  earnLeave: { allocated: 15, used: 3, available: 12 },
  specialLeave: { allocated: 0, used: 0, available: 0 }, // Part 3: default 0, admin-granted only
  leaveWithoutPay: { available: 0 }, // Part 4: not a paid balance, no "allocated"
  compOff: { earned: 2, used: 0, available: 2 }, // Part 5: will be auto-calculated later
};

export async function getMyLeaveBalance() {
  // Simulated network delay so loading states can be tested honestly.
  await new Promise((resolve) => setTimeout(resolve, 200));
  return MOCK_BALANCE;
}