import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Work email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid work email'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: ['Engineering', 'HR', 'Sales', 'Finance', 'Marketing', 'Product', 'Design'],
      default: 'Engineering',
    },
    designation: {
      type: String,
      required: [true, 'Designation / Job title is required'],
      trim: true,
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
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      default: 95000,
    },
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Employee', employeeSchema);
