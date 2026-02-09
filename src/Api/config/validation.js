import Joi from 'joi';
import { errorResponse } from '../utils/helper.js';

/**
 * Generic Middleware for Joi Validation
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { 
        abortEarly: false, 
        allowUnknown: true, 
        stripUnknown: true  
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return res.status(400).json(errorResponse(400, errorMessage));
    }

    next();
  };
};

/** --- AUTH SCHEMAS --- */

const passwordComplexity = Joi.string()
  .min(8)
  .max(255)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .required()
  .messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    'string.min': 'Password must be at least 8 characters long',
  });

const signupSchema = Joi.object({
  firstName: Joi.string().required().trim(),
  lastName: Joi.string().required().trim(),
  email: Joi.string().required().email().lowercase().trim(),
  password: passwordComplexity,
  gender: Joi.string().valid('Male', 'Female').required(),
  role: Joi.string().valid('student', 'teacher', 'parent', 'admin').optional(),
  currentClass: Joi.string().optional(),
  classArm: Joi.string().optional(),
  schoolId: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().required().email().trim(),
  password: Joi.string().required(), 
});

const otpVerifySchema = Joi.object({
  userId: Joi.string().required(),
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'OTP must be a 6-digit numeric code',
  }),
});

/** --- CBT / EXAM SCHEMAS --- */

// 1. Validation for adding questions to the Bank
const questionBankSchema = Joi.object({
  text: Joi.string().required().messages({ 'any.required': 'Question text is mandatory' }),
  subject: Joi.string().required(),
  type: Joi.string().valid('multiple-choice', 'theory').default('multiple-choice'),
  options: Joi.array().items(
    Joi.object({
      text: Joi.string().required(),
      letter: Joi.string().valid('A', 'B', 'C', 'D', 'E').required()
    })
  ).min(2).required().messages({ 'array.min': 'Multiple choice questions need at least 2 options' }),
  correctAnswer: Joi.string().valid('A', 'B', 'C', 'D', 'E').required(),
  marks: Joi.number().min(1).default(2),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium')
});

// 2. Validation for creating an Exam Paper (Linking questions)
const examCreationSchema = Joi.object({
  title: Joi.string().required(),
  subject: Joi.string().required(),
  duration: Joi.number().min(1).required(), // Minutes
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().min(Joi.ref('startTime')).required(),
  targetClass: Joi.string().required(),
  questionIds: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'You must link at least one question to this exam'
  }),
  passPercentage: Joi.number().min(0).max(100).default(50),
  sebRequired: Joi.boolean().default(true)
});

// 3. Validation for Student Submission
const examSubmissionSchema = Joi.object({
  examId: Joi.string().required(),
  answers: Joi.array().items(
    Joi.object({
      questionId: Joi.string().required(),
      selectedOption: Joi.string().valid('A', 'B', 'C', 'D', 'E', '').required()
    })
  ).required()
});

/** --- EXPORTS --- */

export const validateSignup = validateRequest(signupSchema);
export const validateLogin = validateRequest(loginSchema);
export const validateOtpVerify = validateRequest(otpVerifySchema);

// New CBT Exports
export const validateQuestionBank = validateRequest(questionBankSchema);
export const validateExamCreation = validateRequest(examCreationSchema);
export const validateExamSubmission = validateRequest(examSubmissionSchema);