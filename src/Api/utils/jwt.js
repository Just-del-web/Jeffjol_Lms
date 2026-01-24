import config from '../config/secret.config.js';
import jwt from "jsonwebtoken";
import crypto from "crypto";
import logger from "../logging/logger.js";
import tokenModel from '../model/token.model.js';
import { generateTokenSignature, errorResponse, successResponse, timeStringToMs } from './helper.js';

const jwtLogger = logger.child({ service: "JWT_SERVICE" });

const JWT_COOKIE_CONFIG = {
    httpOnly: config.JWT_COOKIE_HTTP_ONLY !== undefined ? config.JWT_COOKIE_HTTP_ONLY : true,
    secure: config.JWT_COOKIE_SECURE !== undefined ? config.JWT_COOKIE_SECURE : process.env.NODE_ENV === 'production',
    sameSite: config.JWT_COOKIE_SAME_SITE || 'strict',
    maxAge: config.JWT_COOKIE_MAX_AGE || 24 * 60 * 60 * 1000,
    domain: config.JWT_COOKIE_DOMAIN,
    path: config.JWT_COOKIE_PATH || '/',
    signed: config.JWT_COOKIE_SIGNED || false
};

/**
 * 💾 INTERNAL: PERSIST TOKEN RECORD
 * Stores signature and metadata in MongoDB for rotation tracking.
 */
const storedToken = async (userId, token, intent, expireInMs, deviceInfo = {}) => {
    try {
        const sig = generateTokenSignature(userId.toString(), token);
        await tokenModel.create({
            userId,
            token,
            sig,
            intent,
            expiresAt: new Date(Date.now() + expireInMs),
            deviceInfo
        });
        jwtLogger.info(`Token record synchronized for user ${userId} [Intent: ${intent}]`);
    } catch (error) {
        jwtLogger.error(`Database Error storing token: ${error.message}`);
        throw new Error("Token storage failed");
    }
};


export const Tokengenerator = async (user, deviceInfo = {}, extendedExpiry = false) => {
    try {
        const userId = (user._id || user.id).toString();
        const currentVersion = user.tokenVersion ?? 0;
        
        const refreshjti = crypto.randomUUID();
        const refreshExpiresIn = extendedExpiry ? "60d" : "24h";

        const refreshPayload = {
            sub: userId,
            jti: refreshjti,
            type: "refresh",
            tokenVersion: currentVersion,
            trusted: extendedExpiry
        };

        const refreshToken = jwt.sign(refreshPayload, config.JWT_REFRESH_SECRET, {
            expiresIn: refreshExpiresIn
        });

        const refreshExpiresMs = timeStringToMs(refreshExpiresIn);
        await storedToken(userId, refreshToken, "refresh-token", refreshExpiresMs, deviceInfo);

        const accessToken = jwt.sign(
            { 
                sub: userId, 
                id: userId, 
                tokenVersion: currentVersion 
            },
            config.JWT_SECRET,
            { expiresIn: config.JWT_ACCESS_EXPIRY || '30m' }
        );

        return { accessToken, refreshToken, expireIn: 1800 };
    } catch (error) {
        jwtLogger.error(`Critical Token Generation Failure: ${error.message}`);
        throw new Error("Token generation failed");
    }
};

export const setRefreshTokenCookie = (res, refreshToken, extendedExpiry = false) => {
    const cookieOptions = {
        ...JWT_COOKIE_CONFIG,
        ...(extendedExpiry && { maxAge: 60 * 24 * 60 * 60 * 1000 })
    };
    res.cookie("token", refreshToken, cookieOptions);
};


export const tokenRefreshService = async (refreshtoken) => {
    try {
        const storedTokenDoc = await tokenModel.findOne({
            token: refreshtoken,
            intent: "refresh-token",
            expiresAt: { $gt: new Date() }
        }).populate({
            path: 'userId',
            select: '+tokenVersion'
        });

        if (!storedTokenDoc) {
            return errorResponse(401, "Invalid or expired session. Please sign in again.");
        }

        const user = storedTokenDoc.userId;
        if (!user) {
            await tokenModel.findByIdAndDelete(storedTokenDoc._id);
            return errorResponse(404, "Identity node no longer exists.");
        }

        const expectedSig = generateTokenSignature(user._id.toString(), refreshtoken);
        if (storedTokenDoc.sig !== expectedSig) {
            jwtLogger.warn(`Signature breach for user ${user._id}. PURGING ALL SESSIONS.`);
            await tokenModel.deleteMany({ userId: user._id });
            return errorResponse(401, "Security mismatch. All active shields dropped.");
        }

        const decodedPayload = jwt.verify(refreshtoken, config.JWT_REFRESH_SECRET);
        const jwtVersion = decodedPayload.tokenVersion;

        if (user.tokenVersion !== undefined && jwtVersion !== undefined) {
            if (user.tokenVersion !== jwtVersion) {
                jwtLogger.warn(`Version conflict: DB(${user.tokenVersion}) vs JWT(${jwtVersion})`);
                await tokenModel.deleteMany({ userId: user._id });
                return errorResponse(401, "Session revoked due to version update.");
            }
        }

        const newTokens = await Tokengenerator(user);
        const refreshExpiry = config.JWT_REFRESH_EXPIRES_IN || "24h";

        await tokenModel.findByIdAndUpdate(storedTokenDoc._id, {
            token: newTokens.refreshToken,
            sig: generateTokenSignature(user._id.toString(), newTokens.refreshToken),
            expiresAt: new Date(Date.now() + timeStringToMs(refreshExpiry))
        });

        return successResponse(200, "Node session rotated", {
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
            expireIn: newTokens.expireIn
        });

    } catch (error) {
        jwtLogger.error(`Rotation Failure: ${error.message}`);
        return errorResponse(401, "Silent refresh failed.");
    }
};
export default Tokengenerator;