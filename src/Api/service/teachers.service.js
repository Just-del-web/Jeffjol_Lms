import { Lesson } from '../models/Lesson.js';
import { Result } from '../models/Result.js';
import { Enrollment } from '../models/Enrollment.js';

export const getAssignedStudents = async (courseId) => {
  return await Enrollment.find({ course: courseId }).populate('student', 'name email');
};

export const uploadLessonMaterial = async (teacherId, lessonData) => {
  return await Lesson.create({
    ...lessonData,
    teacher: teacherId
  });
};

export const bulkUploadResults = async (teacherId, resultsArray) => {
  
  const formattedResults = resultsArray.map(res => ({
    ...res,
    teacher: teacherId,
    grade: res.score >= 70 ? 'A' : res.score >= 60 ? 'B' : res.score >= 50 ? 'C' : 'F'
  }));
  
  return await Result.insertMany(formattedResults);
};