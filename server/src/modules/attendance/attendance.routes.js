const express = require('express');
const {
  selfPunchController,
  adminPunchController,
  myHistoryController,
  employeeHistoryController,
  dailySummaryController,
  trendController,
  byOfficeController,
  recentController,
  employeeCalendarController,
  myCalendarController,
  
} = require('./attendance.controller');

const { requireAuth, requireRole } = require('../../middlewares/auth.middleware');
const router = express.Router();  

router.use(requireAuth);
router.post('/punch', selfPunchController);
router.post('/admin-punch', requireRole('admin'), adminPunchController);

router.get('/me', myHistoryController);
router.get('/me/calendar', myCalendarController);
router.get('/employee/:id', requireRole('admin'), employeeHistoryController);
router.get('/employee/:id/calendar', requireRole('admin'), employeeCalendarController);
router.get('/summary', requireRole('admin'), dailySummaryController);
router.get('/trend', requireRole('admin'), trendController);
router.get('/by-office', requireRole('admin'), byOfficeController);
router.get('/recent', requireRole('admin'), recentController);

module.exports = router;