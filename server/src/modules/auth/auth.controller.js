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

module.exports = { loginController, meController };
