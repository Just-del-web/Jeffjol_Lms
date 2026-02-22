import { Exam, Question } from "../models/exam.model.js";
import { Result } from "../models/result.model.js";
import StudentProfile from "../models/student_profile.model.js";
import logger from "../logging/logger.js";

const cbtLogger = logger.child({ service: "CBT_SERVICE" });

export class CBTService {
  async getAvailableExams(studentId) {
    cbtLogger.info(`Fetching exams for student: ${studentId}`);
    const profile = await StudentProfile.findOne({ user: studentId });
    
    if (!profile) {
      cbtLogger.error(`Profile lookup failed for student: ${studentId}`);
      throw new Error("STUDENT_PROFILE_NOT_FOUND");
    }

    const now = new Date();
    const exams = await Exam.find({
      targetClass: profile.currentClass,
      status: "published",
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).select("title subject duration startTime endTime description");

    cbtLogger.info(`Found ${exams.length} active exams for class ${profile.currentClass}`);
    return { exams, isCleared: profile.isClearedForExams };
  }

  async startExam(examId, studentId, userAgent) {
    cbtLogger.info(`Attempt to start exam ${examId} by student ${studentId}`);
    const profile = await StudentProfile.findOne({ user: studentId });

    if (!profile || !profile.isClearedForExams) {
      cbtLogger.warn(`Student ${studentId} not cleared for exams`);
      throw new Error("NOT_CLEARED_FOR_EXAMS");
    }

    const exam = await Exam.findById(examId).populate("questions", "-correctAnswer -explanation");
    if (!exam) {
      cbtLogger.error(`Exam ID ${examId} not found in database`);
      throw new Error("EXAM_NOT_FOUND");
    }

    const now = new Date();
    if (now < exam.startTime) throw new Error("EXAM_NOT_YET_OPEN");
    if (now > exam.endTime) throw new Error("EXAM_ALREADY_CLOSED");

    const alreadySubmitted = await Result.findOne({ student: studentId, exam: examId });
    if (alreadySubmitted) throw new Error("ALREADY_SUBMITTED");

    if (exam.sebRequired && (!userAgent || !userAgent.includes("SafeExamBrowser"))) {
      cbtLogger.warn(`SEB Violation by student ${studentId}`);
      throw new Error("SEB_REQUIRED");
    }

    let examQuestions = [...exam.questions];
    if (exam.shuffleQuestions) {
      examQuestions = examQuestions.sort(() => Math.random() - 0.5);
    }

    cbtLogger.info(`Exam ${examId} successfully started for ${studentId}`);
    return { examId: exam._id, title: exam.title, duration: exam.duration, endTime: exam.endTime, questions: examQuestions };
  }

async processSubmission(examId, studentId, submittedAnswers) {
  const exam = await Exam.findById(examId).populate("questions");
  if (!exam) throw new Error("EXAM_NOT_FOUND");

  const profile = await StudentProfile.findOne({ user: studentId });
  if (!profile) throw new Error("STUDENT_PROFILE_NOT_FOUND");

  let totalScore = 0;
  let totalPossible = 0;
  const gradedAnswers = [];

  exam.questions.forEach((question) => {
    const studentAnswer = submittedAnswers.find(
      (ans) => ans.questionId === question._id.toString()
    );

    const isCorrect = studentAnswer?.selectedOption === question.correctAnswer;
    const marksEarned = isCorrect ? (question.marks || 2) : 0;

    totalScore += marksEarned;
    totalPossible += (question.marks || 2);

    gradedAnswers.push({
      questionId: question._id,
      selectedOption: studentAnswer?.selectedOption || "NONE",
      isCorrect,
      marksEarned,
    });
  });

  const percentage = (totalScore / totalPossible) * 100;

  await Result.create({
    student: studentId,
    exam: examId,
    score: totalScore,
    totalPossible,
    percentage: Math.round(percentage),
    status: percentage >= (exam.passPercentage || 50) ? "pass" : "fail",
    answers: gradedAnswers,
    
    subject: exam.subject,
    term: exam.term,
    session: exam.session,
    classAtTime: profile.currentClass 
  });

  cbtLogger.info(`Score of ${totalScore} archived for Student ${studentId} on ${exam.subject}`);

  return {
    score: totalScore,
    total: totalPossible,
    percentage: Math.round(percentage)
  };
}

async getExistingScores(query) {
    const { subject, className, term, session } = query;
    
    return await Result.find({
      subject,
      classAtTime: className,
      term,
      session
    }).select('student score caScore examScore behavioralData');
  }

async getClassEngagementStats(teacherId) {
    try {
      cbtLogger.info(`Calculating stats for teacher: ${teacherId}`);
      
      const totalExams = await Exam.countDocuments({ createdBy: teacherId });
      const totalQuestions = await Question.countDocuments({ createdBy: teacherId });
      
      const teacherExams = await Exam.find({ createdBy: teacherId }).select('_id');
      const examIds = teacherExams.map(e => e._id);
      
      const totalSubmissions = await Result.countDocuments({ exam: { $in: examIds } });

      return {
        totalExams,
        totalQuestions,
        totalSubmissions,
        activeSessions: 0 
      };
    } catch (err) {
      cbtLogger.error(`Stats Calculation Failure: ${err.message}`);
      throw new Error("ANALYTICS_FETCH_FAILED");
    }
  }


  async createExamPaper(data, teacherId) {
    cbtLogger.info(`Teacher ${teacherId} initiating paper creation: ${data.title}`);
    cbtLogger.debug(`Payload Received: ${JSON.stringify(data)}`);

    const { questionIds } = data;
    
    if (!questionIds || questionIds.length === 0) {
      cbtLogger.error(`Paper creation failed: No question IDs provided by teacher ${teacherId}`);
      throw new Error("NO_VALID_QUESTIONS_PROVIDED");
    }

    const validQuestions = await Question.find({ _id: { $in: questionIds } });
    cbtLogger.info(`Validated ${validQuestions.length} out of ${questionIds.length} requested questions`);

    const calculatedTotal = validQuestions.reduce((acc, q) => acc + (Number(q.marks) || 2), 0);

    try {
      const newExam = await Exam.create({
        ...data,
        questions: questionIds,
        createdBy: teacherId,
        totalMarks: calculatedTotal,
        status: data.status || 'published'
      });
      cbtLogger.info(`Exam Paper Created successfully: ${newExam._id}`);
      return newExam;
    } catch (dbErr) {
      cbtLogger.error(`Database Error during Exam Creation: ${dbErr.message}`);
      throw dbErr;
    }
  }
}