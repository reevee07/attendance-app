const bcrypt = require('bcryptjs');
const Employee = require('./employee.model');
const supabase = require('../../config/supabase');
const { supabaseBucket } = require('../../config/env');

// Only these fields may be written from the form (whitelist)
const ALLOWED_FIELDS = [
  'name', 'email', 'role', 'employeeCode', 'designation', 'contactNumber',
  'company', 'officeId',
  'prefix', 'dateOfBirth', 'gender', 'bloodGroup', 'nationality',
  'dateOfJoining', 'employmentType', 'employmentStatus',
  'businessUnit', 'department', 'branch', 'subBranch',
  'reportingManagerCode', 'reportingManagerId',
  'functionalManagerCode', 'functionalManagerId',
  'aadhar', 'pan', 'emergencyContact', 'personalEmail',
];

// These can never be cleared
const REQUIRED_FIELDS = ['name', 'email', 'role'];

// Splits form data into values to set and fields to clear.
// Empty strings are never stored, so enum, ObjectId and sparse-unique fields don't break.
function splitPayload(data) {
  const set = {};
  const unset = {};
  for (const [key, value] of Object.entries(data)) {
    if (!ALLOWED_FIELDS.includes(key)) continue;
    const isEmpty = value === '' || value === null || value === undefined;
    if (isEmpty) {
      if (!REQUIRED_FIELDS.includes(key)) unset[key] = 1;
    } else {
      set[key] = typeof value === 'string' ? value.trim() : value;
    }
  }
  return { set, unset };
}


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
  const { password } = data;
  if (!password || !password.trim()) throw new Error('Password is required');

  const { set } = splitPayload(data); // empty fields are simply left out on create
  if (!set.name || !set.email) throw new Error('Name and email are required');

  set.email = set.email.toLowerCase();

  const existing = await Employee.findOne({ email: set.email });
  if (existing) throw new Error('An employee with this email already exists');

  if (set.employeeCode) {
    const codeTaken = await Employee.findOne({ employeeCode: set.employeeCode });
    if (codeTaken) throw new Error('Employee code already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  set.role = set.role || 'user';

  let employee = await Employee.create({ ...set, passwordHash });

  if (photoFile) {
    const photoUrl = await uploadEmployeePhoto(employee._id, photoFile.buffer, photoFile.mimetype);
    employee = await Employee.findByIdAndUpdate(employee._id, { photoUrl }, { new: true });
  }

  return employee;
}

async function listEmployees(filter = {}) {
  return Employee.find(filter)
    .select('-passwordHash')
    .populate('officeId', 'name')
    .populate('reportingManagerId', 'name employeeCode')
    .populate('functionalManagerId', 'name employeeCode');
}

async function getEmployeeById(id) {
  const employee = await Employee.findById(id)
    .select('-passwordHash')
    .populate('officeId', 'name')
    .populate('reportingManagerId', 'name employeeCode')
    .populate('functionalManagerId', 'name employeeCode');
  if (!employee) throw new Error('Employee not found');
  return employee;
}

async function updateEmployee(id, updates, photoFile) {
  const { password } = updates;
  const { set, unset } = splitPayload(updates); // passwordHash/status/_id are ignored by the whitelist

  if (password && password.trim()) {
    set.passwordHash = await bcrypt.hash(password, 10);
  }

  if (photoFile) {
    set.photoUrl = await uploadEmployeePhoto(id, photoFile.buffer, photoFile.mimetype);
  }

  const update = { $set: set };
  if (Object.keys(unset).length) update.$unset = unset;

  const employee = await Employee.findByIdAndUpdate(id, update, {
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