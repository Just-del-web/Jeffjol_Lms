import { Router } from "express";
import * as AdminController from "../controllers/admin.controller.js";
import { authenticate, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.use(restrictTo('admin'));

router.get("/stats", AdminController.getStats);
router.get("/announcements", AdminController.getAnnouncements);
router.post("/announcements", AdminController.postAnnouncement);
router.post("/courses", AdminController.addCourse);
router.post("/broadcast", AdminController.triggerBroadcast);
router.patch("/link-family", AdminController.linkStudentToParent);
router.get("/users", AdminController.getAllUsers);

export default router;