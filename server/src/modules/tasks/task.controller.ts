import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as taskService from './task.service.js';
import { appCache } from '../../utils/cache.js';
import { invalidateAnalyticsCache } from '../analytics/analytics.controller.js';

/**
 * Helper to clear task and analytics caches upon mutations.
 */
const invalidateTaskCache = (taskId: string, userId: string) => {
  appCache.delete(`task:${taskId}:${userId}`);
  appCache.invalidatePattern(new RegExp(`^task:${taskId}:`));
  invalidateAnalyticsCache(userId);
};

export const createTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.createTask(req.body, req.user!);
  
  // Clear user analytics cache
  invalidateAnalyticsCache(req.user!._id.toString());

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  });
});

export const getTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await taskService.getTasks(req.query, req.user!);
  res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully',
    data: result,
  });
});

export const getTaskById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const taskId = req.params.id;
  const userId = req.user!._id.toString();
  const cacheKey = `task:${taskId}:${userId}`;

  const cachedTask = appCache.get(cacheKey);
  if (cachedTask) {
    return res.status(200).json({
      success: true,
      message: 'Task details retrieved successfully',
      data: cachedTask,
      cached: true,
    });
  }

  const task = await taskService.getTaskById(taskId, req.user!);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  appCache.set(cacheKey, task, 300_000); // 5 minutes TTL

  res.status(200).json({
    success: true,
    message: 'Task details retrieved successfully',
    data: task,
  });
});

export const updateTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user!);
  
  // Invalidate cache
  invalidateTaskCache(req.params.id, req.user!._id.toString());

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task,
  });
});

export const deleteTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await taskService.deleteTask(req.params.id, req.user!);
  
  // Invalidate cache
  invalidateTaskCache(req.params.id, req.user!._id.toString());

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});

export const moveTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, position, order } = req.body;
  const { id } = req.params;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Invalid request: "status" variable is required in body.',
    });
  }

  const finalOrder = position !== undefined ? position : order;
  const task = await taskService.moveTask(id, status, finalOrder, req.user!);
  
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  // Invalidate cache
  invalidateTaskCache(id, req.user!._id.toString());

  res.status(200).json({
    success: true,
    message: 'Task status moved successfully',
    data: task,
  });
});

export const reorderTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  console.log("REORDER PAYLOAD:", req.body);

  const { reorders } = req.body;

  if (!reorders || !Array.isArray(reorders)) {
    return res.status(400).json({ message: "Invalid reorder payload" });
  }

  for (const item of reorders) {
    if (!item || !item.taskId || typeof item.order !== 'number') {
      return res.status(400).json({ message: "Invalid reorder payload" });
    }
  }

  await taskService.bulkReorder(reorders, req.user!);
  
  // Invalidate user analytics cache
  invalidateAnalyticsCache(req.user!._id.toString());

  res.status(200).json({ success: true });
});

export const addComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.addComment(req.params.id, req.body.text, req.user!);
  
  // Invalidate cache
  invalidateTaskCache(req.params.id, req.user!._id.toString());

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: task,
  });
});

export const toggleSubtask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.toggleSubtask(
    req.params.id,
    req.params.subtaskId,
    req.body.completed,
    req.user!
  );
  
  // Invalidate cache
  invalidateTaskCache(req.params.id, req.user!._id.toString());

  res.status(200).json({
    success: true,
    message: 'Subtask status toggled successfully',
    data: task,
  });
});

export const getTaskStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const projectId = (req.query.projectId || req.params.projectId) as string;
  const stats = await taskService.getTaskStats(projectId, req.user!);
  res.status(200).json({
    success: true,
    message: 'Task stats overview retrieved successfully',
    data: stats,
  });
});
