import { PaymentService } from "../service/payment.service.js";
import StudentProfile from "../models/student_profile.model.js"; 
import { BursaryService } from "../service/bursary.service.js";
import { PDFService } from "../service/pdf.service.js";
import { successResponse, errorResponse } from "../utils/helper.js";
import logger from "../logging/logger.js";

const paymentControllerLogger = logger.child({ service: "PAYMENT_CONTROLLER" });
const paymentService = new PaymentService();
const bursaryService = new BursaryService();
const pdfService = new PDFService();
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

export const downloadReceipt = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await paymentService.getPaymentById(paymentId); 
    if (!payment || payment.status !== 'verified') {
      return res.status(400).json(errorResponse(400, "Receipt not available or payment not verified."));
    }

    const profile = await StudentProfile.findOne({ user: payment.student }).populate('user');
    const balanceData = await bursaryService.getStudentBalance(payment.student, payment.term, payment.session);

    const receiptBuffer = await pdfService.generatePaymentReceipt(payment, profile, balanceData);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Receipt_${paymentId.slice(-6)}.pdf`);
    
    return res.send(receiptBuffer);
  } catch (error) {
    paymentControllerLogger.error(`Receipt Download Error: ${error.message}`);
    next(error);
  }
};