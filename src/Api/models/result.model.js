import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true },
  
  caScore: { type: Number, default: 0, min: 0, max: 40 }, 
  examScore: { type: Number, default: 0, min: 0, max: 60 }, 
  totalScore: { type: Number, default: 0 },
  
  grade: { type: String, enum: ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'] },
  
  term: { type: String, enum: ['First', 'Second', 'Third'], required: true },
  session: { type: String, required: true }, 
  classAtTime: { type: String, required: true }, 

  batchId: { type: String, index: true },

  teacherRemarks: { type: String, default: "Good performance, keep it up." },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  isCbtResult: { type: Boolean, default: false },
  examRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }

}, { timestamps: true });

resultSchema.pre('save', function (next) {
  this.totalScore = this.caScore + this.examScore;
  
  const total = this.totalScore;
  if (total >= 75) this.grade = 'A1';
  else if (total >= 70) this.grade = 'B2';
  else if (total >= 65) this.grade = 'B3';
  else if (total >= 60) this.grade = 'C4';
  else if (total >= 55) this.grade = 'C5';
  else if (total >= 50) this.grade = 'C6';
  else if (total >= 45) this.grade = 'D7';
  else if (total >= 40) this.grade = 'E8';
  else this.grade = 'F9';
  
  if (!this.batchId) {
    this.batchId = `${this.student}_${this.term}_${this.session}`;
  }

  next();
});

export const Result = mongoose.models.Result || mongoose.model('Result', resultSchema);