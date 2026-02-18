import { ResultService } from "../service/result.service.js";
import { PDFService } from "../service/pdf.service.js";
import { User } from "../models/user.model.js";
import StudentProfile from "../models/student_profile.model.js";
import { successResponse, errorResponse } from "../utils/helper.js";

const pdfService = new PDFService();
const resultService = new ResultService();


export const getMyResults = async (req, res, next) => {
  try {
    const { role, userId } = req;
    const { term, session, childId } = req.query; 
    let targetId = userId;

    if (role === "parent") {
      if (!childId) return res.status(400).json(errorResponse(400, "Child selection is required."));
      
      const history = await resultService.getStudentResultForParent(userId, childId, term, session);
      return res.status(200).json(successResponse(200, "Child's history fetched", history));
    }

    const history = await resultService.getStudentAcademicHistory(targetId, term, session);
    const analytics = await resultService.getPerformanceAnalytics(targetId, term, session);

    return res.status(200).json(successResponse(200, "Academic history synchronized.", { history, analytics }));
  } catch (error) {
    next(error);
  }
};


export const getBroadsheet = async (req, res, next) => {
  try {
    const { className, term, session } = req.query;
    if (!className || !term || !session) {
      return res.status(400).json(errorResponse(400, "Class, Term, and Session filters are required."));
    }

    const data = await resultService.generateClassBroadsheet(className, term, session);
    return res.status(200).json(successResponse(200, "Class broadsheet generated successfully.", data));
  } catch (error) {
    next(error);
  }
};

export const getStudentsByClass = async (req, res, next) => {
  try {
    const { className } = req.params;
    
    const profiles = await StudentProfile.find({ currentClass: className })
      .populate({
        path: 'user',
        select: 'firstName lastName email profile' 
      });

    const students = profiles.map(p => ({
      _id: p.user._id,
      firstName: p.user.firstName,
      lastName: p.user.lastName,
      studentId: p.studentId || p._id.toString().slice(-6),
      profilePicture: p.profilePicture
    }));

    return res.status(200).json(successResponse(200, "Class list fetched.", students));
  } catch (error) {
    next(error);
  }
};

export const downloadReportCard = async (req, res, next) => {
  try {
    const { term, session, studentId } = req.query;
    const { role, userId } = req;
    const targetId = role === "parent" ? req.query.childId : studentId || userId;
    const student = await User.findById(targetId).populate('profile');
    if (!student) return res.status(404).json(errorResponse(404, "Student record not found."));
    const termResults = await resultService.getStudentAcademicHistory(targetId, term, session);

    if (termResults.length === 0) {
      return res.status(404).json(errorResponse(404, "No verified results found for the selected period."));
    }
    const analytics = await resultService.getPerformanceAnalytics(targetId, term, session);
    const pdfBuffer = await pdfService.generateReportCard(
      student,
      termResults,
      analytics
    );
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${student.lastName}_Report_Card.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const bulkUploadGrades = async (req, res, next) => {
  try {
    const { results, className } = req.body;
    
    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json(errorResponse(400, "A valid list of results is required."));
    }

    const summary = await resultService.bulkUploadResults(
      req.userId,
      results,
      className,
    );

    return res.status(200).json(successResponse(200, "Class grades updated and synced.", summary));
  } catch (error) {
    next(error);
  }
};