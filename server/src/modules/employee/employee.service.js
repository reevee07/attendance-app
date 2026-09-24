const bcrypt = require('bcryptjs');
const Employee = require('./employee.model');
const supabase = require('../../config/supabase');
const { supabaseBucket } = require('../../config/env');

async function uploadEmployeePhoto(employeeId, fileBuffer, mimeType) {
  const ext = mimeType.split('/')[1] || 'jpg';
  const path = `profiles/${employeeId}.${ext}`;

  const { error } = await supabase.storage
    .from(supabaseBucket)
    .upload(path, fileBuffer, { contentType: mimeType, upsert: true }); // upsert - allows re-uploading on edit

  if (error) throw new Error(`Photo upload failed: ${error.message}`);

  const { data } = supabase.storage.from(supabaseBucket).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`; // cache-bust so updated photos show immediately
}

async function createEmployee(data, photoFile) {
  const { name, email, password, role, employeeCode, designation, contactNumber, officeId } = data;

  const existing = await Employee.findOne({ email: email.toLowerCase().trim() });
  if (existing) throw new Error('An employee with this email already exists');

  const passwordHash = await bcrypt.hash(password, 10);

  let employee = await Employee.create({
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    role: role || 'user',
    employeeCode,
    designation,
    contactNumber,
    officeId,
  });

  if (photoFile) {
    const photoUrl = await uploadEmployeePhoto(employee._id, photoFile.buffer, photoFile.mimetype);
    employee = await Employee.findByIdAndUpdate(employee._id, { photoUrl }, { new: true });
  }

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

async function updateEmployee(id, updates, photoFile) {
  delete updates.passwordHash;
  delete updates.password;

  if (photoFile) {
    updates.photoUrl = await uploadEmployeePhoto(id, photoFile.buffer, photoFile.mimetype);
  }

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