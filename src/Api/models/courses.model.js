import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., Intro to Node.js
  courseCode: { type: String, unique: true, required: true }, // e.g., SWE101
  description: String,
  credits: Number,
  department: String,
  semester: { type: String, enum: ['1st', '2nd'], required: true },
  level: { type: String, default: '100' } // e.g., 100, 200 level
});

export const Course = mongoose.model('Course', courseSchema);