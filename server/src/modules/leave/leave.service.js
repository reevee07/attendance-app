const mongoose = require('mongoose');
const Leave = require('./leave.model');

async function requestLeave(employeeId, { date, toDate, reason }) {
  if (!date) throw new Error('Start date is required');
  if (!reason || !reason.trim()) throw new Error('Reason is required');

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

  const groupId = new mongoose.Types.ObjectId();
  return Leave.insertMany(days.map((d) => ({ employeeId, date: d, reason: reason.trim(), groupId })));
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

  const leave = await Leave.findByIdAndUpdate(
    leaveId,
    { status: decision, decidedBy: adminId, decidedAt: new Date() },
    { new: true }
  );

  if (!leave) throw new Error('Leave request not found');
  return leave;
}

async function countApprovedForDate(dateStr) {
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);

  return Leave.countDocuments({ status: 'approved', date: { $gte: targetDate, $lt: nextDay } });
}

module.exports = { requestLeave, listMine, listPending, decide, countApprovedForDate };