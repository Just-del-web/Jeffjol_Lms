import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

function secretVault(secretName, envName, defaultValue = null, required = false) {
  const secretPath = `/run/secrets/${secretName}`;
  let value;

  if (fs.existsSync(secretPath)) {
    try {
      value = fs.readFileSync(secretPath, 'utf8').trim();
    } catch (error) {
      console.warn(`[Config] Failed to read secret file ${secretName}:`, error.message);
    }
  }

  if (!value) value = process.env[envName];
  if (!value) value = defaultValue;

  if (required && (value === null || value === undefined || value === '')) {
    throw new Error(`FATAL: Configuration "${secretName}/${envName}" is required but missing.`);
  }

  return value;
}

const isProduction = process.env.NODE_ENV === 'production';
const MAIN_DOMAIN = process.env.MAIN_DOMAIN || 'localhost';

const config = {
  // --- SERVER ---
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PROD: isProduction,
  PORT: parseInt(process.env.PORT, 10) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  MONGODB_URI: secretVault('mongodb_uri', 'MONGODB_URI', 'mongodb://localhost:27017/miva_lms', true),

  JWT_SECRET: secretVault('jwt_secret', 'JWT_SECRET', null, true),
  JWT_REFRESH_SECRET: secretVault('jwt_refresh_secret', 'JWT_REFRESH_SECRET', null, true),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,

  UPLOAD_DIR: path.resolve(process.env.UPLOAD_DIR || './uploads'),
  MAX_FILE_SIZE: 20 * 1024 * 1024,

  SEB_REQUIRED: process.env.SEB_REQUIRED !== 'false',
  ADMIN_HASH_ROUTE: process.env.ADMIN_HASH_ROUTE || "miva_justice_portal",

  PAYSTACK_SECRET: secretVault('paystack_secret', 'PAYSTACK_SECRET_KEY'),
};

export default config;