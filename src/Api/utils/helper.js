import crypto from 'crypto';
import tokenModel from '../models/token.model.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../config/secret.config.js';
import logger from '../logging/logger.js';

const helperLogger = logger.child({ service: 'HELPER_UTILS' });

const HMAC_SECRET = config.HMAC_SECRET;
const tokenExpiry = +30 * 60 * 1000;
const BCRYPTSALT = Number(config.BCRYPT_SALT_ROUNDS) || 12;


const mapIntent = (internalIntent) => {
  const mapping = {
    'signup-verification': 'email-verification',
    'signin-2fa': 'email-verification',
    'email-verification': 'email-verification',
    'password-reset': 'password-reset',
    'refresh-token': 'refresh-token'
  };
  return mapping[internalIntent] || 'email-verification';
};

const searchQuery = (userId, filters = {}) => ({
  assignedUsers: userId,
  ...filters,
});

const buildPaginationDatas = (
  page = 1,
  limit = 10,
  sort = { createdAt: -1 }
) => ({
  page: parseInt(page),
  limit: parseInt(limit),
  sort,
  populate: [
    { path: 'assignedUsers', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
  ],
});

const createPaymentReference = () =>
  `SUB_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

const calculateExpiryDate = (durationDays) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + durationDays);
  return expiryDate;
};

const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateHashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const generateTokenSignature = (userId, hashedToken) =>
  crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(`${userId.toString()}${hashedToken}`)
    .digest('hex');

const successResponse = (code, message, data = null) => ({
  code,
  success: true,
  message,
  data,
});

const errorResponse = (code, message, data = null) => ({
  code,
  success: false,
  message,
  data,
});


const createVerificationToken = async (userId, session, internalIntent = 'email-verification') => {
  const otp = generateVerificationCode();
  const hashedToken = generateHashToken(otp);
  const dbIntent = mapIntent(internalIntent);
  const codeSignature = generateTokenSignature(userId.toString(), hashedToken);

  await tokenModel.create(
    [
      {
        userId,
        token: hashedToken,
        sig: codeSignature,
        intent: dbIntent,
        expiresAt: new Date(Date.now() + tokenExpiry),
      },
    ],
    { session }
  );

  return { otp, hashedToken };
};

const storeTokenRecord = async (
  userId,
  hashedToken,
  signature,
  intent,
  session
) => {
  const dbIntent = mapIntent(intent);
  await tokenModel.create(
    [
      {
        userId,
        token: hashedToken,
        sig: signature,
        intent: dbIntent,
        expiresAt: new Date(Date.now() + tokenExpiry),
      },
    ],
    { session }
  );
};

const executeWithTransaction = async (operation) => {
  if (config.NODE_ENV === 'test') {
    return await operation();
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await operation(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};


const findValidToken = async (hashedToken, intent, session = null) => {
  const dbIntent = mapIntent(intent);
  const queryData = {
    token: hashedToken,
    intent: dbIntent,
    expiresAt: { $gt: new Date() },
  };

  return session
    ? tokenModel.findOne(queryData).session(session)
    : tokenModel.findOne(queryData);
};

const validateTokenSignature = (storedToken, hashedToken) => {
  const expectedSig = generateTokenSignature(storedToken.userId.toString(), hashedToken);
  return storedToken.sig === expectedSig;
};

const hashPassword = async (password) =>
  bcrypt
    .hash(password, BCRYPTSALT)
    .then((hash) => hash)
    .catch((err) => {
      throw new Error(`Error hashing password: ${err.message}`);
    });

function timeStringToMs(timeStr) {
  if (typeof timeStr !== 'string') {
    if (typeof timeStr === 'number') return timeStr;
    helperLogger.warn(`Invalid time string format provided: ${timeStr}. Defaulting to 0.`);
    return 0;
  }

  const unit = timeStr.slice(-1);
  const value = parseInt(timeStr.slice(0, -1), 10);

  if (isNaN(value)) {
    helperLogger.warn(`Could not parse value from time string: ${timeStr}. Defaulting to 0.`);
    return 0;
  }

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default:
      helperLogger.warn(`Unknown unit in time string: ${timeStr}. Defaulting to 0.`);
      return 0;
  }
}

const generateUnsubscribeToken = (userId) => {
  const timestamp = Date.now();
  const payload = `${userId}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(payload)
    .digest('hex');

  const token = Buffer.from(`${payload}:${signature}`).toString('base64url');
  return token;
};

const verifyUnsubscribeToken = (token) => {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');

    if (parts.length !== 3) return null;

    const [userId, timestamp, providedSignature] = parts;
    const payload = `${userId}:${timestamp}`;

    const expectedSignature = crypto
      .createHmac('sha256', HMAC_SECRET)
      .update(payload)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    );

    if (!isValid) return null;
    return userId;
  } catch (error) {
    helperLogger.warn(`Failed to verify unsubscribe token: ${error.message}`);
    return null;
  }
};

const getDeviceName = (userAgent) => {
  if (!userAgent) return "Unknown Device";
  const ua = userAgent.toLowerCase();
  if (ua.includes('iphone')) return "iPhone";
  if (ua.includes('ipad')) return "iPad";
  if (ua.includes('android')) return "Android Device";
  if (ua.includes('windows')) return "Windows PC";
  if (ua.includes('macintosh')) return "MacBook";
  if (ua.includes('linux')) return "Linux Workstation";
  return "Generic Device";
};

const parseUserAgent = (userAgent) => {
  const os = getDeviceName(userAgent);
  let browser = "Unknown Browser";
  if (userAgent.includes('Chrome')) browser = "Chrome";
  else if (userAgent.includes('Firefox')) browser = "Firefox";
  else if (userAgent.includes('Safari')) browser = "Safari";
  else if (userAgent.includes('Edge')) browser = "Edge";
  return { os, browser };
};

export {
  searchQuery,
  buildPaginationDatas,
  createPaymentReference,
  calculateExpiryDate,
  generateVerificationCode,
  generateHashToken,
  generateTokenSignature,
  getDeviceName,
  parseUserAgent,
  createVerificationToken,
  successResponse,
  errorResponse,
  storeTokenRecord,
  executeWithTransaction,
  findValidToken,
  validateTokenSignature,
  hashPassword,
  timeStringToMs,
  generateUnsubscribeToken,
  verifyUnsubscribeToken,
};