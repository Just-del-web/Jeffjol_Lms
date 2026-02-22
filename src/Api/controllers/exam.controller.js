import { CBTService } from "../service/exam.service.js";
import { Question } from "../models/exam.model.js"; 
import { successResponse, errorResponse } from "../utils/helper.js";
import logger from "../logging/logger.js";

const cbtLogger = logger.child({ service: "CBT_CONTROLLER" });
const cbtService = new CBTService();

export const getStudentExams = async (req, res, next) => {
  try {
    cbtLogger.info(`Fetching available exams for student: ${req.userId}`);
    const data = await cbtService.getAvailableExams(req.userId);
   
    return res.status(200).json(
      successResponse(200, "Exams fetched successfully", data)
    );
  } catch (error) {
    cbtLogger.error(`Failed to fetch student exams: ${error.message}`);
    next(error); // Correctly passing to global error handler
  }
};

export const getEngagementStats = async (req, res, next) => {
  try {
    cbtLogger.info(`Fetching engagement stats for teacher: ${req.userId}`);
    const stats = await cbtService.getClassEngagementStats(req.userId);
    return res.status(200).json(successResponse(200, "Stats fetched", stats));
  } catch (error) {
    cbtLogger.error(`Stats Fetch Error: ${error.message}`);
    next(error); // Added missing next call
  }
};

export const startExamAttempt = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const userAgent = req.headers['user-agent'];
    
    cbtLogger.info(`Student ${req.userId} attempting to start exam ${examId}`);
    const examData = await cbtService.startExam(examId, req.userId, userAgent);

    return res.status(200).json(
      successResponse(200, "Exam started. Good luck!", examData)
    );
  } catch (error) {
    cbtLogger.warn(`Access Denied | User: ${req.userId} | Reason: ${error.message}`);
    
    // Check for specific custom errors
    let statusCode = 0;
    if (error.message === "NOT_CLEARED_FOR_EXAMS") statusCode = 402; 
    else if (error.message === "ALREADY_SUBMITTED") statusCode = 409;    
    else if (error.message === "EXAM_NOT_YET_OPEN") statusCode = 423;    
    else if (error.message === "EXAM_ALREADY_CLOSED") statusCode = 410; 
    else if (error.message === "SEB_REQUIRED") statusCode = 451; 

    // If it's one of our handled status codes, return response
    if (statusCode !== 0) {
      return res.status(statusCode).json(errorResponse(statusCode, error.message));
    }
    
    // If it's an unexpected error, pass to the global handler
    next(error); 
  }
};

export const submitExam = async (req, res, next) => {
  try {
    const { examId, answers } = req.body; 

    cbtLogger.info(`Submission received for Exam ${examId} from User ${req.userId}`);

    if (!examId || !answers) {
      cbtLogger.error(`Invalid submission payload from User ${req.userId}`);
      return res.status(400).json(errorResponse(400, "Missing Exam ID or answers."));
    }
    
    const result = await cbtService.processSubmission(examId, req.userId, answers);

    return res.status(200).json(
      successResponse(200, "Exam submitted successfully.", result)
    );
  } catch (error) {
    cbtLogger.error(`Submission Calculation Error for User ${req.userId}: ${error.message}`);
    
    let statusCode = 0;
    if (error.message === "TIME_EXPIRED") statusCode = 403;
    else if (error.message === "ALREADY_SUBMITTED") statusCode = 409;

    if (statusCode !== 0) {
      return res.status(statusCode).json(errorResponse(statusCode, error.message));
    }

    next(error); // THIS ensures the "next" function is actually called if code fails elsewhere
  }
};

export const addQuestionToBank = async (req, res, next) => {
  try {
    cbtLogger.info(`Teacher ${req.userId} adding question to bank`);
    const question = await Question.create({
        ...req.body,
        createdBy: req.userId
    });
    return res.status(201).json(successResponse(201, "Question saved to bank", question));
  } catch (error) {
    cbtLogger.error(`Bank Addition Error: ${error.message}`);
    next(error);
  }
};

export const getAllQuestions = async (req, res, next) => {
  try {
    const { subject, difficulty } = req.query;
    const query = {};
    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;

    const questions = await Question.find(query).sort({ createdAt: -1 });
    return res.status(200).json(successResponse(200, "Question bank fetched", questions));
  } catch (error) {
    next(error);
  }
};

export const getExistingResults = async (req, res, next) => {
  try {
    cbtLogger.info(`Teacher ${req.userId} fetching existing scores for ${req.query.subject}`);
    
    const results = await resultService.getExistingScores(req.query);
    
    return res.status(200).json(
      successResponse(200, "Existing scores fetched", results)
    );
  } catch (error) {
    cbtLogger.error(`Error fetching existing scores: ${error.message}`);
    next(error);
  }
};

export const createExamPaper = async (req, res, next) => {
  try {
    cbtLogger.info(`Exam Creation Request by Teacher: ${req.userId}`);
    const exam = await cbtService.createExamPaper(req.body, req.userId);
    return res.status(201).json(successResponse(201, "Exam paper created successfully", exam));
  } catch (error) {
    cbtLogger.error(`Exam Creation Error: ${error.message}`);
    if (error.message === "NO_VALID_QUESTIONS_PROVIDED") {
      return res.status(400).json(errorResponse(400, error.message));
    }
    next(error);
  }
};