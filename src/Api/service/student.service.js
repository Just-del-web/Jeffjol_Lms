import StudentProfile from "../models/student_profile.model.js";
import { Content } from "../models/content.model.js";
import { BursaryService } from "./bursary.service.js";
import { Exam } from "../models/exam.model.js";
import { EngagementService } from "./engagement.service.js";
import moment from "moment"; 

const engagementService = new EngagementService();
const bursaryService = new BursaryService();

export class StudentDashboardService {
 
  async getDashboardData(studentId, term, session) {
    
    const profile = await StudentProfile.findOne({ user: studentId }).populate(
      "user",
      "firstName lastName"
    );

    if (!profile) throw new Error("STUDENT_PROFILE_NOT_FOUND");

    const financialSummary = await bursaryService.getStudentBalance(
      studentId,
      term,
      session
    );

    const startOfTerm = moment().startOf("year"); 
    const endOfTerm = moment().endOf("year");

    const attendanceRate = await engagementService.getAttendancePercentage(
      studentId,
      startOfTerm,
      endOfTerm
    );

    const recentMaterials = await Content.find({
      targetClass: profile.currentClass,
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate("uploadedBy", "firstName lastName");

    const activeExams = await Exam.find({
      targetClass: profile.currentClass,
      status: "published",
      examDate: { $gte: new Date() },
    }).select("title subject duration examDate");

    return {
      profile: {
        fullName: `${profile.user.firstName} ${profile.user.lastName}`,
        admissionNumber: profile.admissionNumber,
        class: `${profile.currentClass}${profile.classArm}`,
        isCleared: profile.isClearedForExams,
        attendanceRate: `${attendanceRate}%`, 
      },
      finances: financialSummary,
      libraryHighlights: recentMaterials,
      upcomingExams: activeExams
    };
  }
}