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
  restrictTo("student", "parent", "teacher", "admin"),
  AcademicController.readNoteContent,
);

router.get(
  "/teacher-history",
  restrictTo("teacher", "admin"),
  AcademicController.getTeacherMaterials,
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

router.delete(
  "/delete/:id",
  restrictTo("teacher", "admin"),
  AcademicController.deleteMaterial,
);

export default router;
