const express = require('express');
const rateLimit = require('express-rate-limit');
const { loginController, meController } = require('./auth.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Basic brute-force protection on login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, try again later' },
});

router.post('/login', loginLimiter, loginController);
router.get('/me', requireAuth, meController);

module.exports = router;
