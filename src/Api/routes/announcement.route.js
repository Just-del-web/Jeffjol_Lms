import { Router } from "express";
import * as AnnouncementController from "../controllers/announcement.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/active", authenticate, AnnouncementController.getActiveAnnouncements);

export default router;