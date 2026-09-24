const express = require('express');
const multer = require('multer');
const {
  createEmployeeController,
  listEmployeesController,
  getEmployeeController,
  updateEmployeeController,
  deactivateEmployeeController,
} = require('./employee.controller');
const { requireAuth, requireRole } = require('../../middlewares/auth.middleware');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cap on profile photos
});

router.use(requireAuth);

router.post('/', requireRole('admin'), upload.single('photo'), createEmployeeController);
router.get('/', requireRole('admin'), listEmployeesController);
router.get('/:id', getEmployeeController);
router.patch('/:id', requireRole('admin'), upload.single('photo'), updateEmployeeController);
router.delete('/:id', requireRole('admin'), deactivateEmployeeController);

module.exports = router;