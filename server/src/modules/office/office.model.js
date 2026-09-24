const mongoose = require('mongoose');

const officeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    // Kept for reference/analytics only - no enforcement happens against this.
    radiusMeters: { type: Number, default: 200 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Office', officeSchema);
