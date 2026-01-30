import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true },
  
  caScore: { type: Number, default: 0, min: 0, max: 40 }, 
  examScore: { type: Number, default: 0, min: 0, max: 70 }, 
  totalScore: { type: Number, required: true },
  
  grade: { type: String, enum: ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9', 'A', 'B', 'C', 'P', 'F'] },
  
  // Context
  term: { type: String, enum: ['First', 'Second', 'Third'], required: true },
  session: { type: String, required: true }, 
  classAtTime: { type: String, required: true }, 

  // Feedback
  teacherRemarks: { type: String, default: "Good performance, keep it up." },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // For CBT automated results
  isCbtResult: { type: Boolean, default: false },
  examRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }

}, { timestamps: true });

// Auto-calculate total and assign grade before saving
resultSchema.pre('save', function (next) {
  this.totalScore = this.caScore + this.examScore;
  
  if (this.totalScore >= 75) this.grade = 'A1';
  else if (this.totalScore >= 70) this.grade = 'B2';
  else if (this.totalScore >= 65) this.grade = 'B3';
  else if (this.totalScore >= 50) this.grade = 'C6';
  else if (this.totalScore >= 40) this.grade = 'D7';
  else this.grade = 'F9';
  
  next();
});

export const Result = mongoose.model('Result', resultSchema);