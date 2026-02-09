import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  
  targetAudience: { 
    students: { type: Boolean, default: true },
    teachers: { type: Boolean, default: false },
    parents: { type: Boolean, default: true }
  },

  priority: { 
    type: String, 
    enum: ['normal', 'urgent', 'emergency'], 
    default: 'normal' 
  },

  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  expiresAt: { type: Date },
  
  views: { type: Number, default: 0 }
  
}, { timestamps: true });

export const Announcement = mongoose.model('Announcement', announcementSchema);