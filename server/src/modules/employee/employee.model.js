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
    company: { type: String, trim: true },
    officeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Office' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    // ---- New fields ----
    prefix: { type: String, enum: ['Mr.', 'Ms.', 'Mrs.', 'Dr.'] },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    nationality: { type: String, trim: true },

    dateOfJoining: { type: Date },
    employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Intern'] },
    employmentStatus: { type: String, enum: ['Active', 'Probation', 'Notice period', 'Inactive', 'Confirmed'] },

    businessUnit: { type: String, trim: true },
    department: { type: String, trim: true },
    branch: { type: String, trim: true },
    subBranch: { type: String, trim: true },

    reportingManagerCode: { type: String, trim: true },
    reportingManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    functionalManagerCode: { type: String, trim: true },
    functionalManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },

    aadhar: { type: String, unique: true, sparse: true, match: [/^\d{12}$/, 'Aadhar must be 12 digits'] },
    pan: { type: String, unique: true, sparse: true, uppercase: true, match: [/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN format'] },
    emergencyContact: { type: String, trim: true },
    personalEmail: { type: String, lowercase: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);