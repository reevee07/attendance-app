const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['in', 'out'],
      required: true,
    },

    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    // Self-punch fields
    latitude: {
      type: Number,
    },

    longitude: {
      type: Number,
    },

    address: {
      type: String,
    },

    distanceFromOffice: {
      type: Number,
    },

    photoUrl: {
      type: String,
    },

    // Who created this attendance entry
    punchedBy: {
      type: String,
      enum: ['self', 'admin'],
      required: true,
      default: 'self',
    },

    punchedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },

    note: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Speeds up per-day attendance queries
attendanceSchema.index({
  employeeId: 1,
  timestamp: 1,
});

module.exports = mongoose.model('Attendance', attendanceSchema);