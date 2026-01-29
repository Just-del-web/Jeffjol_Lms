import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  score: { type: Number, required: true },
  term: { type: String, required: true }, 
  session: { type: String, required: true }, 
  uploadedAt: { type: Date, default: Date.now }
});

export const Result = mongoose.model('Result', resultSchema);