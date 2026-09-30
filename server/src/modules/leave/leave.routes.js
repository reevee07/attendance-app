const express = require('express');
const {
  requestLeaveController,
  listMineController,
  listPendingController,
  decideController,
  todayCountController,
} = require('./leave.controller');
const { requireAuth, requireRole } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.post('/', requestLeaveController); // any logged-in employee
router.get('/mine', listMineController); // employee's own requests + status
router.get('/pending', requireRole('admin'), listPendingController);
router.get('/today-count', requireRole('admin'), todayCountController);
router.patch('/:id/decision', requireRole('admin'), decideController);

module.exports = router;