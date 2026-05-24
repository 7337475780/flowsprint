import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './modules/projects/project.routes.js';
import taskRoutes from './modules/tasks/task.routes.js';
import sprintRoutes from './modules/sprints/sprint.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import fileRoutes from './modules/files/file.routes.js';
import userRoutes from './modules/users/user.routes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { protect } from './middleware/authMiddleware.js';
import workspaceRoutes from './modules/workspaces/workspace.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import { globalLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Security & Core Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow cross-origin images/PDFs for previews
}));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: allowedOrigins,
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

// Serve local uploads folder statically for fallback mode
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Enforce Global API rate limiting on standard routes
app.use('/api', globalLimiter);

// 4. API Routes Mounting
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/profile', protect as any, (req: any, res: any) => {
  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: req.user,
  });
});

// Serve built frontend assets statically if they exist on disk
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// 5. 404 Catch-All Fallback & SPA Client Fallback
app.use((req, res) => {
  // If GET request is not an API route, try serving React client index
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(__dirname, '../../client/dist/index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
      return;
    }
  }

  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// 6. Centralized Global Error Handler
app.use(errorMiddleware);

export default app;
