import { Exam, Question } from '../models/ExamModels.js';
import { Result } from '../models/Result.model.js';
import StudentProfile from '../models/StudentProfile.js';
import logger from '../logging/logger.js';

const cbtLogger = logger.child({ service: "CBT_SERVICE" });

export class CBTService {

  /**
   * --- STUDENT: VIEW AVAILABLE EXAMS ---
   */
  async getAvailableExams(studentId) {
    const profile = await StudentProfile.findOne({ user: studentId });
    if (!profile) throw new Error("STUDENT_PROFILE_NOT_FOUND");

    // Only show exams for their class that are currently in the active time window
    const now = new Date();
    return await Exam.find({
      targetClass: profile.currentClass,
      status: 'published',
      startTime: { $lte: now },
      endTime: { $gte: now }
    }).select('title subject duration startTime endTime description');
  }

  /**
   * --- STUDENT: START EXAM (WITH SECURITY) ---
   */
  async startExam(examId, studentId, userAgent) {
    const profile = await StudentProfile.findOne({ user: studentId });
    
    // 1. Manual Clearance Check
    if (!profile || !profile.isClearedForExams) {
      throw new Error("NOT_CLEARED_FOR_EXAMS");
    }

    // 2. Fetch Exam
    const exam = await Exam.findById(examId).populate('questions', '-correctAnswer -explanation');
    if (!exam) throw new Error("EXAM_NOT_FOUND");

    // 3. Time Window Check
    const now = new Date();
    if (now < exam.startTime) throw new Error("EXAM_NOT_YET_OPEN");
    if (now > exam.endTime) throw new Error("EXAM_ALREADY_CLOSED");

    // 4. Double-Submission Prevention
    const alreadySubmitted = await Result.findOne({ student: studentId, exam: examId });
    if (alreadySubmitted) throw new Error("ALREADY_SUBMITTED");

    // 5. SEB (Safe Exam Browser) Enforcement
    // Miva/Chetavly-level check for the specialized SEB User-Agent header
    if (exam.sebRequired && (!userAgent || !userAgent.includes('SafeExamBrowser'))) {
      cbtLogger.warn(`SEB Violation attempt by User: ${studentId}`);
      throw new Error("SEB_REQUIRED");
    }

    // 6. Randomization (Shuffle)
    let examQuestions = [...exam.questions];
    if (exam.shuffleQuestions) {
      examQuestions = examQuestions.sort(() => Math.random() - 0.5);
    }

    return {
      examId: exam._id,
      title: exam.title,
      duration: exam.duration,
      endTime: exam.endTime, // So frontend can sync the timer
      questions: examQuestions
    };
  }

  /**
   * --- STUDENT: AUTO-GRADE SUBMISSION ---
   */
  async processSubmission(examId, studentId, submittedAnswers) {
    // 1. Fetch exam with answers (Internal only)
    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) throw new Error("EXAM_NOT_FOUND");

    // 2. Late Submission Check (Allow a 2-minute "Grace Period" for network lag)
    const now = new Date();
    const gracePeriod = 2 * 60 * 1000; 
    if (now.getTime() > (exam.endTime.getTime() + gracePeriod)) {
      throw new Error("TIME_EXPIRED");
    }

    // 3. Prevent overwriting previous results
    const existingResult = await Result.findOne({ student: studentId, exam: examId });
    if (existingResult) throw new Error("ALREADY_SUBMITTED");

    let totalScore = 0;
    let totalPossible = 0;
    const gradedAnswers = [];

    // 4. Grading Engine
    exam.questions.forEach((question) => {
      const studentAnswer = submittedAnswers.find(
        (ans) => ans.questionId === question._id.toString()
      );

      const isCorrect = studentAnswer?.selectedOption === question.correctAnswer;
      const marksEarned = isCorrect ? question.marks : 0;

      totalScore += marksEarned;
      totalPossible += (question.marks || 2);

      gradedAnswers.push({
        questionId: question._id,
        selectedOption: studentAnswer?.selectedOption || 'NONE',
        isCorrect,
        marksEarned
      });
    });

    const percentage = (totalScore / totalPossible) * 100;
    const status = percentage >= (exam.passPercentage || 50) ? 'pass' : 'fail';

    // 5. Save Permanent Result
    const finalResult = await Result.create({
      student: studentId,
      exam: examId,
      score: totalScore,
      totalPossible,
      percentage: Math.round(percentage),
      answers: gradedAnswers,
      status
    });

    return {
      score: totalScore,
      total: totalPossible,
      percentage: Math.round(percentage),
      status
    };
  }

  /**
   * --- TEACHER: LINK/CREATE EXAM ---
   */
  async createExamPaper(data, teacherId) {
    const { questionIds } = data;
    const validQuestions = await Question.find({ _id: { $in: questionIds } });
    
    if (validQuestions.length === 0) throw new Error("NO_VALID_QUESTIONS_PROVIDED");

    return await Exam.create({
      ...data,
      questions: questionIds,
      createdBy: teacherId,
      totalMarks: validQuestions.reduce((acc, q) => acc + (q.marks || 2), 0)
    });
  }
}