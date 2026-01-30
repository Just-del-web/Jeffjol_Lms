import { Router } from "express";
import * as OpsController from "../controller/operations.controller.js";
import { authenticate, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/grades/record", 
  restrictTo('teacher', 'admin'), 
  OpsController.enterGrades
);

router.post("/admin/promote", 
  restrictTo('admin'), 
  OpsController.promoteStudents
);

router.patch("/admin/user-status", 
  restrictTo('admin'), 
  OpsController.updateUserStatus
);

export default router;