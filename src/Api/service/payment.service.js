import { Payment } from '../models/payment.model.js';
import StudentProfile from '../models/student_profile.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.util.js';
import logger from '../logging/logger.js';
import { BursaryService } from './bursary.service.js'; 
import { PDFService } from './pdf.service.js';        
import { MailService } from './mail.service.js';

const paymentLogger = logger.child({ service: "PAYMENT_SERVICE" });
const bursaryService = new BursaryService();
const pdfService = new PDFService();
const mailService = new MailService();

export class PaymentService {

async submitPaymentProof(studentUserId, paymentData, file) {
    if (!file) throw new Error("PAYMENT_PROOF_REQUIRED");

    const profile = await StudentProfile.findOne({ user: studentUserId });
    if (!profile) throw new Error("STUDENT_PROFILE_NOT_FOUND");

    const uploadResult = await uploadToCloudinary(file.buffer, 'receipts');

    const payment = await Payment.create({
      student: studentUserId, 
      amount: Number(paymentData.amount) || 0,
      feeType: paymentData.feeType || 'Tuition',
      paymentMethod: paymentData.paymentMethod || 'Bank Transfer',
      transactionReference: `TRX-${profile.studentId}-${Date.now()}`,
      proofOfPayment: uploadResult.secure_url,
      term: paymentData.term,
      session: paymentData.session,
      status: 'pending'
    });

    return payment;
  }

 
  async verifyPayment(paymentId, bursarId, status, rejectionReason = null) {
    const payment = await Payment.findById(paymentId).populate('student');
    if (!payment) throw new Error("PAYMENT_NOT_FOUND");

    if (status === 'verified') {
      payment.status = 'verified';
      payment.verifiedBy = bursarId;
      payment.verifiedAt = new Date();
      await payment.save();

      const balanceData = await bursaryService.getStudentBalance(
        payment.student._id, 
        payment.term, 
        payment.session
      );

      if (balanceData.totalBalance <= 0) {
        await StudentProfile.findOneAndUpdate(
          { user: payment.student._id },
          { isClearedForExams: true }
        );
        paymentLogger.info(`Student ${payment.student._id} cleared for exams.`);
      }

      try {
        const profile = await StudentProfile.findOne({ user: payment.student._id }).populate('parents');
        const receiptBuffer = await pdfService.generatePaymentReceipt(payment, profile, balanceData);
        
        if (profile.parents?.length > 0) {
          const parentEmails = profile.parents.map(p => p.email);
          await mailService.sendMail({
            to: parentEmails,
            subject: `Receipt: ${payment.feeType} - ${payment.term} Term`,
            message: `Official receipt for payment of N${payment.amount.toLocaleString()}.`,
            attachments: [{
              filename: `Receipt_${payment._id.toString().slice(-6)}.pdf`,
              content: receiptBuffer,
              contentType: 'application/pdf'
            }]
          });
        }
      } catch (err) {
        paymentLogger.error(`Bursary automation failed: ${err.message}`);
      }
    } else {
      payment.status = 'rejected';
      payment.rejectionReason = rejectionReason;
      await payment.save();
    }
    return payment;
  }

  async getPendingPayments() {
    return await Payment.find({ status: 'pending' })
      .populate('student', 'firstName lastName email')
      .sort({ createdAt: 1 });
  }

  async getPaymentById(id) {
  return await Payment.findById(id);
}
}

