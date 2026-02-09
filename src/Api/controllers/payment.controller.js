import { PaymentService } from "../service/payment.service.js";
import { successResponse, errorResponse } from "../utils/helper.js";
import logger from "../logging/logger.js";

const paymentControllerLogger = logger.child({ service: "PAYMENT_CONTROLLER" });
const paymentService = new PaymentService();

export const submitProof = async (req, res, next) => {
  try {
    const uploaderId = req.userId;
    const { role } = req;
    
    const studentId = (role === 'student') ? uploaderId : req.body.studentId;

    if (!studentId) {
      return res.status(400).json(errorResponse(400, "Which student is this payment for?"));
    }

    if (!req.file) {
      return res.status(400).json(errorResponse(400, "Please upload a clear image of your receipt."));
    }

    const payment = await paymentService.submitPaymentProof(uploaderId, studentId, req.body, req.file);

    return res.status(201).json(
      successResponse(201, "Receipt received. Your portal will unlock once the Bursar verifies it.", payment)
    );
  } catch (error) {
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
    return res.status(200).json(successResponse(200, message, result));
  } catch (error) {
    paymentControllerLogger.error(`Verification Error: ${error.message}`);
    next(error);
  }
};


export const getPendingPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getPendingPayments();
    return res.status(200).json(successResponse(200, "Pending payments fetched", payments));
  } catch (error) {
    next(error);
  }
};