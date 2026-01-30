import { Router } from "express";
import * as ResultController from "../controllers/result.controller.js";
import { authenticate, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get(
  "/my-history",
  restrictTo("student", "parent"),
  ResultController.getMyResults,
);

router.get(
  "/download-report",
  restrictTo("student", "parent", "teacher", "admin"),
  ResultController.downloadReportCard,
);

router.get(
  "/broadsheet",
  restrictTo("teacher", "admin"),
  ResultController.getBroadsheet,
);

router.post(
  "/bulk-upload",
  restrictTo("teacher", "admin"),
  ResultController.bulkUploadGrades,
);

router.get(
  "/transcript/:studentId",
  restrictTo("teacher", "admin"),
  ResultController.getMyResults,
);

export default router;
