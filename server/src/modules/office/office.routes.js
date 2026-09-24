const express = require('express');
const {
  createOfficeController,
  listOfficesController,
  updateOfficeController,
} = require('./office.controller');
const { requireAuth, requireRole } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.post('/', requireRole('admin'), createOfficeController);
router.get('/', listOfficesController); // employees need this to know their assigned office
router.patch('/:id', requireRole('admin'), updateOfficeController);

module.exports = router;
