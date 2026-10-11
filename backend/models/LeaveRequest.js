import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema(
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
    leaveType: {
      type: String,
      enum: ['Casual', 'Sick', 'Earned', 'Unpaid'],
      required: true,
      default: 'Casual',
    },
    startDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    endDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    daysCount: {
      type: Number,
      default: 1,
      min: 0.5,
    },
    reason: {
      type: String,
      required: [true, 'Leave reason is mandatory'],
      trim: true,
      minlength: 5,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    hrComments: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('LeaveRequest', leaveRequestSchema);
