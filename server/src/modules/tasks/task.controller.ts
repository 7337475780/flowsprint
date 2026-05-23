import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as taskService from './task.service.js';

export const createTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.createTask(req.body, req.user!);
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
  const task = await taskService.getTaskById(req.params.id, req.user!);
  res.status(200).json({
    success: true,
    message: 'Task details retrieved successfully',
    data: task,
  });
});

export const updateTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user!);
  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task,
  });
});

export const deleteTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await taskService.deleteTask(req.params.id, req.user!);
  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});

export const updateTaskStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.updateTaskStatus(req.params.id, req.body.status, req.user!);
  res.status(200).json({
    success: true,
    message: 'Task status updated successfully',
    data: task,
  });
});

export const reorderTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.reorderTasks(
    req.params.id,
    req.body.status,
    req.body.position,
    req.user!
  );
  res.status(200).json({
    success: true,
    message: 'Task reordered successfully',
    data: task,
  });
});

export const addComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const task = await taskService.addComment(req.params.id, req.body.text, req.user!);
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
