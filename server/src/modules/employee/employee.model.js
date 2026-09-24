const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    photoUrl: { type: String },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    employeeCode: { type: String, unique: true, sparse: true },
    designation: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    officeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Office' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
