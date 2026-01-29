import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semester: String,
  academicYear: String, 
  status: { type: String, enum: ['registered', 'completed', 'dropped'], default: 'registered' },
  enrolledAt: { type: Date, default: Date.now }
});

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);