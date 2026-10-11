import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Productivity', 'Technical Mastery', 'Leadership', 'Strategic Impact', 'Customer Success'],
      default: 'Productivity',
    },
    targetMetric: {
      type: String,
      default: '100%',
    },
    progress: {
      type: Number, // 0 to 100
      default: 0,
      min: 0,
      max: 100,
    },
    deadline: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'Needs Review'],
      default: 'In Progress',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Goal', goalSchema);
