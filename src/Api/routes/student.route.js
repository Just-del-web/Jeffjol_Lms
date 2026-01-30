import { Router } from "express";
import * as StudentController from "../controllers/student.controller.js";
import { authenticate, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get(
  "/dashboard-overview",
  restrictTo("student", "parent"),
  StudentController.getOverview,
);

export default router;
