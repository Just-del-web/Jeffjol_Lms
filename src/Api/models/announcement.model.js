import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  targetAudience: { 
    type: String, 
    enum: ['all', 'student', 'teacher', 'parent'], 
    default: 'all' 
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export const Announcement = mongoose.model('Announcement', announcementSchema);