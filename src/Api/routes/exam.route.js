import { Router } from "express";
import * as CBTController from "../controllers/exam.controller.js";
import { authenticate, restrictTo } from "../middleware/auth.middleware.js";
import {
  validateExamSubmission,
  validateQuestionBank,
  validateExamCreation,
} from "../config/validation.js";
const router = Router();

router.use(authenticate);

router.get("/my-exams", restrictTo("student"), CBTController.getStudentExams);

router.get(
  "/start/:examId",
  restrictTo("student"),
  CBTController.startExamAttempt,
);

router.post(
  "/submit",
  restrictTo("student"),
  CBTController.submitExam,
);

router.post(
  "/questions",
  restrictTo("teacher", "admin"),
  validateQuestionBank,
  CBTController.addQuestionToBank,
);

router.get(
  "/questions/all",
  restrictTo("teacher", "admin"),
  CBTController.getAllQuestions,
);

router.post(
  "/create-paper",
  restrictTo("teacher", "admin"),
  validateExamCreation,
  CBTController.createExamPaper,
);

router.get(
  "/fetch-existing", 
  restrictTo('teacher', 'admin'), 
  CBTController.getExistingResults
);

router.get(
  "/engagement-stats",
  restrictTo("teacher", "admin"),
  CBTController.getEngagementStats,
);

export default router;
