import geoip from "geoip-lite";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import StudentProfile from "../models/student_profile.model.js";
import logger from "../logging/logger.js";
import * as helper from "../utils/helper.js"; 
import config from "../config/secret.config.js";

const authLogger = logger.child({ service: "AUTH_SERVICE" });

export class AuthService {
  _getLocation(ip) {
    const targetIp = ip === "::1" || ip === "127.0.0.1" ? "8.8.8.8" : ip;
    const geo = geoip.lookup(targetIp);
    return geo ? `${geo.city}, ${geo.country}` : "Unknown Location";
  }

  async signup(data, ip, userAgent) {
    return await helper.executeWithTransaction(async (session) => {
      authLogger.info(`Signup attempt initiated: ${data.email}`);
      const normalizedEmail = data.email.toLowerCase();

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) throw new Error("USER_ALREADY_EXISTS");

      const deviceDetails = helper.parseUserAgent(userAgent);
      const location = this._getLocation(ip);

      const [user] = await User.create(
        [
          {
            firstName: data.firstName,
            lastName: data.lastName,
            email: normalizedEmail,
            password: data.password,
            role: data.role || "student",
            lastActiveIp: ip,
            isVerified: false,
            activeSessions: [
              {
                browser: deviceDetails.browser,
                os: deviceDetails.os,
                ip: ip,
                location: location,
                lastActive: new Date(),
              },
            ],
          },
        ],
        { session }
      );

      if (user.role === "student") {
        const [profile] = await StudentProfile.create(
          [
            {
              user: user._id,
              currentClass: data.currentClass || "SS1",
              gender: data.gender,
              classArm: data.classArm || "A",
              academicYear: "2024/2025",
              schoolId: data.schoolId,
              isClearedForExams: false, 
            },
          ],
          { session }
        );

        user.profile = profile._id;
        await user.save({ session, validateBeforeSave: false });
        authLogger.info(`Student Profile linked: ${profile.studentId}`);
      }

      const { otp } = await helper.createVerificationToken(
        user._id,
        session,
        "signup-verification"
      );

      // Log verification code to terminal for development
      console.log(`\n[SECURITY] Verification OTP for ${user.email}: ${otp}\n`);

      authLogger.info(`Signup successful for User ID: ${user._id}`);

      return {
        userId: user._id,
        email: user.email,
        requiresVerification: true,
        };
    });
  }

  async verifySignupOtp(userId, otp) {

    await helper.validateToken(userId, otp, "signup-verification");

    const user = await User.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    );

    if (!user) throw new Error("USER_NOT_FOUND");

    authLogger.info(`User verified: ${userId}`);
    return { verified: true };
  }

  async login(email, password, ip, userAgent) {
    authLogger.info(`Login attempt for: ${email}`);
    
    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+password +tokenVersion")
      .populate("profile");

    if (!user || !(await user.comparePassword(password))) {
      authLogger.warn(`Invalid login attempt: ${email}`);
      throw new Error("INVALID_CREDENTIALS");
    }

    if (!user.isActive) throw new Error("ACCOUNT_DEACTIVATED");
    const userRole = user.role.toLowerCase();

    const deviceDetails = helper.parseUserAgent(userAgent);
    const location = this._getLocation(ip);

    const newSession = {
      browser: deviceDetails.browser,
      os: deviceDetails.os,
      ip,
      location,
      lastActive: new Date(),
    };

    await User.updateOne(
      { _id: user._id },
      {
        $push: { activeSessions: { $each: [newSession], $slice: -5 } },
        $set: { lastLogin: new Date(), lastActiveIp: ip },
      }
    );

    const token = jwt.sign(
      { 
        id: user._id, 
        role: userRole, 
        tokenVersion: user.tokenVersion,
        name: `${user.firstName} ${user.lastName}` 
      },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN || "24h" }
    );

    return {
      token,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        role: userRole, 
        isVerified: user.isVerified,
        studentId: user.profile?.studentId || null,
      },
    };
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new Error("USER_NOT_FOUND");

    const { otp } = await helper.createVerificationToken(user._id, null, "password-reset");
    
    // Log verification code to terminal for development
    console.log(`\n[SECURITY] Password Reset OTP for ${user.email}: ${otp}\n`);

    authLogger.info(`Password reset requested for ${email}`);
    return { message: "Reset code sent to email", dev_otp: otp };
  }

  async refreshSession(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id).select("+tokenVersion");

      if (!user || user.tokenVersion !== decoded.tokenVersion) {
        throw new Error("INVALID_SESSION");
      }

      const accessToken = jwt.sign(
        { id: user._id, role: user.role, tokenVersion: user.tokenVersion },
        config.JWT_SECRET,
        { expiresIn: '15m' } 
      );

      return { accessToken };
    } catch (err) {
      throw new Error("REFRESH_FAILED");
    }
  }

  async logout(userId) {
    return await User.findByIdAndUpdate(userId, { 
      $inc: { tokenVersion: 1 } 
    });
  }
}