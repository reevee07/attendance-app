const asyncHandler = require('express-async-handler');
const attendanceService = require('./attendance.service');

// POST /api/attendance/punch  (self, requires photo + location)
const selfPunchController = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  const employeeId = req.user._id;

  if (!req.file) {
    res.status(400);
    throw new Error('Photo is required for self punch');
  }

  const record = await attendanceService.selfPunch({
    employeeId,
    latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
    longitude: longitude !== undefined ? parseFloat(longitude) : undefined,
    photoBuffer: req.file.buffer,
    photoMimeType: req.file.mimetype,
  });

  res.status(201).json({ success: true, data: record });
});

// POST /api/attendance/admin-punch  (admin only, any employee, no photo/location)
const adminPunchController = asyncHandler(async (req, res) => {
  const { employeeId, type, note } = req.body;

  if (!employeeId) {
    res.status(400);
    throw new Error('employeeId is required');
  }

  const record = await attendanceService.adminPunch({
    employeeId,
    adminId: req.user._id,
    type, // optional - auto-detected if omitted
    note,
  });

  res.status(201).json({ success: true, data: record });
});

// GET /api/attendance/me?from=&to=
const myHistoryController = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const history = await attendanceService.getEmployeeHistory(req.user._id, { from, to });
  res.status(200).json({ success: true, data: history });
});

// GET /api/attendance/employee/:id?from=&to=  (admin only)
const employeeHistoryController = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const history = await attendanceService.getEmployeeHistory(req.params.id, { from, to });
  res.status(200).json({ success: true, data: history });
});

// GET /api/attendance/summary?date=YYYY-MM-DD  (admin only)
// Returns first-in / last-out per employee for the given day (defaults to today)
const dailySummaryController = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const summary = await attendanceService.getDailySummary(date);
  res.status(200).json({ success: true, data: summary });
});

module.exports = {
  selfPunchController,
  adminPunchController,
  myHistoryController,
  employeeHistoryController,
  dailySummaryController,
};
