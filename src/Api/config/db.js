import mongoose from 'mongoose';
import config from './secret.config.js';
import logger from '../logging/logger.js';

const dbLogger = logger.child({ service: "DB_SERVICE" });


const connectDB = async () => {
  dbLogger.info('Connecting to database...');

  mongoose.connection.on('connected', () => {
    dbLogger.info("✅ MongoDB connected successfully");
  });

  mongoose.connection.on('error', (err) => {
    dbLogger.error('❌ Error connecting to MongoDB', { error: err.message });
  });

  mongoose.connection.on('disconnected', () => {
    dbLogger.warn('⚠️ MongoDB disconnected');
  });

  return mongoose.connect(config.MONGO_URI);
};

export default connectDB;