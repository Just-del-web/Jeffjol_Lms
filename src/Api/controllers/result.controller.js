import { ResultService } from "../service/result.service.js";
import { successResponse, errorResponse } from "../utils/helper.js";
import { PDFService } from "../service/pdf.service.js";
import { User } from "../models/user.model.js"; 

const pdfService = new PDFService();
const resultService = new ResultService();


export const getMyResults = async (req, res) => {
  try {
    const { role, userId } = req;
    const { term, session } = req.query;
    let studentId = userId;

    if (role === 'parent') {
      studentId = req.query.childId;
      if (!studentId) return res.status(400).json(errorResponse(400, "Child ID is required."));
      
      const history = await resultService.getStudentResultForParent(userId, studentId, term, session);
      return res.status(200).json(successResponse(200, "Child's academic history fetched", history));
    }

    const history = await resultService.getStudentAcademicHistory(studentId);
    const analytics = await resultService.getPerformanceAnalytics(studentId);

    return res.status(200).json(successResponse(200, "Academic history fetched", { history, analytics }));
  } catch (error) {
    const status = error.message === "UNAUTHORIZED_PARENTAL_ACCESS" ? 403 : 400;
    return res.status(status).json(errorResponse(status, error.message));
  }
};


export const bulkUploadGrades = async (req, res) => {
  try {
    const { results, className } = req.body; 
    
    if (!results || !results.length) {
        return res.status(400).json(errorResponse(400, "No grade data provided."));
    }
    
    if (!className) {
        return res.status(400).json(errorResponse(400, "Target class name is required."));
    }

    const summary = await resultService.bulkUploadResults(req.userId, results, className);
    return res.status(200).json(successResponse(200, `${summary.count} results processed for ${className}.`, summary));
  } catch (error) {
    return res.status(400).json(errorResponse(400, error.message || "Bulk upload failed."));
  }
};

export const getBroadsheet = async (req, res) => {
  try {
    const { className, term, session } = req.query;
    if (!className || !term || !session) {
      return res.status(400).json(errorResponse(400, "Class, Term, and Session are required."));
    }

    const data = await resultService.generateClassBroadsheet(className, term, session);
    return res.status(200).json(successResponse(200, "Broadsheet generated and class ranked.", data));
  } catch (error) {
    return res.status(400).json(errorResponse(400, error.message));
  }
};

export const downloadReportCard = async (req, res) => {
  try {
    const { term, session } = req.query;
    const { role, userId } = req;

    const targetId = (role === 'parent') ? req.query.childId : (req.query.studentId || userId);

    if (!targetId) return res.status(400).json(errorResponse(400, "Student identifier is missing."));

    const history = await resultService.getStudentAcademicHistory(targetId);
    const analytics = await resultService.getPerformanceAnalytics(targetId);
    const student = await User.findById(targetId);

    if (!student) return res.status(404).json(errorResponse(404, "Student user record not found."));

    const termResults = history.filter(r => r.term === term && r.session === session);

    if (termResults.length === 0) {
      return res.status(404).json(errorResponse(404, "No results found for the specified period."));
    }

    const pdfBuffer = await pdfService.generateReportCard(student, termResults, analytics);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${student.lastName}_${term}_Term_Report.pdf`,
      'Content-Length': pdfBuffer.length
    });

    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json(errorResponse(500, `Failed to generate PDF: ${error.message}`));
  }
};