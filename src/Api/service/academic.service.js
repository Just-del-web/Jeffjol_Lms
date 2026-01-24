import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { Result } from '../models/Result.js';

export const registerCourses = async (studentId, courseIds, session) => {
  const enrollments = courseIds.map(courseId => ({
    student: studentId,
    course: courseId,
    academicYear: session,
    status: 'registered'
  }));
  return await Enrollment.insertMany(enrollments);
};

export const uploadStudentResult = async (teacherId, data) => {
  const { studentId, subject, score, term, session } = data;
  
  let grade = 'F';
  if (score >= 70) grade = 'A';
  else if (score >= 60) grade = 'B';
  else if (score >= 50) grade = 'C';
  else if (score >= 45) grade = 'D';

  return await Result.create({
    student: studentId,
    teacher: teacherId,
    subject,
    score,
    grade,
    term,
    session
  });
};