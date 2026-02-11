import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: { type: String, required: true },
  
  caScore: { type: Number, default: 0, min: 0, max: 40 }, 
  examScore: { type: Number, default: 0, min: 0, max: 60 }, 
  totalScore: { type: Number, default: 0 },
  grade: { type: String },
  remarks: { type: String },

  behavioralData: {
    writingSkill: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor'] },
    punctuality: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor'] },
    neatness: { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor'] },
    attendance: { type: String } 
  },

  term: { type: String, enum: ['First', 'Second', 'Third'], required: true },
  session: { type: String, required: true }, 
  classAtTime: { type: String, required: true }, 
  batchId: { type: String, index: true }, // Logic: studentId_term_session
}, { timestamps: true });

resultSchema.pre('save', function (next) {
  this.totalScore = this.caScore + this.examScore;
  const total = this.totalScore;
  
  // Custom Grading from your Word Doc
  if (total >= 90) { this.grade = 'A1'; this.remarks = 'Distinction'; }
  else if (total >= 75) { this.grade = 'B2'; this.remarks = 'Very Good'; }
  else if (total >= 60) { this.grade = 'C4'; this.remarks = 'Good'; }
  else if (total >= 50) { this.grade = 'C6'; this.remarks = 'Pass'; }
  else { this.grade = 'F9'; this.remarks = 'Still Learning'; }

  if (!this.batchId) {
    this.batchId = `${this.student}_${this.term}_${this.session}`;
  }
  next();
});

export const Result = mongoose.models.Result || mongoose.model('Result', resultSchema);