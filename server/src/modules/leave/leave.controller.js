const asyncHandler = require('express-async-handler');
const leaveService = require('./leave.service');

// POST /api/leaves  (employee requests leave)
const requestLeaveController = asyncHandler(async (req, res) => {
  const leave = await leaveService.requestLeave(req.user._id, req.body);
  res.status(201).json({ success: true, data: leave });
});

// GET /api/leaves/pending  (admin only)
const listPendingController = asyncHandler(async (req, res) => {
  const leaves = await leaveService.listPending();
  res.status(200).json({ success: true, data: leaves });
});

// PATCH /api/leaves/:id/decision  (admin only) - body: { decision: 'approved' | 'rejected' }
const decideController = asyncHandler(async (req, res) => {
  const leave = await leaveService.decide(req.params.id, req.user._id, req.body.decision);
  res.status(200).json({ success: true, data: leave });
});

// GET /api/leaves/today-count  (admin only)
const todayCountController = asyncHandler(async (req, res) => {
  const count = await leaveService.countApprovedForDate();
  res.status(200).json({ success: true, data: { count } });
});

module.exports = { requestLeaveController, listPendingController, decideController, todayCountController };