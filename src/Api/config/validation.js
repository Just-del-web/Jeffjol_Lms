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
      // Standardizing the response to match your helper's output
      return res.status(400).json(errorResponse(400, errorMessage));
    }

    next();
  };
};

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

// --- Exports ---
export const validateSignup = validateRequest(signupSchema);
export const validateLogin = validateRequest(loginSchema); // Fixed the typo here
export const validateOtpVerify = validateRequest(otpVerifySchema);