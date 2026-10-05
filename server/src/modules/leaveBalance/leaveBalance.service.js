const LeaveBalance = require('./leaveBalance.model');
const Employee = require('../employee/employee.model');

function withAvailable(doc) {
  const plain = doc.toObject ? doc.toObject() : doc;
  return {
    casualLeave: { ...plain.casualLeave, available: plain.casualLeave.allocated - plain.casualLeave.used },
    sickLeave: { ...plain.sickLeave, available: plain.sickLeave.allocated - plain.sickLeave.used },
    earnLeave: { ...plain.earnLeave, available: plain.earnLeave.allocated - plain.earnLeave.used },
    specialLeave: { ...plain.specialLeave, available: plain.specialLeave.allocated - plain.specialLeave.used },
    compOff: { ...plain.compOff, available: plain.compOff.earned - plain.compOff.used },
  };
}

/**
 * Returns the employee's balance, creating a zeroed record on first
 * access so the Leave page never 404s for someone admin hasn't
 * assigned anything to yet.
 */
async function getByEmployeeId(employeeId) {
  let doc = await LeaveBalance.findOne({ employeeId });
  if (!doc) {
    doc = await LeaveBalance.create({ employeeId });
  }
  return withAvailable(doc);
}

/**
 * Admin sets the allocated amounts for Casual/Sick/Earn Leave - this
 * REPLACES the allocated value (a normal yearly/periodic allocation),
 * it does not add to it. "used" is untouched either way.
 */
async function assignStandardLeave(employeeCode, { casualLeave, sickLeave, earnLeave }) {
  const employee = await Employee.findOne({ employeeCode });
  if (!employee) throw new Error('No employee found with that employee code');

  const update = {};
  if (casualLeave !== undefined) update['casualLeave.allocated'] = casualLeave;
  if (sickLeave !== undefined) update['sickLeave.allocated'] = sickLeave;
  if (earnLeave !== undefined) update['earnLeave.allocated'] = earnLeave;

  const doc = await LeaveBalance.findOneAndUpdate(
    { employeeId: employee._id },
    { $set: update },
    { new: true, upsert: true }
  );
  return withAvailable(doc);
}

/**
 * Admin GRANTS Special Leave - this ADDS to the existing allocation
 * (Part 3: "if HR/Admin later grants Special Leave... balance should
 * increase accordingly"), rather than replacing it.
 */
async function grantSpecialLeave(employeeCode, amount) {
  if (!amount || amount <= 0) throw new Error('Grant amount must be a positive number');

  const employee = await Employee.findOne({ employeeCode });
  if (!employee) throw new Error('No employee found with that employee code');

  const doc = await LeaveBalance.findOneAndUpdate(
    { employeeId: employee._id },
    { $inc: { 'specialLeave.allocated': amount } },
    { new: true, upsert: true }
  );
  return withAvailable(doc);
}

module.exports = { getByEmployeeId, assignStandardLeave, grantSpecialLeave };