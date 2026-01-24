import { Exam } from '../models/Exam.js';

export const validateExamAccess = (userAgent, examSettings) => {
  if (examSettings.sebRequired && !userAgent.includes('SafeExamBrowser')) {
    return { authorized: false, message: 'SEB Required' };
  }
  return { authorized: true };
};

export const getAvailableExams = async (studentId) => {
  return await Exam.find({ status: 'published' }).select('-questions.correctAnswer');
};