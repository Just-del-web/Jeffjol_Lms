import { Router } from "express";
import * as PaymentController from "../controller/payment.controller.js";
import { authenticate, restrictTo } from "../middleware/auth.middleware.js";
import { verifyPayerRelationship } from "../middleware/payment.middleware.js"; 
import { receiptUpload } from "../utils/cloudinary.util.js";

const router = Router();

router.use(authenticate);


router.post(
  "/submit-proof", 
  restrictTo('student'), 
  receiptUpload.single('receipt'), 
  verifyPayerRelationship,
  PaymentController.submitProof
);

router.get(
  "/pending", 
  restrictTo('admin', 'teacher'), 
  PaymentController.getPendingPayments
);

router.patch(
  "/verify/:paymentId", 
  restrictTo('admin'), 
  PaymentController.verifyPayment
);

export default router;