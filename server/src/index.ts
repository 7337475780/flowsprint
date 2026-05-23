import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { logger } from './utils/logger.js';
import mongoose from 'mongoose';

const startServer = async () => {
  logger.info('🚀 Starting FlowSprint API Server...');
  
  // 1. Establish Database Connection
  await connectDatabase();

  // 2. Start Listening
  const server = app.listen(env.PORT, () => {
    logger.info(`🔥 Server running in [${env.NODE_ENV}] mode on port: ${env.PORT}`);
    logger.info(`🔗 API Endpoint: http://localhost:${env.PORT}/api/v1`);
  });

  // 3. Graceful Shutdown Handler
  const handleShutdown = async (signal: string) => {
    logger.warn(`⚠️ Received ${signal}. Shutting down gracefully...`);
    
    server.close(async () => {
      logger.info('🛑 HTTP server closed.');
      
      try {
        await mongoose.connection.close();
        logger.info('🔌 MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        logger.error('❌ Error closing MongoDB connection during shutdown:', err);
        process.exit(1);
      }
    });

    // Enforce shutdown after 10 seconds if connections are hanging
    setTimeout(() => {
      logger.error('💥 Forced shutdown: operations took too long to close.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer().catch((error) => {
  logger.error('❌ Fatal error during server bootstrap:', error);
  process.exit(1);
});
