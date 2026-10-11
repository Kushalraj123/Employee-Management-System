import mongoose from 'mongoose';

const attendancePolicySchema = new mongoose.Schema(
  {
    policyName: {
      type: String,
      default: 'Standard Enterprise Policy',
    },
    workStartTime: {
      type: String,
      default: '09:00', // HH:MM
    },
    gracePeriodMinutes: {
      type: Number,
      default: 15,
    },
    cutoffTime: {
      type: String,
      default: '10:30', // HH:MM after which auto-marked Absent
    },
    workEndTime: {
      type: String,
      default: '18:00',
    },
    minWorkingHours: {
      type: Number,
      default: 8,
    },
    halfDayThresholdHours: {
      type: Number,
      default: 4,
    },
    weekendDays: {
      type: [String],
      default: ['Saturday', 'Sunday'],
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('AttendancePolicy', attendancePolicySchema);
