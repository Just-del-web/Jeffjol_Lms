import { Result } from '../models/result.model.js';
import StudentProfile from '../models/student_profile.model.js';
import logger from '../logging/logger.js';
import mongoose from 'mongoose';

const resultLogger = logger.child({ service: "RESULT_SERVICE" });

export class ResultService {

  /**
   * --- TEACHER: BULK CA/GRADE UPLOAD ---
   * Validates student-class alignment before saving.
   */
  async bulkUploadResults(teacherId, resultsArray, className) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 1. Validate: Ensure students belong to the specified class
      const studentIds = resultsArray.map(item => item.studentId);
      const validStudents = await StudentProfile.find({
        user: { $in: studentIds },
        currentClass: className
      }).select('user');

      const validIds = validStudents.map(s => s.user.toString());
      const invalidEntries = studentIds.filter(id => !validIds.includes(id));

      if (invalidEntries.length > 0) {
        throw new Error(`Validation Failed: ${invalidEntries.length} students are not in ${className}.`);
      }

      // 2. Prepare Bulk Operations
      const ops = resultsArray.map(item => {
        const batchId = `${item.studentId}_${item.term}_${item.session}`;
        return {
          updateOne: {
            filter: { 
              student: item.studentId, 
              subject: item.subject, 
              term: item.term, 
              session: item.session 
            },
            update: { 
              $set: { 
                caScore: item.caScore, 
                examScore: item.examScore || 0,
                classAtTime: className,
                teacher: teacherId,
                batchId 
              } 
            },
            upsert: true 
          }
        };
      });

      const result = await Result.bulkWrite(ops, { session });
      await session.commitTransaction();
      
      resultLogger.info(`Bulk upload for ${className} successful. Modified: ${result.modifiedCount}`);
      return { success: true, count: resultsArray.length };
    } catch (error) {
      await session.abortTransaction();
      resultLogger.error(`Bulk Upload Failed: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * --- ADMIN: COMPILER & RANKING ENGINE ---
   * Groups results by student, calculates averages, and saves positions.
   */
  async generateClassBroadsheet(className, term, session) {
    const results = await Result.find({ classAtTime: className, term, session })
      .populate('student', 'firstName lastName')
      .lean();

    if (results.length === 0) throw new Error("No results found for this criteria.");

    // 1. Group by student
    const broadsheetMap = results.reduce((acc, curr) => {
      const studentId = curr.student._id.toString();
      if (!acc[studentId]) {
        acc[studentId] = {
          studentId,
          name: `${curr.student.firstName} ${curr.student.lastName}`,
          subjects: {},
          grandTotal: 0,
          subjectCount: 0
        };
      }
      acc[studentId].subjects[curr.subject] = { total: curr.totalScore, grade: curr.grade };
      acc[studentId].grandTotal += curr.totalScore;
      acc[studentId].subjectCount += 1;
      return acc;
    }, {});

    // 2. Sort by Average
    const broadsheetArray = Object.values(broadsheetMap)
      .map(s => ({
        ...s,
        average: Math.round((s.grandTotal / s.subjectCount) * 10) / 10
      }))
      .sort((a, b) => b.average - a.average);

    // 3. Write Positions to DB
    const updateOps = broadsheetArray.map((s, index) => {
      const pos = index + 1;
      const getSuffix = (n) => {
        const s = ["th", "st", "nd", "rd"], v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
      };

      return Result.updateMany(
        { student: s.studentId, term, session },
        { $set: { positionInClass: getSuffix(pos), classAverage: s.average } }
      );
    });

    await Promise.all(updateOps);
    return broadsheetArray;
  }
}