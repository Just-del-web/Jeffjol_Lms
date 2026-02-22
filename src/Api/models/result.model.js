import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }, 
  subject: { type: String, required: true },
  
  score: { type: Number, default: 0 }, 
  totalPossible: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  caScore: { type: Number, default: 0 }, 
  examScore: { type: Number, default: 0 }, 
  totalScore: { type: Number, default: 0 },

  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: String,
    isCorrect: Boolean,
    marksEarned: Number
  }],

  grade: { type: String },
  remarks: { type: String },
  status: { type: String, enum: ['pass', 'fail'], required: true },

  term: { type: String, required: true },
  session: { type: String, required: true }, 
  classAtTime: { type: String, required: true }, 
  batchId: { type: String }, 
}, { timestamps: true });

resultSchema.pre('save', async function () {
  const scoreFromCBT = this.score || 0;
  const ca = this.caScore || 0;
  const exam = this.examScore || 0;

  this.totalScore = scoreFromCBT > 0 ? scoreFromCBT : (ca + exam);
  
  const total = this.totalScore;
  
  if (total >= 90) { this.grade = 'A1'; this.remarks = 'Distinction'; }
  else if (total >= 75) { this.grade = 'B2'; this.remarks = 'Very Good'; }
  else if (total >= 60) { this.grade = 'C4'; this.remarks = 'Good'; }
  else if (total >= 50) { this.grade = 'C6'; this.remarks = 'Pass'; }
  else { this.grade = 'F9'; this.remarks = 'Still Learning'; }

  if (!this.batchId) {
    const sId = this.student._id ? this.student._id.toString() : this.student.toString();
    this.batchId = `${sId}_${this.term}_${this.session}`;
  }

});

export const Result = mongoose.models.Result || mongoose.model('Result', resultSchema);