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

/**
 * @route   PATCH /api/tasks/:id/move
 * @desc    Move task status and order (lane movement)
 * @access  Private (Owner/Manager/Assignee only)
 */
export const moveTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { status, order } = req.body;

  if (!status || order === undefined) {
    res.status(400).json({
      success: false,
      message: 'Invalid request: "status" and "order" variables are required in body.',
    });
    return;
  }

  const task = await taskService.moveTask(id, status, order, user);

  return sendSuccess(res, 'Task status moved successfully', task, 200);
});

/**
 * @route   PATCH /api/tasks/reorder
 * @desc    Reorder tasks drag and drop columns shifting
 * @access  Private (Owner/Manager/Assignee only)
 */
export const reorderTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { taskId, sourceStatus, destinationStatus, sourceIndex, destinationIndex } = req.body;

  if (!taskId || !sourceStatus || !destinationStatus || sourceIndex === undefined || destinationIndex === undefined) {
    res.status(400).json({
      success: false,
      message: 'Invalid request parameters for drag and drop: "taskId", "sourceStatus", "destinationStatus", "sourceIndex", and "destinationIndex" are required.',
    });
    return;
  }

  const task = await taskService.reorderTasks(taskId, sourceStatus, destinationStatus, sourceIndex, destinationIndex, user);

  return sendSuccess(res, 'Tasks reordered successfully', task, 200);
});

/**
 * @route   POST /api/tasks/:id/comments
 * @desc    Add a comment to the task discussion thread
 * @access  Private
 */
export const addComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400).json({
      success: false,
      message: 'Comment text is required in the request body.',
    });
    return;
  }

  const task = await taskService.addComment(id, text, user);

  return sendSuccess(res, 'Comment added successfully', task, 201);
});

/**
 * @route   PUT /api/tasks/:id/comments/:commentId
 * @desc    Edit an existing comment
 * @access  Private (Comment author only)
 */
export const editComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id, commentId } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400).json({
      success: false,
      message: 'Comment text is required in the request body.',
    });
    return;
  }

  const task = await taskService.editComment(id, commentId, text, user);

  return sendSuccess(res, 'Comment updated successfully', task, 200);
});

/**
 * @route   DELETE /api/tasks/:id/comments/:commentId
 * @desc    Delete a comment from the discussion thread
 * @access  Private (Comment author/Project owner/Admin only)
 */
export const deleteComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id, commentId } = req.params;
  const task = await taskService.deleteComment(id, commentId, user);

  return sendSuccess(res, 'Comment deleted successfully', task, 200);
});
