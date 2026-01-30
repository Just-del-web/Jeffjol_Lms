import mongoose from 'mongoose';

// --- QUESTION BANK MODEL ---
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  image: { type: String }, // URL for diagrams/charts
  type: { type: String, enum: ['multiple-choice', 'theory'], default: 'multiple-choice' },
  options: [{
    text: { type: String, required: true },
    letter: { type: String, enum: ['A', 'B', 'C', 'D', 'E'] }
  }],
  correctAnswer: { type: String, required: true }, // Store the letter (e.g., 'B')
  explanation: String, // Shown to students AFTER the exam is closed
  marks: { type: Number, default: 2 },
  subject: { type: String, required: true, index: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
}, { timestamps: true });

export const Question = mongoose.model('Question', questionSchema);

// --- EXAM (ASSESSMENT) MODEL ---
const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  subject: { type: String, required: true },
  
  // Timing & Access
  duration: { type: Number, required: true }, // in minutes
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  
  // Security Features
  sebRequired: { type: Boolean, default: true },
  shuffleQuestions: { type: Boolean, default: true },
  shuffleOptions: { type: Boolean, default: true },
  allowBacktrack: { type: Boolean, default: true }, // Can students go back to previous questions?

  // Targeting (Which class is taking this?)
  targetClass: { type: String, required: true }, // e.g., 'SS3'
  targetArm: [String], // e.g., ['A', 'Science']

  // Content
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  
  totalMarks: Number,
  passPercentage: { type: Number, default: 50 },
  
  status: { type: String, enum: ['draft', 'published', 'ongoing', 'closed'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Exam = mongoose.model('Exam', examSchema);

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  
  score: { type: Number, required: true }, 
  percentage: { type: Number, required: true }, 
  totalPossible: { type: Number, required: true },
  
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: String, // e.g., 'B'
    isCorrect: Boolean,
    marksEarned: Number
  }],

  status: { type: String, enum: ['pass', 'fail'], required: true },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Result = mongoose.model('Result', resultSchema);