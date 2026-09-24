const asyncHandler = require('express-async-handler');
const Office = require('./office.model');

// POST /api/offices  (admin only)
const createOfficeController = asyncHandler(async (req, res) => {
  const office = await Office.create(req.body);
  res.status(201).json({ success: true, data: office });
});

// GET /api/offices
const listOfficesController = asyncHandler(async (req, res) => {
  const offices = await Office.find();
  res.status(200).json({ success: true, data: offices });
});

// PATCH /api/offices/:id  (admin only)
const updateOfficeController = asyncHandler(async (req, res) => {
  const office = await Office.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!office) {
    res.status(404);
    throw new Error('Office not found');
  }
  res.status(200).json({ success: true, data: office });
});

module.exports = { createOfficeController, listOfficesController, updateOfficeController };
