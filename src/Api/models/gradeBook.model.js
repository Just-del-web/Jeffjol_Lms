import mongoose from 'mongoose';

const gradebookSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  term: { type: String, enum: ['First', 'Second', 'Third'], required: true },
  session: { type: String, required: true }, 
  class: { type: String, required: true }, 

  testScore: { type: Number, default: 0, max: 20 },
  assignmentScore: { type: Number, default: 0, max: 10 },
  midTermScore: { type: Number, default: 0, max: 10 },
  
  totalCA: { type: Number, default: 0 } 
}, { timestamps: true });


gradebookSchema.index({ student: 1, subject: 1, term: 1, session: 1 }, { unique: true });

export const Gradebook = mongoose.model('Gradebook', gradebookSchema);