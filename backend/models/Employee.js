import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Work email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid work email'],
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: ['Engineering', 'HR', 'Sales', 'Finance', 'Marketing', 'Product', 'Design', 'Executive'],
      default: 'Engineering',
      index: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation / Job title is required'],
      trim: true,
    },
    reportingManager: {
      type: String,
      default: 'Elena Rostova',
    },
    reportingManagerId: {
      type: String,
      default: 'emp_001',
      index: true,
    },
    roleLevel: {
      type: String,
      enum: ['Executive', 'Director', 'Manager', 'Senior', 'Mid-Level', 'Associate'],
      default: 'Senior',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      default: 'Male',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      default: 'Bengaluru HQ (Hybrid)',
    },
    employmentType: {
      type: String,
      enum: ['Full-Time', 'Contract', 'Part-Time', 'Remote'],
      default: 'Full-Time',
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
      index: true,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      default: 1200000,
    },
    salaryStructure: {
      basicSalary: { type: Number, default: 60000 },
      hra: { type: Number, default: 24000 },
      allowances: { type: Number, default: 16000 },
      bonus: { type: Number, default: 5000 },
      pfDeduction: { type: Number, default: 3600 },
      taxDeduction: { type: Number, default: 4400 },
      deductions: { type: Number, default: 8000 },
      netSalary: { type: Number, default: 97000 },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    qualifications: {
      type: [String],
      default: ['B.Tech in Computer Science & Engineering'],
    },
    documents: [
      {
        id: String,
        title: String,
        category: String,
        fileSize: String,
        uploadedAt: String,
        status: { type: String, default: 'Verified' },
      },
    ],
    activityHistory: [
      {
        id: String,
        action: String,
        description: String,
        timestamp: String,
        category: String,
      },
    ],
    skillMatrix: [
      {
        name: String,
        level: Number,
        targetLevel: Number,
        category: String,
      },
    ],
    performanceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 90,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [String],
      default: ['Collaboration', 'Enterprise Problem Solving'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Employee', employeeSchema);
