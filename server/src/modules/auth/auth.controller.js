const asyncHandler = require('express-async-handler');
const authService = require('./auth.service');

// POST /api/auth/login
const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const result = await authService.login(email, password);
  res.status(200).json({ success: true, data: result });
});

// GET /api/auth/me
const meController = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

// PATCH /api/auth/change-password
const changePasswordController = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current and new password are required');
  }

  const employeeId = req.user._id || req.user.id;

  res.status(400); // so service validation errors reach the client as 400
  await authService.changePassword(employeeId, currentPassword, newPassword);

  res.status(200).json({ success: true, message: 'Password updated' });
});



module.exports = { loginController, meController, changePasswordController };

