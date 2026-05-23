import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './modules/projects/project.routes.js';
import taskRoutes from './modules/tasks/task.routes.js';
import sprintRoutes from './routes/sprintRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

const app = express();

// 1. Security & Core Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. Request Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 3. Request Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 4. API Routes Mounting
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/analytics', analyticsRoutes);

// 5. 404 Catch-All Fallback
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// 6. Centralized Global Error Handler
app.use(errorMiddleware);

export default app;
