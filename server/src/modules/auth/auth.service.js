const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Employee = require('../employee/employee.model');
const { jwtSecret, jwtExpiresIn } = require('../../config/env');

function generateToken(employee) {
  return jwt.sign({ id: employee._id, role: employee.role }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
}

async function login(email, password) {
  const employee = await Employee.findOne({ email: email.toLowerCase().trim() });
  if (!employee) throw new Error('Invalid email or password');

  if (employee.status !== 'active') throw new Error('Account is inactive - contact your admin');

  const isMatch = await bcrypt.compare(password, employee.passwordHash);
  if (!isMatch) throw new Error('Invalid email or password');

  const token = generateToken(employee);

  return {
    token,
    user: {
      id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      officeId: employee.officeId,
    },
  };
}

module.exports = { login, generateToken };
