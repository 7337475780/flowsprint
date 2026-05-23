import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../utils/response.js';
import { env } from '../config/env.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const healthData = {
    status: 'healthy',
    environment: env.NODE_ENV,
    uptime: `${process.uptime().toFixed(2)}s`,
    timestamp: new Date().toISOString(),
    system: {
      memoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      nodeVersion: process.version,
    },
    database: {
      status: dbStatusMap[dbStatus] || 'unknown',
      connected: dbStatus === 1,
    },
  };

  return sendSuccess(res, 'System health diagnostics retrieved successfully', healthData);
});

export default router;
