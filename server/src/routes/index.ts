import { Router } from 'express';
import healthRouter from './health.js';

const router = Router();

// Base health indicator
router.use('/health', healthRouter);

/**
 * Feature Route Scaffolding (Phase 2 integrations)
 * 
 * router.use('/auth', authRouter);
 * router.use('/projects', projectsRouter);
 * router.use('/tasks', tasksRouter);
 * router.use('/sprints', sprintsRouter);
 * router.use('/users', usersRouter);
 */

export default router;
