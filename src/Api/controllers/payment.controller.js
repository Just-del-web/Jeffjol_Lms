import { PaymentService } from "../service/payment.service.js";
import StudentProfile from "../models/student_profile.model.js"; 
import { successResponse, errorResponse } from "../utils/helper.js";
import logger from "../logging/logger.js";

const paymentControllerLogger = logger.child({ service: "PAYMENT_CONTROLLER" });
const paymentService = new PaymentService();

export const submitProof = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(errorResponse(400, "Please upload a receipt image."));
    }

    const uploaderId = req.userId; 
    
    const profile = await StudentProfile.findOne({ user: uploaderId });

    if (!profile) {
      paymentControllerLogger.error(`Bypass Error: User ${uploaderId} has no Student Profile.`);
      return res.status(404).json(errorResponse(404, "Student profile not found. Please complete registration."));
    }

    const payment = await paymentService.submitPaymentProof(
        uploaderId, 
        req.body, 
        req.file
    );

    paymentControllerLogger.info(`Receipt accepted for Student: ${profile.studentId}`);
    
    return res.status(201).json(
      successResponse(201, "Receipt received! Verification pending.", payment)
    );
  } catch (error) {
    paymentControllerLogger.error(`SubmitProof Failure: ${error.message}`);
    next(error); 
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { status, rejectionReason } = req.body; 
    const bursarId = req.userId;

    const result = await paymentService.verifyPayment(paymentId, bursarId, status, rejectionReason);

    const message = status === 'verified' ? "Payment verified and student cleared." : "Payment rejected.";
    paymentControllerLogger.info(`Action: ${status} | Payment: ${paymentId}`);
    
    return res.status(200).json(successResponse(200, message, result));
  } catch (error) {
    paymentControllerLogger.error(`Verification Error: ${error.message}`);
    next(error);
  }
};

export const getPendingPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getPendingPayments();
    return res.status(200).json(successResponse(200, "Pending queue synchronized.", payments));
  } catch (error) {
    paymentControllerLogger.error(`Fetch Error: ${error.message}`);
    next(error);
  }
};