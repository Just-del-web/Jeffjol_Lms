import { Result } from '../models/Result.model.js';
import StudentProfile from '../models/StudentProfile.js';
import logger from '../logging/logger.js';
import mongoose from 'mongoose';

const resultLogger = logger.child({ service: "RESULT_SERVICE" });

export class ResultService {
  /**
   * --- STUDENT/PARENT: ACADEMIC HISTORY ---
   */
  async getStudentAcademicHistory(studentId) {
    return await Result.find({ student: studentId })
      .populate('examRef', 'title duration')
      .sort({ session: -1, term: -1 });
  }

  /**
   * --- ANALYTICS: PERFORMANCE DASHBOARD ---
   */
  async getPerformanceAnalytics(studentId) {
    const results = await Result.find({ student: studentId }).lean();
    if (results.length === 0) return { average: 0, totalExams: 0, bestSubject: "N/A" };

    const average = results.reduce((acc, res) => acc + res.totalScore, 0) / results.length;
    
    // Find highest scoring subject
    const bestRes = [...results].sort((a, b) => b.totalScore - a.totalScore)[0];

    return {
      average: Math.round(average * 10) / 10,
      totalAssessments: results.length,
      bestSubject: bestRes ? `${bestRes.subject} (${bestRes.totalScore}%)` : "N/A",
      recentPerformance: results.slice(-5).map(r => ({ 
        subject: r.subject, 
        score: r.totalScore,
        date: r.createdAt 
      }))
    };
  }

  /**
   * --- TEACHER: BULK CA/GRADE UPLOAD ---
   * Allows teachers to upload marks for a whole class at once
   */
  async bulkUploadResults(teacherId, resultsArray) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const ops = resultsArray.map(item => ({
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
              classAtTime: item.className,
              teacher: teacherId 
            } 
          },
          upsert: true // Create if it doesn't exist, update if it does
        }
      }));

      await Result.bulkWrite(ops, { session });
      await session.commitTransaction();
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
   * --- TEACHER: CLASS BROADSHEET & RANKING ---
   */
  async generateClassBroadsheet(className, term, session) {
    const results = await Result.find({ classAtTime: className, term, session })
      .populate('student', 'firstName lastName')
      .lean();

    const broadsheetMap = results.reduce((acc, curr) => {
      const studentId = curr.student._id.toString();
      if (!acc[studentId]) {
        acc[studentId] = {
          studentId,
          name: `${curr.student.firstName} ${curr.student.lastName}`,
          subjects: {},
          grandTotal: 0,
          average: 0,
          subjectCount: 0
        };
      }
      
      acc[studentId].subjects[curr.subject] = {
        ca: curr.caScore,
        exam: curr.examScore,
        total: curr.totalScore,
        grade: curr.grade
      };
      acc[studentId].grandTotal += curr.totalScore;
      acc[studentId].subjectCount += 1;
      
      return acc;
    }, {});

    // Calculate Averages and Rankings
    const broadsheetArray = Object.values(broadsheetMap).map(s => ({
      ...s,
      average: Math.round((s.grandTotal / s.subjectCount) * 10) / 10
    }));

    // Sort by average to determine position
    return broadsheetArray.sort((a, b) => b.average - a.average);
  }

  /**
   * --- PARENT: VERIFY & FETCH ---
   */
  async getStudentResultForParent(parentId, studentId) {
    const profile = await StudentProfile.findOne({ 
      user: studentId, 
      $or: [{ father: parentId }, { mother: parentId }, { guardian: parentId }] 
    });

    if (!profile) {
      throw new Error("UNAUTHORIZED_PARENTAL_ACCESS");
    }

    return await this.getStudentAcademicHistory(studentId);
  }
}