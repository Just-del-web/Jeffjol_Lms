import express from "express";;

import authRoutes from "../routes/auth.route.js";
import paymentRoutes from "../routes/payment.route.js";
import resultRoutes from "../routes/result.route.js";
import examRoutes from "../routes/exam.route.js";
import studentRoutes from "../routes/student.route.js";
import parentRoutes from "../routes/parent.route.js";
import announcementRoutes from "../routes/announcement.route.js";
import adminRoutes from "../routes/admin.route.js";
import bursaryRoutes from "../routes/bursary.route.js";
import operationsRoutes from "../routes/operations.route.js";
import academicRoutes from "../routes/academic.route.js";







const router = express.Router();

router.use("/auth", authRoutes);
router.use("/payment", paymentRoutes);
router.use("/result", resultRoutes);
router.use("/exam", examRoutes);
router.use("/student", studentRoutes);
router.use("/parent", parentRoutes);
router.use("/announcements", announcementRoutes);
router.use("/admin", adminRoutes);
router.use("/bursary", bursaryRoutes);
router.use("/operations", operationsRoutes);
router.use("/academic", academicRoutes);

export default router;