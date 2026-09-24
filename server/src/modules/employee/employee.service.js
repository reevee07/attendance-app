const bcrypt = require('bcryptjs');
const Employee = require('./employee.model');

async function createEmployee(data) {
  const { name, email, password, role, employeeCode, officeId } = data;

  const existing = await Employee.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw new Error('An employee with this email already exists');

  const passwordHash = await bcrypt.hash(password, 10);

  const employee = await Employee.create({
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    role: role || 'user',
    employeeCode,
    officeId,
  });

  return employee;
}

async function listEmployees(filter = {}) {
  return Employee.find(filter).select('-passwordHash').populate('officeId', 'name');
}

async function getEmployeeById(id) {
  const employee = await Employee.findById(id).select('-passwordHash');
  if (!employee) throw new Error('Employee not found');
  return employee;
}

async function updateEmployee(id, updates) {
  // Never allow password/role hijack through the generic update path
  delete updates.passwordHash;
  delete updates.password;

  const employee = await Employee.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  }).select('-passwordHash');

  if (!employee) throw new Error('Employee not found');
  return employee;
}

async function deactivateEmployee(id) {
  const employee = await Employee.findByIdAndUpdate(
    id,
    { status: 'inactive' },
    { new: true }
  ).select('-passwordHash');

  if (!employee) throw new Error('Employee not found');
  return employee;
}

module.exports = {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
};
