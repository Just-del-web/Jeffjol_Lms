import { Result } from "../models/result.model.js";
import StudentProfile from "../models/student_profile.model.js";
import logger from "../logging/logger.js";
import mongoose from "mongoose";

const resultLogger = logger.child({ service: "RESULT_SERVICE" });

export class ResultService {
 
  _calculateResultDetails(ca, exam) {
    const total = Number(ca) + Number(exam);
    let grade, remarks;

    if (total >= 90) { grade = 'A1'; remarks = 'Distinction'; }
    else if (total >= 75) { grade = 'B2'; remarks = 'Very Good'; }
    else if (total >= 60) { grade = 'C4'; remarks = 'Good'; }
    else if (total >= 50) { grade = 'C6'; remarks = 'Pass'; }
    else { grade = 'F9'; remarks = 'Still Learning'; }

    return { total, grade, remarks };
  }

  
  async bulkUploadResults(teacherId, resultsArray, className) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const studentIds = resultsArray.map((item) => item.studentId);
      const validStudents = await StudentProfile.find({
        user: { $in: studentIds },
        currentClass: className,
      }).select("user");

      const validIds = validStudents.map((s) => s.user.toString());
      const invalidEntries = studentIds.filter((id) => !validIds.includes(id));

      if (invalidEntries.length > 0) {
        throw new Error(`Validation Failed: ${invalidEntries.length} students are not in ${className}.`);
      }

      const ops = resultsArray.map((item) => {
        const batchId = `${item.studentId}_${item.term}_${item.session}`;
        
        const { total, grade, remarks } = this._calculateResultDetails(
          item.caScore || 0, 
          item.examScore || 0
        );

        return {
          updateOne: {
            filter: {
              student: item.studentId,
              subject: item.subject,
              term: item.term,
              session: item.session,
            },
            update: {
              $set: {
                caScore: Number(item.caScore) || 0,
                examScore: Number(item.examScore) || 0,
                totalScore: total, 
                grade: grade,      
                remarks: remarks, 
                behavioralData: item.behavioralData || {},
                classAtTime: className,
                teacher: teacherId,
                batchId,
              },
            },
            upsert: true,
          },
        };
      });

      const result = await Result.bulkWrite(ops, { session });
      await session.commitTransaction();

      resultLogger.info(`Bulk upload successful for ${className}. Count: ${resultsArray.length}`);
      return { success: true, count: resultsArray.length };
    } catch (error) {
      await session.abortTransaction();
      resultLogger.error(`Bulk Upload Failed: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getStudentAcademicHistory(studentId, term, session) {
    const query = { student: studentId };
    if (term) query.term = term;
    if (session) query.session = session;

    return await Result.find(query)
      .populate("teacher", "firstName lastName")
      .sort({ createdAt: -1 })
      .lean();
  }

  
  async getPerformanceAnalytics(studentId, term, session) {
    const query = { student: studentId };
    if (term) query.term = term;
    if (session) query.session = session;

    const results = await Result.find(query);
    if (results.length === 0)
      return { average: 0, totalSubjects: 0, bestSubject: "N/A" };

    const totalScore = results.reduce((sum, r) => sum + (r.totalScore || 0), 0);
    const average = totalScore / results.length;

    const sorted = [...results].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

    return {
      average: Math.round(average * 10) / 10,
      totalSubjects: results.length,
      bestSubject: sorted[0]?.subject || "N/A",
      gpaEquivalent: (average / 20).toFixed(2),
    };
  }

  
  async getStudentResultForParent(parentId, childId, term, session) {
    const studentUser = await mongoose.model("User").findOne({
      _id: childId,
      parent: parentId,
    });

    if (!studentUser) {
      throw new Error("UNAUTHORIZED_ACCESS_TO_CHILD_DATA");
    }

    const query = { student: childId };
    if (term) query.term = term;
    if (session) query.session = session;

    return await Result.find(query).sort({ createdAt: -1 });
  }

  
  async generateClassBroadsheet(className, term, session) {
    const results = await Result.find({ classAtTime: className, term, session })
      .populate("student", "firstName lastName")
      .lean();

    if (results.length === 0)
      throw new Error("No academic records found for this class/term.");

    const broadsheetMap = results.reduce((acc, curr) => {
      const studentId = curr.student._id.toString();
      if (!acc[studentId]) {
        acc[studentId] = {
          studentId,
          name: `${curr.student.firstName} ${curr.student.lastName}`,
          subjects: {},
          grandTotal: 0,
          subjectCount: 0,
        };
      }
      acc[studentId].subjects[curr.subject] = {
        total: curr.totalScore,
        grade: curr.grade,
      };
      acc[studentId].grandTotal += curr.totalScore;
      acc[studentId].subjectCount += 1;
      return acc;
    }, {});

    const broadsheetArray = Object.values(broadsheetMap)
      .map((s) => ({
        ...s,
        average: Math.round((s.grandTotal / s.subjectCount) * 10) / 10,
      }))
      .sort((a, b) => b.average - a.average);

    const updateOps = broadsheetArray.map((s, index) => {
      const pos = index + 1;
      const getSuffix = (n) => {
        const s = ["th", "st", "nd", "rd"], v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
      };

      return Result.updateMany(
        { student: s.studentId, term, session },
        { $set: { positionInClass: getSuffix(pos), classAverage: s.average } },
      );
    });

    await Promise.all(updateOps);
    return broadsheetArray;
  }
}