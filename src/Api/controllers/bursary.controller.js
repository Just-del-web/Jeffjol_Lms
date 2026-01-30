import { BursaryService } from "../services/bursary.service.js";
import { successResponse, errorResponse } from "../utils/helper.js";
import logger from "../logging/logger.js";

const bursarLogger = logger.child({ service: "BURSARY_CONTROLLER" });
const bursaryService = new BursaryService();

export const configureFees = async (req, res) => {
  try {
    const fee = await bursaryService.configureFee(req.body, req.userId);
    return res.status(201).json(
      successResponse(201, `Fees for ${req.body.targetClass} updated successfully.`, fee)
    );
  } catch (error) {
    bursarLogger.error(`Fee Config Error: ${error.message}`);
    return res.status(400).json(errorResponse(400, "Failed to update fee structure."));
  }
};


export const getStudentBalance = async (req, res) => {
  try {
    const { term, session, studentId } = req.query;
    const { role, userId } = req;

    let targetStudentId = userId;
    if (role === 'parent' || role === 'admin') {
      if (!studentId) return res.status(400).json(errorResponse(400, "Student ID is required."));
      targetStudentId = studentId;
    }

    const balanceData = await bursaryService.getStudentBalance(targetStudentId, term, session);
    
    return res.status(200).json(
      successResponse(200, "Payment status retrieved.", balanceData)
    );
  } catch (error) {
    return res.status(400).json(errorResponse(400, error.message));
  }
};


export const getClassFinancialReport = async (req, res) => {
  try {
    const { className, term, session } = req.query;

    if (!className || !term || !session) {
      return res.status(400).json(errorResponse(400, "Class, Term, and Session are required for reports."));
    }

    const report = await bursaryService.getClassFinancials(className, term, session);
    
    return res.status(200).json(
      successResponse(200, `Financial report for ${className} generated.`, report)
    );
  } catch (error) {
    bursarLogger.error(`Report Generation Error: ${error.message}`);
    return res.status(500).json(errorResponse(500, "Internal server error during report generation."));
  }
};