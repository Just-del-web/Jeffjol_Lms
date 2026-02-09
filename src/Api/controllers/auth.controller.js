import { AuthService } from "../service/auth.service.js";
import { successResponse, errorResponse } from "../utils/helper.js";
import logger from "../logging/logger.js";

const authControllerLogger = logger.child({ service: "AUTH_CONTROLLER" });
const authService = new AuthService();

const getClientIp = (req) => req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;


export const signup = async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'];

    const result = await authService.signup(req.body, ip, userAgent);

    return res.status(201).json(
      successResponse(201, "Account initialized. Please verify your email.", result)
    );
  } catch (error) {
    authControllerLogger.error(`Signup Controller Error: ${error.message}`);
    
    if (error.message === "USER_ALREADY_EXISTS") {
        return res.status(409).json(errorResponse(409, "This email is already registered."));
    }
    
    next(error); 
  }
};


export const verifySignupOtp = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json(errorResponse(400, "User ID and OTP are required."));
    }

    const result = await authService.verifySignupOtp(userId, otp);

    return res.status(200).json(
      successResponse(200, "Email verified successfully. You can now login.", result)
    );
  } catch (error) {
    authControllerLogger.error(`OTP Verification Error: ${error.message}`);
    
    if (error.message === "INVALID_OR_EXPIRED_OTP") {
        return res.status(401).json(errorResponse(401, error.message));
    }
    
    next(error);
  }
};


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'];

    if (!email || !password) {
      return res.status(400).json(errorResponse(400, "Email and password are required."));
    }

    const data = await authService.login(email, password, ip, userAgent);

    return res.status(200).json(
      successResponse(200, "Login successful. Welcome back!", data)
    );
  } catch (error) {
    authControllerLogger.warn(`Login failure for ${req.body.email}: ${error.message}`);
    
    if (error.message === "INVALID_CREDENTIALS") {
        return res.status(401).json(errorResponse(401, "Invalid email or password."));
    }

    next(error);
  }
};


export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json(errorResponse(401, "Session expired. Please login again."));
    }

    const result = await authService.refreshSession(refreshToken);
    
    return res.status(200).json(successResponse(200, "Token refreshed.", result));
  } catch (error) {
    authControllerLogger.error(`Refresh Error: ${error.message}`);
    next(error);
  }
};


export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json(errorResponse(400, "Please provide your registered email."));
    }

    const result = await authService.forgotPassword(email);

    return res.status(200).json(
      successResponse(200, "If an account exists, a reset code has been sent.", result)
    );
  } catch (error) {
    return res.status(200).json(
      successResponse(200, "If an account exists, a reset code has been sent.")
    );
  }
};


export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.userId);
    res.clearCookie('refreshToken');
    return res.status(200).json(successResponse(200, "Logged out successfully."));
  } catch (error) {
    next(error);
  }
};