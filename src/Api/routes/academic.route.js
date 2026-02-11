import { Router } from "express";
import * as AcademicController from "../controllers/academic.controller.js";
import { authenticate, restrictTo } from "../middleware/auth.middleware.js";
import { academicContentUpload } from "../utils/cloudinary.util.js";

const router = Router();

router.use(authenticate);

router.get(
  "/library",
  restrictTo("student", "parent"),
  AcademicController.getMyLibrary,
);

router.get(
  "/read/:id",
  restrictTo("student", "parent"),
  AcademicController.readNoteContent,
);

// Add this to your academic.route.js
router.get(
  "/teacher-history",
  restrictTo("teacher", "admin"),
  AcademicController.getTeacherMaterials, // We need to create this
);


router.post(
  "/upload",
  restrictTo("teacher", "admin"),
  academicContentUpload.single("file"),
  AcademicController.uploadMaterial,
);

router.patch(
  "/update/:id",
  restrictTo("teacher", "admin"),
  AcademicController.updateMaterial,
);

router.post(
  "/schedule-live",
  restrictTo("teacher", "admin"),
  AcademicController.uploadMaterial,
);

export default router;
