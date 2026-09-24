const express = require('express');
const multer = require('multer');
const {
  selfPunchController,
  adminPunchController,
  myHistoryController,
  employeeHistoryController,
  dailySummaryController,
} = require('./attendance.controller');
const { requireAuth, requireRole } = require('../../middlewares/auth.middleware');

const router = express.Router();

// In-memory storage - we stream straight to Supabase, never touch disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cap on punch photos
});

router.use(requireAuth);

router.post('/punch', upload.single('photo'), selfPunchController);
router.post('/admin-punch', requireRole('admin'), adminPunchController);

router.get('/me', myHistoryController);
router.get('/employee/:id', requireRole('admin'), employeeHistoryController);
router.get('/summary', requireRole('admin'), dailySummaryController);

module.exports = router;
