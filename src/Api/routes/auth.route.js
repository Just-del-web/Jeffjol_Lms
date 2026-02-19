import { Router } from "express";
import * as AuthController from "../controllers/auth.controller.js";

import { authLimiter } from "../middleware/security.middleware.js";
import { 
  validateSignup, 
  validateLogin, 
  validateOtpVerify 
} from "../config/validation.js"; 

const router = Router();

router.post("/signup", authLimiter, validateSignup, AuthController.signup);
router.post("/verify-email", authLimiter, validateOtpVerify, AuthController.verifySignupOtp);

router.post("/login", authLimiter, validateLogin, AuthController.login);
router.post("/refresh-token",  AuthController.refresh); 

router.post("/forgot-password", authLimiter, AuthController.forgotPassword);


export default router;