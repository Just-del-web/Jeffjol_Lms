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
 
  async submitPaymentProof(studentId, paymentData, file) {
    if (!file) throw new Error("PAYMENT_PROOF_REQUIRED");

    const uploadResult = await uploadToCloudinary(file.buffer, 'receipts');

    const payment = await Payment.create({
      student: studentId,
      uploadedBy: uploaderId,
      amount: paymentData.amount,
      feeType: paymentData.feeType || 'Tuition',
      paymentMethod: paymentData.paymentMethod,
      transactionReference: paymentData.transactionReference,
      proofOfPayment: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      term: paymentData.term,
      session: paymentData.session,
      status: 'pending'
    });

    paymentLogger.info(`Payment proof uploaded by Student ${studentId} for ${paymentData.amount}`);
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

      const profile = await StudentProfile.findOne({ user: payment.student._id })
        .populate('parents');

      const balanceData = await bursaryService.getStudentBalance(
        payment.student._id, 
        payment.term, 
        payment.session
      );

      try {
        const receiptBuffer = await pdfService.generatePaymentReceipt(payment, profile, balanceData);

        if (profile.parents && profile.parents.length > 0) {
          const parentEmails = profile.parents.map(p => p.email);
          
          await mailService.sendMail({
            to: parentEmails,
            subject: `Official Receipt: ${payment.feeType} - ${payment.term} Term`,
            message: `Hello, please find attached the electronic receipt for the payment of N${payment.amount.toLocaleString()} for ${payment.student.firstName}.`,
            attachments: [
              {
                filename: `Receipt_${payment._id.toString().slice(-6).toUpperCase()}.pdf`,
                content: receiptBuffer,
                contentType: 'application/pdf'
              }
            ]
          });
          paymentLogger.info(`Receipt emailed to parents of student ${payment.student._id}`);
        }
      } catch (err) {
        paymentLogger.error(`Failed to send receipt email: ${err.message}`);
      }

      if (balanceData.isFullyPaid) {
        await StudentProfile.findOneAndUpdate(
          { user: payment.student._id },
          { isClearedForExams: true }
        );
        paymentLogger.info(`Student ${payment.student._id} fully paid and cleared for exams.`);
      }

    } else {
      payment.status = 'rejected';
      payment.rejectionReason = rejectionReason;
      paymentLogger.warn(`Payment ${paymentId} rejected by Bursar ${bursarId}`);
      await payment.save();
    }

    return payment;
  }

 
  async getPendingPayments() {
    return await Payment.find({ status: 'pending' })
      .populate('student', 'firstName lastName email')
      .sort({ createdAt: 1 });
  }
}