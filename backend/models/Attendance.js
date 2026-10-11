import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    checkInTime: {
      type: String, // ISO timestamp or HH:mm:ss
      default: null,
    },
    checkOutTime: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Absent', 'Half Day', 'On Leave', 'Holiday'],
      default: 'Present',
    },
    workingHours: {
      type: Number, // In hours (e.g., 8.5)
      default: 0,
    },
    lateMinutes: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    isManualCorrection: {
      type: Boolean,
      default: false,
    },
    correctedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate attendance records for the same employee on the same date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
