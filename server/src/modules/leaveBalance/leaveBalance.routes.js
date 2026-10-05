const express = require('express');
const { myBalanceController, assignController, grantSpecialController } = require('./leaveBalance.controller');
const { requireAuth, requireRole } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/me', myBalanceController);
router.patch('/assign', requireRole('admin'), assignController);
router.patch('/grant-special', requireRole('admin'), grantSpecialController);

module.exports = router;