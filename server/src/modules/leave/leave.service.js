const mongoose = require('mongoose');
const Leave = require('./leave.model');
const LeaveBalance = require('../leaveBalance/leaveBalance.model');

// Types with no real balance to check against (Part 4: Leave Without Pay
// is never balance-checked). Comp Off/Special/Casual/Sick/Earn all go
// through the normal available-balance check.
const NO_BALANCE_CHECK_TYPES = ['leaveWithoutPay'];

async function requestLeave(employeeId, { date, toDate, leaveType, reason }) {
  if (!date) throw new Error('Start date is required');
  if (!leaveType) throw new Error('Leave type is required');

  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = toDate ? new Date(toDate) : new Date(date);
  endDate.setHours(0, 0, 0, 0);

  if (endDate < startDate) throw new Error('End date cannot be before start date');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (startDate < today) throw new Error('Leave date cannot be in the past');

  // Build one entry per calendar day in the range (inclusive)
  const days = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  // Block if any day in the range already has a pending request
  const existing = await Leave.findOne({ employeeId, status: 'pending', date: { $in: days } });
  if (existing) throw new Error('You already have a pending leave request overlapping this date range');

  // Part 10: check sufficient balance BEFORE creating any pending records
  // (pending requests already count against balance, same as approved -
  // you can't request more than you have even while awaiting a decision).
  if (!NO_BALANCE_CHECK_TYPES.includes(leaveType)) {
    const available = await getAvailableForType(employeeId, leaveType);
    if (days.length > available) {
      throw new Error(`Insufficient balance: ${available} day(s) available, ${days.length} requested`);
    }
  }

  // All days from this one submission share a groupId, so the frontend can
  // display them as a single "period" instead of separate single-day rows.
  const groupId = new mongoose.Types.ObjectId();
  return Leave.insertMany(
    days.map((d) => ({ employeeId, date: d, leaveType, reason: reason?.trim(), groupId }))
  );
}

/**
 * Available balance for one leave type, accounting for both already-used
 * AND currently-pending days (so a second pending request can't be
 * approved past the real remaining balance).
 */
async function getAvailableForType(employeeId, leaveType) {
  const balanceDoc = await LeaveBalance.findOne({ employeeId });
  const allocated = balanceDoc?.[leaveType]?.allocated ?? 0;
  const used = balanceDoc?.[leaveType]?.used ?? 0;

  const pendingCount = await Leave.countDocuments({ employeeId, leaveType, status: 'pending' });

  return allocated - used - pendingCount;
}

async function listMine(employeeId) {
  return Leave.find({ employeeId }).sort({ date: -1 });
}

async function listPending() {
  return Leave.find({ status: 'pending' })
    .sort({ createdAt: -1 })
    .populate('employeeId', 'name email');
}

async function decide(leaveId, adminId, decision) {
  if (!['approved', 'rejected'].includes(decision)) {
    throw new Error('Decision must be approved or rejected');
  }

  const leave = await Leave.findById(leaveId);
  if (!leave) throw new Error('Leave request not found');

  // Guard against double-deduction if this is somehow decided twice -
  // only act on a transition OUT of 'pending'.
  const wasPending = leave.status === 'pending';

  leave.status = decision;
  leave.decidedBy = adminId;
  leave.decidedAt = new Date();
  await leave.save();

  // Deduct from the balance only when approving, only once, and only for
  // types that actually track a balance (Part 4: Leave Without Pay never
  // deducts anything).
  if (wasPending && decision === 'approved' && !NO_BALANCE_CHECK_TYPES.includes(leave.leaveType)) {
    const field = leave.leaveType === 'compOff' ? 'compOff.used' : `${leave.leaveType}.used`;
    await LeaveBalance.findOneAndUpdate(
      { employeeId: leave.employeeId },
      { $inc: { [field]: 1 } }, // each Leave doc = 1 day (half-day not yet tracked on the backend)
      { upsert: true }
    );
  }

  return leave;
}

async function countApprovedForDate(dateStr) {
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  return Leave.countDocuments({ status: 'approved', date: { $gte: targetDate, $lt: nextDay } });
}

module.exports = { requestLeave, listMine, listPending, decide, countApprovedForDate, getAvailableForType };