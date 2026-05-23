import { Router } from 'express';
import { getAnalyticsOverview } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Analytics endpoints require JWT authentication
router.use(protect as any);

/**
 * @route   GET /api/analytics/overview
 * @desc    Global workspace productivity overview
 * @access  Private
 */
router.get('/overview', getAnalyticsOverview);

export default router;
