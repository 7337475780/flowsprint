import { Router } from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import {
  getOverview,
  getProjectAnalytics,
  getSprintAnalytics,
  getTeamAnalytics,
  getTrendAnalytics,
} from './analytics.controller.js';

const router = Router();

// Secure all endpoints with authentication guard
router.use(protect as any);

router.get('/overview', getOverview);
router.get('/projects/:projectId', getProjectAnalytics);
router.get('/sprints/:sprintId', getSprintAnalytics);
router.get('/team', getTeamAnalytics);
router.get('/trends', getTrendAnalytics);

export default router;
