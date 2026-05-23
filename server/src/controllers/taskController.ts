import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import * as taskService from '../services/taskService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @route   POST /api/tasks
 * @desc    Create a new task inside a project
 * @access  Private (Admin/Manager/Project Owner only)
 */
export const createTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const task = await taskService.createTask(req.body, user._id.toString(), user);

  return sendSuccess(res, 'Task created successfully', task, 201);
});

/**
 * @route   GET /api/tasks
 * @desc    Get all workspace tasks (Filtered & Paginated)
 * @access  Private
 */
export const getTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const result = await taskService.getTasks(req.query, user);

  return sendSuccess(res, 'Tasks list retrieved successfully', result, 200);
});

/**
 * @route   GET /api/tasks/:id
 * @desc    Get individual task details populated with relations
 * @access  Private
 */
export const getTaskById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const task = await taskService.getTaskById(id, user);

  return sendSuccess(res, 'Task details retrieved successfully', task, 200);
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task details
 * @access  Private (Owner/Manager/Assignee only)
 */
export const updateTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const task = await taskService.updateTask(id, req.body, user);

  return sendSuccess(res, 'Task updated successfully', task, 200);
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Hard delete a task
 * @access  Private (Admin/Project Owner/Reporter only)
 */
export const deleteTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  await taskService.deleteTask(id, user);

  return sendSuccess(res, 'Task deleted successfully', {}, 200);
});
