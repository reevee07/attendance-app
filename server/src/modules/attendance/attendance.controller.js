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

// GET /api/attendance/trend?days=7  (admin only)
const trendController = asyncHandler(async (req, res) => {
  const days = req.query.days ? parseInt(req.query.days, 10) : 7;
  const trend = await attendanceService.getPresentTrend(days);
  res.status(200).json({ success: true, data: trend });
});

// GET /api/attendance/by-office  (admin only)
const byOfficeController = asyncHandler(async (req, res) => {
  const data = await attendanceService.getOfficePresenceToday();
  res.status(200).json({ success: true, data });
});

// GET /api/attendance/recent?limit=10  (admin only)
const recentController = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const recent = await attendanceService.getRecentPunches(limit);
  res.status(200).json({ success: true, data: recent });
});

module.exports = {
  selfPunchController,
  adminPunchController,
  myHistoryController,
  employeeHistoryController,
  dailySummaryController,
  trendController,
  byOfficeController,
  recentController,
};