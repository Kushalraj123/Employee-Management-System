import mongoose from 'mongoose';

const jobOpeningSchema = new mongoose.Schema(
  {
    jobCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      index: true,
    },
    location: {
      type: String,
      default: 'Bengaluru / Hybrid',
    },
    employmentType: {
      type: String,
      enum: ['Full-Time', 'Contract', 'Remote', 'Internship'],
      default: 'Full-Time',
    },
    experienceRequired: {
      type: String,
      default: '3-5 Years',
    },
    salaryRange: {
      type: String,
      default: '₹18L – ₹28L PA',
    },
    description: {
      type: String,
      required: true,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    qualifications: {
      type: [String],
      default: [],
    },
    openingsCount: {
      type: Number,
      default: 1,
    },
    hiringManager: {
      type: String,
      default: 'Elena Rostova',
    },
    status: {
      type: String,
      enum: ['Open', 'On Hold', 'Closed'],
      default: 'Open',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('JobOpening', jobOpeningSchema);

