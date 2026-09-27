const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    date: { type: Date, required: true }, // the day being requested off
    reason: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Leave', leaveSchema);