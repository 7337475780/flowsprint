import dns from 'dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Force Node's DNS resolver to use Google & Cloudflare servers, bypassing local ISP blocks
dns.setServers(['8.8.8.8', '1.1.1.1']);

// 1. Initialize environment configuration first
dotenv.config();

import http from 'http';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { initSocket } from './sockets/index.js';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  console.log('🚀 Starting FlowSprint API Server...');

  // 2. Connect Database
  await connectDatabase();

  // 3. Start HTTP server with Socket.io initialized
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  const server = httpServer.listen(PORT, () => {
    console.log(`🔥 Server booted in [${NODE_ENV}] mode on port: ${PORT}`);
    console.log(`🔗 Health indicator at: http://localhost:${PORT}/api/health`);
    console.log(`🔗 API auth scope at: http://localhost:${PORT}/api/auth`);
  });

  // 4. Graceful Shutdown & Release Resources
  const handleShutdown = async (signal: string) => {
    console.warn(`\n⚠️ Received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      console.log('🛑 HTTP server closed.');
      try {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error releasing MongoDB connection on shutdown:', err);
        process.exit(1);
      }
    });

    // Enforce hard exit after 10s if hanging
    setTimeout(() => {
      console.error('💥 Forced shutdown: operations timed out while closing.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer().catch((error) => {
  console.error('❌ Fatal error during server bootstrap:', error);
  process.exit(1);
});
