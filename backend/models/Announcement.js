import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Announcement description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['General', 'Holiday', 'Meeting', 'Policy Update', 'Urgent Notice'],
      default: 'General',
    },
    targetDepartment: {
      type: String,
      default: 'All', // 'All' or specific department
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    authorName: {
      type: String,
      default: 'HR Operations',
    },
    authorRole: {
      type: String,
      default: 'HR',
    },
    readBy: {
      type: [String], // Array of user IDs or employee IDs who acknowledged/read
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Announcement', announcementSchema);
