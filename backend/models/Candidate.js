import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      index: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      default: '',
    },
    experienceYears: {
      type: Number,
      default: 3,
    },
    currentCompany: {
      type: String,
      default: '',
    },
    education: {
      type: String,
      default: 'B.Tech Computer Science',
    },
    skills: {
      type: [String],
      default: [],
    },
    resumeText: {
      type: String,
      default: '',
    },
    resumeFileName: {
      type: String,
      default: 'Resume.pdf',
    },
    stage: {
      type: String,
      enum: ['Applied', 'Screening', 'Interview', 'Selected', 'Offer', 'Hired', 'Rejected'],
      default: 'Applied',
      index: true,
    },
    aiScreening: {
      matchScore: { type: Number, default: 0 },
      matchingSkills: { type: [String], default: [] },
      missingSkills: { type: [String], default: [] },
      explanation: { type: String, default: '' },
      recommendation: { type: String, default: 'Human Review Required' },
      screenedAt: { type: String, default: null },
    },
    interviews: [
      {
        id: String,
        round: String,
        interviewer: String,
        scheduledAt: String,
        mode: String,
        status: String,
        rating: Number,
        feedback: String,
      },
    ],
    source: {
      type: String,
      default: 'LinkedIn',
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Candidate', candidateSchema);

