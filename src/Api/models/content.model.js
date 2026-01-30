import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  contentType: { 
    type: String, 
    enum: ['video', 'document', 'live_class'], 
    required: true 
  },
  
  fileUrl: { type: String }, 
  cloudinaryId: { type: String },
  meetingLink: { type: String }, 
  
  subject: { type: String, required: true },
  targetClass: { 
    type: String, 
    enum: ['YEAR1', 'YEAR2', 'YEAR3', 'YEAR4', 'YEAR5', 'JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'], 
    required: true 
  },
  
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  isScannedNote: { type: Boolean, default: false },
  rawText: { type: String } 
}, { timestamps: true });

export const Content = mongoose.model('Content', contentSchema);