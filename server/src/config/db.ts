import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    
    logger.info(`🔌 MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    
    mongoose.connection.on('error', (err) => {
      logger.error('Database connection error occurred', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Database connection lost. Reconnecting...');
    });
  } catch (error) {
    logger.error('Could not establish database connection', error);
    process.exit(1);
  }
};
