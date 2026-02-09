import { ResultService } from "../service/result.service.js";
import { PDFService } from "../service/pdf.service.js";
import { User } from "../models/user.model.js";
import { successResponse, errorResponse } from "../utils/helper.js";

const pdfService = new PDFService();
const resultService = new ResultService();

// 1. Fetch Academic Records
export const getMyResults = async (req, res, next) => {
  try {
    const { role, userId } = req;
    const { term, session } = req.query;
    let studentId = userId;

    if (role === "parent") {
      studentId = req.query.childId;
      if (!studentId)
        return res
          .status(400)
          .json(errorResponse(400, "Child ID is required."));

      const history = await resultService.getStudentResultForParent(
        userId,
        studentId,
        term,
        session,
      );
      return res
        .status(200)
        .json(successResponse(200, "Child's history fetched", history));
    }

    const history = await resultService.getStudentAcademicHistory(studentId);
    const analytics = await resultService.getPerformanceAnalytics(studentId);

    return res
      .status(200)
      .json(successResponse(200, "History fetched", { history, analytics }));
  } catch (error) {
    next(error);
  }
};

export const getBroadsheet = async (req, res, next) => {
  try {
    const { className, term, session } = req.query;
    if (!className || !term || !session) {
      return res.status(400).json(errorResponse(400, "Class, Term, and Session are required."));
    }

    const data = await resultService.generateClassBroadsheet(className, term, session);
    return res.status(200).json(successResponse(200, "Broadsheet generated.", data));
  } catch (error) {
    next(error);
  }
};

// 2. Download PDF Report Card
export const downloadReportCard = async (req, res, next) => {
  try {
    const { term, session } = req.query;
    const { role, userId } = req;
    const targetId =
      role === "parent" ? req.query.childId : req.query.studentId || userId;

    const student = await User.findById(targetId);
    if (!student)
      return res.status(404).json(errorResponse(404, "Student not found."));

    const history = await resultService.getStudentAcademicHistory(targetId);
    const termResults = history.filter(
      (r) => r.term === term && r.session === session,
    );

    if (termResults.length === 0) {
      return res
        .status(404)
        .json(errorResponse(404, "No results published for this term yet."));
    }

    const analytics = await resultService.getPerformanceAnalytics(targetId);
    const pdfBuffer = await pdfService.generateReportCard(
      student,
      termResults,
      analytics,
    );

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${student.lastName}_Report.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

// 3. Bulk Upload for Teachers
export const bulkUploadGrades = async (req, res, next) => {
  try {
    const { results, className } = req.body;
    const summary = await resultService.bulkUploadResults(
      req.userId,
      results,
      className,
    );
    return res
      .status(200)
      .json(successResponse(200, "Grades uploaded.", summary));
  } catch (error) {
    next(error);
  }
};
