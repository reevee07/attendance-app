const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const Employee = require('../modules/employee/employee.model');

/**
 * Verifies JWT and attaches the authenticated employee to req.user
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const employee = await Employee.findById(decoded.id).select('-passwordHash');

    if (!employee || employee.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Account not found or inactive' });
    }

    req.user = employee;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

/**
 * Restricts a route to specific role(s). Use after requireAuth.
 * e.g. requireRole('admin')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden - insufficient permissions' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
