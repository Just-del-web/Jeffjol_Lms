import express from "express";;

import authRoutes from "../routes/auth.route.js";
import paymentRoutes from "../routes/payment.route.js";
import resultRoutes from "../routes/result.route.js";
import examRoutes from "../routes/exam.route.js";
import studentRoutes from "../routes/student.route.js";
import parentRoutes from "../routes/parent.route.js";
import announcementRoutes from "../routes/announcement.route.js";






const router = express.Router();

router.use("/auth", authRoutes);
router.use("/payment", paymentRoutes);
router.use("/result", resultRoutes);
router.use("/exam", examRoutes);
router.use("/student", studentRoutes);
router.use("/parent", parentRoutes);
router.use("/announcement", announcementRoutes);


export default router;