import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import StudentProfile from "../models/student_profile.model.js"; 
import logger from "../logging/logger.js";
import config from "../config/secret.config.js";
import { errorResponse } from "../utils/helper.js"; 

const authLogger = logger.child({ service: "AUTH_MIDDLEWARE" });
const JWT_SECRET = config.JWT_SECRET;

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      
      return res.status(401).json(errorResponse(401, "Please sign in to access the portal."));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });

    const user = await User.findById(decoded.id || decoded._id).select("+tokenVersion");

    if (!user || !user.isActive) {
      
      return res.status(403).json(errorResponse(403, "Access denied. Your account is currently inactive."));
    }

    if (user.tokenVersion !== decoded.tokenVersion) {
      
      return res.status(401).json(errorResponse(401, "Session expired. Please sign in again."));
    }

    if (user.role === 'student') {
      const profile = await StudentProfile.findOne({ user: user._id });
      
      if (profile && (profile.status === 'suspended' || profile.status === 'withdrawn')) {
        authLogger.warn(`Access Blocked: Student ${user.email} is ${profile.status}`);
      
        return res.status(403).json(
          errorResponse(403, `Access denied. Your student record is currently marked as ${profile.status}.`)
        );
      }

      req.isCleared = profile?.isClearedForExams || false;
      req.studentProfile = profile;
    }

    req.user = user;
    req.userId = user._id;
    req.role = user.role; 
    
    authLogger.info(`Authenticated: ${user.firstName} ${user.lastName} | Role: ${user.role}`);
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      
      return res.status(401).json(errorResponse(401, "Session expired. Log in again."));
    }
    
    return res.status(401).json(errorResponse(401, "Invalid session."));
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      authLogger.warn(`Access Denied: ${req.user.firstName} attempted unauthorized access.`);
      
      return res.status(403).json(
        errorResponse(403, "Access denied. Contact the Admin for permission.")
      );
    }
    next();
  };
};