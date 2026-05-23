import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getGlobalOverview } from '../services/sprintService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @route   GET /api/analytics/overview
 * @desc    Global workspace productivity overview
 * @access  Private
 */
export const getAnalyticsOverview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const overview = await getGlobalOverview(req.user!);
  return sendSuccess(res, 'Analytics overview retrieved successfully', overview);
});
