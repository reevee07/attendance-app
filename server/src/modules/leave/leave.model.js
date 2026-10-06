const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    date: { type: Date, required: true }, // the day being requested off
    groupId: { type: mongoose.Schema.Types.ObjectId, index: true }, // links days from the same multi-day request
    leaveType: {
      type: String,
      enum: [
        "casualLeave",
        "sickLeave",
        "earnLeave",
        "specialLeave",
        "leaveWithoutPay",
        "compOff",
      ],
      required: true,
    },
    reason: { type: String, trim: true },
    dayType: {
      type: String,
      enum: ["full", "firstHalf", "secondHalf"],
      default: "full",
    },
    duration: { type: Number, required: true, default: 1 }, // 1 for full day, 0.5 for a half day
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    decidedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Leave", leaveSchema);
