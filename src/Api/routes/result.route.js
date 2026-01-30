import { Router } from "express";
import * as ResultController from "../controllers/result.controller.js";
import { authenticate, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

/** * --- STUDENT & PARENT ROUTES ---
 * Access to individual academic history and analytics
 */
router.get(
  "/my-history",
  restrictTo("student", "parent"),
  ResultController.getMyResults,
);

/** * --- TEACHER & ADMIN ROUTES ---
 * Management of class-wide performance and data entry
 */

// 1. Fetch the broadsheet (Positions, Averages, and Subject Breakdown)
router.get(
  "/broadsheet",
  restrictTo("teacher", "admin"),
  ResultController.getBroadsheet,
);

// 2. Bulk upload Continuous Assessment (CA) or Exam marks
router.post(
  "/bulk-upload",
  restrictTo("teacher", "admin"),
  ResultController.bulkUploadGrades,
);

// 3. View a specific student's full transcript (e.g., for counseling or printing)
router.get(
  "/transcript/:studentId",
  restrictTo("teacher", "admin"),
  ResultController.getMyResults,
);

router.get(
  "/download-report",
  restrictTo("student", "parent", "admin"),
  ResultController.downloadReportCard,
);
export default router;
