const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    // "YYYY-MM-DD" as plain text, so time zones can't shift it
    date: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'],
    },
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Holiday', holidaySchema);