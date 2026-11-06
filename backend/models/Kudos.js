import mongoose from 'mongoose';

const kudosSchema = new mongoose.Schema(
  {
    fromEmployeeId: { type: String, required: true },
    fromName: { type: String, required: true },
    fromAvatar: { type: String, default: '' },
    toEmployeeId: { type: String, required: true, index: true },
    toName: { type: String, required: true },
    toDepartment: { type: String, default: 'Engineering' },
    toAvatar: { type: String, default: '' },
    badge: {
      type: String,
      enum: ['Innovator', 'Team Player', 'Customer Hero', 'Code Wizard', 'Leadership Star', 'Culture Champion'],
      default: 'Innovator',
    },
    message: { type: String, required: true },
    points: { type: Number, default: 50 },
    likes: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Kudos', kudosSchema);

