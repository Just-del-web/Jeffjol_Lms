import { Router } from "express";
import * as BursaryController from "../controllers/bursary.controller.js";
import { authenticate, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/config", 
  restrictTo('admin'), 
  BursaryController.configureFees
);

router.get("/class-report", 
  restrictTo('admin', 'teacher'), 
  BursaryController.getClassFinancialReport
);

router.get("/my-balance", 
  restrictTo('student', 'parent', 'admin'), 
  BursaryController.getStudentBalance
);

export default router;