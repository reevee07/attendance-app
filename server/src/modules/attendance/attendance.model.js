const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    type: { type: String, enum: ['in', 'out'], required: true },
    timestamp: { type: Date, required: true, default: Date.now, index: true },

    // Self-punch fields (null/absent for admin-entered punches)
    latitude: { type: Number },
    longitude: { type: Number },
    distanceFromOffice: { type: Number }, // meters, logged only - not enforced
    photoUrl: { type: String },

    // Who actually created this log entry
    punchedBy: { type: String, enum: ['self', 'admin'], required: true, default: 'self' },
    punchedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, // set only when punchedBy === 'admin'
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

// Speeds up admin's per-day first-in/last-out aggregation
attendanceSchema.index({ employeeId: 1, timestamp: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
