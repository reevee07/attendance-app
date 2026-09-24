const asyncHandler = require('express-async-handler');
const employeeService = require('./employee.service');

// POST /api/employees  (admin only)
const createEmployeeController = asyncHandler(async (req, res) => {
  const employee = await employeeService.createEmployee(req.body);
  res.status(201).json({ success: true, data: employee });
});

// GET /api/employees  (admin only)
const listEmployeesController = asyncHandler(async (req, res) => {
  const { officeId, status } = req.query;
  const filter = {};
  if (officeId) filter.officeId = officeId;
  if (status) filter.status = status;

  const employees = await employeeService.listEmployees(filter);
  res.status(200).json({ success: true, data: employees });
});

// GET /api/employees/:id
const getEmployeeController = asyncHandler(async (req, res) => {
  const employee = await employeeService.getEmployeeById(req.params.id);
  res.status(200).json({ success: true, data: employee });
});

// PATCH /api/employees/:id  (admin only)
const updateEmployeeController = asyncHandler(async (req, res) => {
  const employee = await employeeService.updateEmployee(req.params.id, req.body);
  res.status(200).json({ success: true, data: employee });
});

// DELETE /api/employees/:id  (admin only - soft delete)
const deactivateEmployeeController = asyncHandler(async (req, res) => {
  const employee = await employeeService.deactivateEmployee(req.params.id);
  res.status(200).json({ success: true, data: employee });
});

module.exports = {
  createEmployeeController,
  listEmployeesController,
  getEmployeeController,
  updateEmployeeController,
  deactivateEmployeeController,
};
