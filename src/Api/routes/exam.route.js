import { Router } from "express";
import * as CBTController from "../controllers/exam.controller.js";
import { authenticate, restrictTo } from "../middleware/auth.middleware.js";
import { 
  validateExamSubmission, 
  validateQuestionBank, 
  validateExamCreation 
} from "../config/validation.js"; 
const router = Router();

router.use(authenticate);


router.get("/my-exams", 
  restrictTo('student'), 
  CBTController.getStudentExams
);

router.get("/start/:examId", 
  restrictTo('student'), 
  CBTController.startExamAttempt
);

router.post("/submit", 
  restrictTo('student'), 
  validateExamSubmission, 
  CBTController.submitExam
);

router.post("/questions", 
  restrictTo('teacher', 'admin'), 
  validateQuestionBank, 
  CBTController.addQuestionToBank
);

router.post("/create-paper", 
  restrictTo('teacher', 'admin'), 
  validateExamCreation, 
  CBTController.createExamPaper
);

export default router;