import { CBTService } from "../services/cbt.service.js";
import { Question } from "../models/exam.model.js"; 
import { successResponse, errorResponse } from "../utils/helper.js";
import logger from "../logging/logger.js";

const cbtLogger = logger.child({ service: "CBT_CONTROLLER" });
const cbtService = new CBTService();


export const getStudentExams = async (req, res) => {
  try {
    const exams = await cbtService.getAvailableExams(req.userId);
    return res.status(200).json(
      successResponse(200, "Exams fetched successfully", exams)
    );
  } catch (error) {
    cbtLogger.error(`Fetch Exams Error: ${error.message}`);
    return res.status(400).json(errorResponse(400, error.message));
  }
};


export const startExamAttempt = async (req, res) => {
  try {
    const { examId } = req.params;
    const userAgent = req.headers['user-agent'];
    
    const examData = await cbtService.startExam(examId, req.userId, userAgent);

    return res.status(200).json(
      successResponse(200, "Exam started. Good luck!", examData)
    );
  } catch (error) {
    cbtLogger.warn(`Access Denied | User: ${req.userId} | Reason: ${error.message}`);
    
    let statusCode = 403; 
    if (error.message === "NOT_CLEARED_FOR_EXAMS") statusCode = 402; 
    if (error.message === "ALREADY_SUBMITTED") statusCode = 409;    
    if (error.message === "EXAM_NOT_YET_OPEN") statusCode = 423;    
    if (error.message === "EXAM_ALREADY_CLOSED") statusCode = 410; // Gone (Time over)

    return res.status(statusCode).json(errorResponse(statusCode, error.message));
  }
};


export const submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body; 

    if (!examId || !answers) {
      return res.status(400).json(errorResponse(400, "Missing Exam ID or answers."));
    }
    
    const result = await cbtService.processSubmission(examId, req.userId, answers);

    return res.status(200).json(
      successResponse(200, "Exam submitted successfully. Results calculated.", result)
    );
  } catch (error) {
    cbtLogger.error(`Submission Error for User ${req.userId}: ${error.message}`);
    
    let statusCode = 500;
    if (error.message === "TIME_EXPIRED") statusCode = 403;
    if (error.message === "ALREADY_SUBMITTED") statusCode = 409;

    return res.status(statusCode).json(errorResponse(statusCode, error.message));
  }
};


export const addQuestionToBank = async (req, res) => {
  try {
    const question = await Question.create({
        ...req.body,
        createdBy: req.userId
    });
    return res.status(201).json(successResponse(201, "Question saved to bank", question));
  } catch (error) {
    cbtLogger.error(`Bank Addition Error: ${error.message}`);
    return res.status(400).json(errorResponse(400, "Failed to save question. Check your data structure."));
  }
};


export const createExamPaper = async (req, res) => {
  try {
    const exam = await cbtService.createExamPaper(req.body, req.userId);
    return res.status(201).json(successResponse(201, "Exam paper created and linked", exam));
  } catch (error) {
    cbtLogger.error(`Exam Creation Error: ${error.message}`);
    return res.status(400).json(errorResponse(400, error.message));
  }
};