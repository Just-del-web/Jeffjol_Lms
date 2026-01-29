import mongoose from 'mongoose';


const CBTResultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  examSession: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamSession' },

  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  percentage: { type: Number }, 
  grade: { type: String }, 

  attemptData: {
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    durationInMinutes: { type: Number },
    ipAddress: String, 
    tabSwitches: { type: Number, default: 0 }, 
    browserInfo: String
  },

  responses: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: String,
    isCorrect: Boolean
  }],

  status: { type: String, enum: ['Passed', 'Failed', 'Pending Review'], default: 'Pending Review' }
}, { timestamps: true });

module.exports = mongoose.model('CBTResult', CBTResultSchema);