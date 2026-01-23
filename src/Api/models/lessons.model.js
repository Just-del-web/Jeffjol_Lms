import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String, // Text or HTML content
  fileUrl: String, // Link to PDF/Video
  subject: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export const Lesson = mongoose.model('Lesson', lessonSchema);