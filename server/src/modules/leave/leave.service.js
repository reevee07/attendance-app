const Leave = require('./leave.model');

async function requestLeave(employeeId, { date, reason }) {
  if (!date) throw new Error('Date is required');

  const leaveDate = new Date(date);
  leaveDate.setHours(0, 0, 0, 0);

  const existing = await Leave.findOne({ employeeId, date: leaveDate, status: 'pending' });
  if (existing) throw new Error('You already have a pending leave request for this date');

  return Leave.create({ employeeId, date: leaveDate, reason });
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

module.exports = { requestLeave, listPending, decide, countApprovedForDate };