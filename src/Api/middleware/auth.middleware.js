import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";
import logger from "../logging/logger.js";
import config from "../config/secret.config.js";
import { errorResponse } from "../utils/helper.js"; 

const authLogger = logger.child({ service: "AUTH_MIDDLEWARE" });
const JWT_SECRET = config.JWT_SECRET;


export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) { 
      authLogger.warn("Unauthorized access - No token provided");
      return res.status(401).json(
        errorResponse(401, "Unauthorized access. No token provided.").data
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });

    const userId = decoded._id || decoded.id || decoded.sub;
    if (!userId) {
      authLogger.warn("Invalid token payload: User ID not found.", decoded);
      return res.status(401).json(errorResponse(401, "Invalid token.").data);
    }

    const user = await User.findById(userId).select("+tokenVersion"); 

    if (!user) {
      authLogger.warn(`User not found: ${userId}`);
      return res.status(401).json(errorResponse(401, "Invalid credentials.").data);
    }
    
    if (user.tokenVersion !== decoded.tokenVersion) {
      authLogger.warn(`Invalid token version for user ${user._id}. Session revoked.`);
      return res.status(401).json(errorResponse(401, "Session expired. Please sign in again.").data);
    }

    const now = new Date();
    if (user.trial.isUnderTrial) {
      if (now > user.trial.trialExpiresAt) {
        await User.findByIdAndUpdate(user._id, { 
          planStatus: "expired", 
          "trial.isUnderTrial": false 
        });
        
        authLogger.warn(`Trial period expired for user: ${user._id}`);
        return res.status(402).json(
          errorResponse(402, "Your 14-day trial has expired. Please top up your balance to continue.").data
        );
      }
    } else if (user.planStatus === "expired") {
       return res.status(402).json(
         errorResponse(402, "Your subscription has expired. Please add credits to your wallet.").data
       );
    }

    authLogger.info(`User authenticated: ${user._id} | Active Team: ${user.currentTeamId}`);
    
    req.userid = user._id; 
    req.user = user;    
    req.teamId = user.currentTeamId;
    
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      authLogger.warn("Token expired");
      return res.status(401).json(errorResponse(401, "Token expired. Please sign in again.").data);
    }
    if (error.name === "JsonWebTokenError") {
      authLogger.warn("Invalid token structure");
      return res.status(401).json(errorResponse(401, "Invalid token!").data);
    }
    
    authLogger.error("Authentication error", { error: error.message, stack: error.stack });
    return res.status(500).json(errorResponse(500, "Internal authentication failure.").data);
  }
};


export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      authLogger.warn(`Forbidden access attempt: User ${req.user._id} [${req.user.role}] tried to access ${req.originalUrl}`);
      
      return res.status(403).json(
        errorResponse(403, "You do not have permission to perform this action.").data
      );
    }
    next();
  };
};
