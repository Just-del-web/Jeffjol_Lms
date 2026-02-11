import { ResultService } from "../service/result.service.js";
import { PDFService } from "../service/pdf.service.js";
import { User } from "../models/user.model.js";
import { successResponse, errorResponse } from "../utils/helper.js";

const pdfService = new PDFService();
const resultService = new ResultService();

/**
 * FETCH ACADEMIC RECORDS
 * Dynamic handling for Student or Parent identity
 */
export const getMyResults = async (req, res, next) => {
  try {
    const { role, userId } = req;
    const { term, session, childId } = req.query;
    let targetId = userId;

    if (role === "parent") {
      if (!childId) return res.status(400).json(errorResponse(400, "Child ID is required."));
      
      const history = await resultService.getStudentResultForParent(userId, childId, term, session);
      return res.status(200).json(successResponse(200, "Child's history fetched", history));
    }

    // Default Student View
    const history = await resultService.getStudentAcademicHistory(targetId);
    const analytics = await resultService.getPerformanceAnalytics(targetId);

    return res.status(200).json(successResponse(200, "Academic history fetched", { history, analytics }));
  } catch (error) {
    next(error);
  }
};

/**
 * GENERATE BROADSHEET
 * Admin/Teacher view of entire class performance
 */
export const getBroadsheet = async (req, res, next) => {
  try {
    const { className, term, session } = req.query;
    if (!className || !term || !session) {
      return res.status(400).json(errorResponse(400, "Class, Term, and Session are required."));
    }

    const data = await resultService.generateClassBroadsheet(className, term, session);
    return res.status(200).json(successResponse(200, "Class broadsheet generated.", data));
  } catch (error) {
    next(error);
  }
};

/**
 * DOWNLOAD REPORT CARD (PDF)
 * Integrates the Montserrat Layout + Profile Picture
 */
export const downloadReportCard = async (req, res, next) => {
  try {
    const { term, session, studentId } = req.query;
    const { role, userId } = req;
    
    // Determine who we are downloading for
    const targetId = role === "parent" ? req.query.childId : studentId || userId;

    const student = await User.findById(targetId).populate('profile');
    if (!student) return res.status(404).json(errorResponse(404, "Student record not found."));

    const history = await resultService.getStudentAcademicHistory(targetId);
    
    // Filter for the requested period
    const termResults = history.filter(r => r.term === term && r.session === session);

    if (termResults.length === 0) {
      return res.status(404).json(errorResponse(404, "No results found for the selected term."));
    }

    const analytics = await resultService.getPerformanceAnalytics(targetId);

    // This service handles the Primary/Secondary/Nursery Template Switching
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

/**
 * BULK UPLOAD
 * Primary entry point for Teachers
 */
export const bulkUploadGrades = async (req, res, next) => {
  try {
    const { results, className } = req.body;
    
    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json(errorResponse(400, "Valid results array is required."));
    }

    const summary = await resultService.bulkUploadResults(
      req.userId,
      results,
      className,
    );

    return res.status(200).json(successResponse(200, "Bulk grade synchronization complete.", summary));
  } catch (error) {
    next(error);
  }
};