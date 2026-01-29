import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  courseCode: { type: String, unique: true, required: true }, 
  description: String,
  credits: Number,
  department: String,
  semester: { type: String, enum: ['1st', '2nd'], required: true },
  level: { type: String, default: '100' } 
});

export const Course = mongoose.model('Course', courseSchema);