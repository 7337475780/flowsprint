import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';
import * as analyticsService from './analytics.service.js';
import { analyticsCache } from './analytics.utils.js';

// Cache TTL constant: 5 minutes in milliseconds
const CACHE_TTL = 300_000;

/**
 * GET /api/analytics/overview
 * Global workspace productivity overview (cached)
 */
export const getOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const cacheKey = `overview:${userId}`;

    const cachedData = analyticsCache.get(cacheKey);
    if (cachedData) {
      res.status(200).json({
        success: true,
        data: cachedData,
        cached: true,
      });
      return;
    }

    const data = await analyticsService.getWorkspaceOverview(req.user!);
    analyticsCache.set(cacheKey, data, CACHE_TTL);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error compiling workspace overview',
    });
  }
};

/**
 * GET /api/analytics/projects/:projectId
 * Specific project progress, workload, and member stats
 */
export const getProjectAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const projectId = req.params.projectId;
    const cacheKey = `project:${projectId}:${userId}`;

    const cachedData = analyticsCache.get(cacheKey);
    if (cachedData) {
      res.status(200).json({
        success: true,
        data: cachedData,
        cached: true,
      });
      return;
    }

    const data = await analyticsService.getProjectAnalytics(projectId, req.user!);
    analyticsCache.set(cacheKey, data, CACHE_TTL);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    const status = error.name === 'UnauthorizedError' ? 403 : error.name === 'NotFoundError' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error compiling project analytics',
    });
  }
};

/**
 * GET /api/analytics/sprints/:sprintId
 * Specific sprint burndown progress and points charts
 */
export const getSprintAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const sprintId = req.params.sprintId;
    const cacheKey = `sprint:${sprintId}:${userId}`;

    const cachedData = analyticsCache.get(cacheKey);
    if (cachedData) {
      res.status(200).json({
        success: true,
        data: cachedData,
        cached: true,
      });
      return;
    }

    const data = await analyticsService.getSprintMetrics(sprintId, req.user!);
    analyticsCache.set(cacheKey, data, CACHE_TTL);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    const status = error.name === 'UnauthorizedError' ? 403 : error.name === 'NotFoundError' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error compiling sprint analytics',
    });
  }
};

/**
 * GET /api/analytics/team
 * Aggregated active members leaderboard scores
 */
export const getTeamAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const cacheKey = `team:${userId}`;

    const cachedData = analyticsCache.get(cacheKey);
    if (cachedData) {
      res.status(200).json({
        success: true,
        data: cachedData,
        cached: true,
      });
      return;
    }

    const data = await analyticsService.getTeamMetrics(req.user!);
    analyticsCache.set(cacheKey, data, CACHE_TTL);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error compiling team analytics',
    });
  }
};

/**
 * GET /api/analytics/trends
 * Weekly completion rates and velocity history (cached)
 */
export const getTrendAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const cacheKey = `trends:${userId}`;

    const cachedData = analyticsCache.get(cacheKey);
    if (cachedData) {
      res.status(200).json({
        success: true,
        data: cachedData,
        cached: true,
      });
      return;
    }

    const data = await analyticsService.getTrendMetrics(req.user!);
    analyticsCache.set(cacheKey, data, CACHE_TTL);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error compiling trends analytics',
    });
  }
};

/**
 * Helper to clear analytical cache on updates (to guarantee real-time updates)
 */
export const invalidateAnalyticsCache = (userId?: string): void => {
  if (userId) {
    // Clear user specific keys
    const pattern = new RegExp(`:${userId}$`);
    analyticsCache.invalidatePattern(pattern);
  } else {
    // Clear everything
    analyticsCache.clear();
  }
};
