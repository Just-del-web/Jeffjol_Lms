import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: String,
  duration: Number, 
  sebRequired: { type: Boolean, default: true }, // Safe Exam Browser flag
  questions: [{
    questionText: String,
    options: [String],
    correctAnswer: String
  }],
  status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft' }
});

export const Exam = mongoose.model('Exam', examSchema);