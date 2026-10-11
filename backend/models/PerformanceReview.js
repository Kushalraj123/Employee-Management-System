import mongoose from 'mongoose';

const performanceReviewSchema = new mongoose.Schema(
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
    reviewerId: {
      type: String,
      required: true,
    },
    reviewerName: {
      type: String,
      default: 'Leadership Team',
    },
    reviewCycle: {
      type: String, // e.g. "Q1 2026", "Annual Review 2026"
      required: true,
    },
    rating: {
      type: Number, // 1 to 5
      required: true,
      min: 1,
      max: 5,
    },
    criteria: {
      technicalExecution: { type: Number, default: 4, min: 1, max: 5 },
      leadershipAndInitiative: { type: Number, default: 4, min: 1, max: 5 },
      teamworkAndCulture: { type: Number, default: 5, min: 1, max: 5 },
      communication: { type: Number, default: 4, min: 1, max: 5 },
      velocityAndDelivery: { type: Number, default: 4, min: 1, max: 5 },
    },
    feedback: {
      type: String,
      required: true,
    },
    strengths: {
      type: [String],
      default: ['Strategic Thinking', 'Proactive Communication', 'High Output Quality'],
    },
    improvementAreas: {
      type: [String],
      default: ['Cross-departmental Mentorship'],
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Needs Review'],
      default: 'Completed',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('PerformanceReview', performanceReviewSchema);
