const express = require('express');
const {
  createEmployeeController,
  listEmployeesController,
  getEmployeeController,
  updateEmployeeController,
  deactivateEmployeeController,
} = require('./employee.controller');
const { requireAuth, requireRole } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.post('/', requireRole('admin'), createEmployeeController);
router.get('/', requireRole('admin'), listEmployeesController);
router.get('/:id', getEmployeeController); // employee can fetch their own; admin can fetch any
router.patch('/:id', requireRole('admin'), updateEmployeeController);
router.delete('/:id', requireRole('admin'), deactivateEmployeeController);

module.exports = router;
