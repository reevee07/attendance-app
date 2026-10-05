const mongoose = require('mongoose');

/**
 * One document per employee. "available" is never stored - it's always
 * derived as allocated - used, so it can never drift out of sync.
 *
 * leaveWithoutPay is deliberately NOT a field here (Part 4): it has no
 * real balance to track, it's just a selectable leave type with no
 * balance check, so the frontend supplies a constant for it.
 */
const leaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, unique: true },
    casualLeave: {
      allocated: { type: Number, default: 0 },
      used: { type: Number, default: 0 },
    },
    sickLeave: {
      allocated: { type: Number, default: 0 },
      used: { type: Number, default: 0 },
    },
    earnLeave: {
      allocated: { type: Number, default: 0 },
      used: { type: Number, default: 0 },
    },
    specialLeave: {
      allocated: { type: Number, default: 0 }, // Part 3: starts at 0, only grows via admin grants
      used: { type: Number, default: 0 },
    },
    compOff: {
      earned: { type: Number, default: 0 }, // Part 5: will be auto-incremented later, not yet wired
      used: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);