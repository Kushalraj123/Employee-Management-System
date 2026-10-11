import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    employeeEmail: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    designation: {
      type: String,
      default: '',
    },
    payPeriod: {
      type: String, // 'YYYY-MM'
      required: true,
      index: true,
    },
    basicSalary: {
      type: Number,
      required: true,
      default: 60000,
    },
    hra: {
      type: Number,
      default: 24000,
    },
    allowances: {
      type: Number,
      default: 16000,
    },
    bonus: {
      type: Number,
      default: 5000,
    },
    deductions: {
      type: Number,
      default: 8000,
    },
    attendanceAdjustments: {
      type: Number,
      default: 0,
    },
    grossSalary: {
      type: Number,
      required: true,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Approved', 'Paid'],
      default: 'Draft',
      index: true,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      default: 'Direct Deposit / Bank Transfer',
    },
    slipNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    remarks: {
      type: String,
      default: 'Processed via NEXUS HR Automated Payroll Engine',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate payroll entries for the same employee and pay period
payrollSchema.index({ employeeId: 1, payPeriod: 1 }, { unique: true });

export default mongoose.model('Payroll', payrollSchema);
