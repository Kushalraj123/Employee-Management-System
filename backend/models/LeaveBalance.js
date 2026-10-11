import mongoose from 'mongoose';

const leaveBalanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    casualTotal: { type: Number, default: 12 },
    casualUsed: { type: Number, default: 2 },
    sickTotal: { type: Number, default: 10 },
    sickUsed: { type: Number, default: 1 },
    earnedTotal: { type: Number, default: 15 },
    earnedUsed: { type: Number, default: 3 },
    unpaidUsed: { type: Number, default: 0 },
    year: { type: Number, default: () => new Date().getFullYear() },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('LeaveBalance', leaveBalanceSchema);
