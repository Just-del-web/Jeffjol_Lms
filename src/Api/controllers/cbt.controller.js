import * as cbtService from '../services/exam.service.js';

export const getAvailableExams = async (req, res) => {
  try {
    // We get the studentId from the 'authenticate' middleware we built earlier
    const exams = await cbtService.getAvailableExams(req.userId);
    return res.status(200).json(successResponse(200, "Exams fetched successfully", exams));
  } catch (error) {
    return res.status(500).json(errorResponse(500, "Failed to load exams."));
  }
};

export const startExam = async (req, res) => {
  try {
    const userAgent = req.headers['user-agent'];
    const { examSettings } = req.body; // Passed from frontend or fetched by ID

    const access = cbtService.validateExamAccess(userAgent, examSettings);
    if (!access.authorized) {
      return res.status(403).json(errorResponse(403, access.message));
    }

    return res.status(200).json(successResponse(200, "Access Granted. Good luck!"));
  } catch (error) {
    return res.status(500).json(errorResponse(500, error.message));
  }
};