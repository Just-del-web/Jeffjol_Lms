import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import config from '../config/secret.config.js';
import { errorResponse } from '../utils/helper.js';
import logger from '../logging/logger.js';

const redisClient = new Redis({
  host: config.REDIS_HOST || '127.0.0.1',
  port: config.REDIS_PORT || 6379,
});

redisClient.on('error', (err) => logger.error('Redis RateLimit Client Error:', err));

export const globalLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix: 'rl:global:',
  }),
  windowMs: 15 * 60 * 1000, 
  max: 500, 
  message: errorResponse(429, "Too many requests. Please try again in 15 minutes.").data,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix: 'rl:auth:',
  }),
  windowMs: 60 * 60 * 1000, 
  max: 6, 
  skipSuccessfulRequests: true, 
  message: errorResponse(429, "Security Alert: Too many failed login attempts. This IP is blocked for 1 hour.").data,
  standardHeaders: true,
  legacyHeaders: false,
});