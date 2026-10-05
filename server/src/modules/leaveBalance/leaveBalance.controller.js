const asyncHandler = require('express-async-handler');
const leaveBalanceService = require('./leaveBalance.service');

// GET /api/leave-balance/me  (any logged-in employee - their own balance only)
const myBalanceController = asyncHandler(async (req, res) => {
  const balance = await leaveBalanceService.getByEmployeeId(req.user._id);
  res.status(200).json({ success: true, data: balance });
});

// PATCH /api/leave-balance/assign  (admin only)
// body: { employeeCode, casualLeave, sickLeave, earnLeave }
const assignController = asyncHandler(async (req, res) => {
  const { employeeCode, casualLeave, sickLeave, earnLeave } = req.body;
  if (!employeeCode) {
    res.status(400);
    throw new Error('employeeCode is required');
  }
  const balance = await leaveBalanceService.assignStandardLeave(employeeCode, {
    casualLeave,
    sickLeave,
    earnLeave,
  });
  res.status(200).json({ success: true, data: balance });
});

// PATCH /api/leave-balance/grant-special  (admin only)
// body: { employeeCode, amount }
const grantSpecialController = asyncHandler(async (req, res) => {
  const { employeeCode, amount } = req.body;
  if (!employeeCode) {
    res.status(400);
    throw new Error('employeeCode is required');
  }
  const balance = await leaveBalanceService.grantSpecialLeave(employeeCode, Number(amount));
  res.status(200).json({ success: true, data: balance });
});

module.exports = { myBalanceController, assignController, grantSpecialController };