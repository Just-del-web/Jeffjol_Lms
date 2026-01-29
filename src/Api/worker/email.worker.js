import Queue from 'bull';
import resend from '../config/mail.config.js';
import renderTemplate from '../utils/template.engine.js';
import config from '../config/secret.config.js';
import logger from '../logging/logger.js';

const mailLogger = logger.child({ service: "RESEND_WORKER" });

const emailQueue = new Queue('school-email-delivery', config.REDIS_URL || 'redis://127.0.0.1:6379');


const processMailJob = async (job) => {
  const { to, subject, templateName, templateData } = job.data;

  try {
    const html = await renderTemplate(templateName, templateData);

    const { data, error } = await resend.emails.send({
      from: config.MAIL_FROM || 'Jeffjol High School <noreply@jeffjol.com>',
      to: [to],
      subject,
      html
    });

    if (error) {
      if (error.status === 429) {
        mailLogger.warn(`Rate limit hit. Bull will retry job ${job.id} automatically.`);
        throw new Error("RESEND_RATE_LIMIT"); 
      }
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    mailLogger.error(`Mail Job ${job.id} failed: ${err.message}`);
    throw err; 
  }
};


export const initMailWorker = () => {
  mailLogger.info("👷 Jeffjol LMS Mail Worker: Active & Scalable (Resend)");

  const jobTypes = [
    "sendVerificationCode", 
    "sendWelcome",         
    "sendExamClearance",  
    "sendResultPublished", 
    "sendPasswordReset",   
    "sendSchoolBroadcast"  
  ];

  jobTypes.forEach(type => {
    emailQueue.process(type, 10, processMailJob);
  });

  emailQueue.process(10, processMailJob);

  emailQueue.on('completed', (job) => {
    mailLogger.info(`✅ Mail Delivered: Job ${job.id} (Type: ${job.name})`);
  });

  emailQueue.on('failed', (job, err) => {
    mailLogger.error(`❌ Mail Failed for Job ${job.id} [${job.name}]: ${err.message}`);
  });
};