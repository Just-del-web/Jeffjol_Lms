import { User } from "../models/user.model.js";
import logger from "../logging/logger.js";
import Queue from 'bull';
import config from '../config/secret.config.js';
import { 
  generateVerificationCode, 
  generateHashToken, 
  generateTokenSignature, 
  storeTokenRecord,
  errorResponse,
  successResponse
} from "../utils/helper.js";

const mailLogger = logger.child({ service: "SCHOOL_MAIL_SERVICE" });

const emailQueue = new Queue('school-email-delivery', config.REDIS_URL || 'redis://127.0.0.1:6379');

export class MailService {

  async sendVerificationCode(email) {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const user = await User.findOne({ email: normalizedEmail });
      
      if (!user) return errorResponse(404, "Student record not found");
      if (user.isVerified) return errorResponse(400, "Account already verified");

      const code = generateVerificationCode();
      const hashed = generateHashToken(code);
      const signature = generateTokenSignature(user._id, hashed);

      await storeTokenRecord(user._id, hashed, signature, "email-verification");

      await emailQueue.add("sendVerificationCode", {
        to: user.email,
        subject: `[Jeffjol LMS] Your Verification Code: ${code}`,
        templateName: "student_verification",
        templateData: { name: user.firstName, code }
      }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });

      mailLogger.info(`Verification code queued for student: ${user._id}`);
      return successResponse(200, "Verification code sent.");
    } catch (err) {
      mailLogger.error(`Verification Error: ${err.message}`);
      return errorResponse(500, "Mail system failure.");
    }
  }

  async sendWelcomeEmail(email, firstName, studentId) {
    try {
      await emailQueue.add("sendWelcome", {
        to: email,
        subject: `Welcome to Jeffjol High School! 🎓`,
        templateName: "admission_welcome",
        templateData: { firstName, studentId }
      });
      mailLogger.info(`Welcome email queued for: ${studentId}`);
    } catch (err) {
      mailLogger.error(`Welcome Email Error: ${err.message}`);
    }
  }

  async sendExamClearance(userId) {
    const user = await User.findById(userId);
    if (!user) return;

    await emailQueue.add("sendClearance", {
      to: user.email,
      subject: "Academic Notice: You are cleared for Exams",
      templateName: "exam_clearance",
      templateData: { firstName: user.firstName, date: new Date().toLocaleDateString() }
    });
  }

  
  async sendResultPublished(userId, subjectName, score) {
    const user = await User.findById(userId);
    if (!user) return;

    await emailQueue.add("sendResult", {
      to: user.email,
      subject: `New Grade Posted: ${subjectName}`,
      templateName: "result_alert",
      templateData: { 
        firstName: user.firstName, 
        subjectName, 
        score,
        portalUrl: config.FRONTEND_URL 
      }
    });
  }

 
  async sendSchoolBroadcast({ subject, message, targetClass = 'all' }) {
    try {
      const query = targetClass === 'all' ? {} : { 'profile.currentClass': targetClass };
      
      const userCursor = User.find(query).populate('profile').cursor();
      let batch = [];
      const BATCH_SIZE = 100;

      for (let user = await userCursor.next(); user != null; user = await userCursor.next()) {
        batch.push({
          name: 'sendBroadcast',
          data: {
            to: user.email,
            subject: `SCHOOL NOTICE: ${subject}`,
            templateName: "school_broadcast",
            templateData: { firstName: user.firstName, messageBody: message }
          }
        });

        if (batch.length === BATCH_SIZE) {
          await emailQueue.addBulk(batch);
          batch = []; 
        }
      }

      if (batch.length > 0) await emailQueue.addBulk(batch);

      mailLogger.info(`Broadcast queued for ${targetClass} students.`);
      return successResponse(200, `Broadcast sent.`);
    } catch (err) {
      mailLogger.error(`Broadcast Error: ${err.message}`);
      return errorResponse(500, "Broadcast system failure.");
    }
  }

  async sendPaymentReceipt({ to, firstName, amount, term, session, receiptBuffer, filename }) {
    try {
      await emailQueue.add("sendReceipt", {
        to: to, 
        subject: `Payment Receipt: ${term} Term - Jeffjol High School`,
        templateName: "payment_receipt",
        templateData: { 
          firstName, 
          amount: amount.toLocaleString(), 
          term, 
          session 
        },

        attachments: [
          {
            filename: filename,
            content: receiptBuffer.toString('base64'), 
            contentType: 'application/pdf',
            encoding: 'base64'
          }
        ]
      }, { attempts: 5, backoff: { type: 'exponential', delay: 5000 } });

      mailLogger.info(`Payment receipt queued for: ${to}`);
    } catch (err) {
      mailLogger.error(`Receipt Email Error: ${err.message}`);
    }
  }
}