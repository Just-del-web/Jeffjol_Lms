import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  action: { 
    type: String, 
    enum: ['view_video', 'read_note', 'download_pdf', 'login'], 
    required: true 
  },
  contentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Content' 
  },
  subject: { type: String },
  durationMinutes: { type: Number, default: 0 }, 
}, { timestamps: true });

activitySchema.index({ student: 1, createdAt: -1 });

export const Activity = mongoose.model('Activity', activitySchema);