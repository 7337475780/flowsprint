import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import * as sprintService from '../services/sprintService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

/**
 * @route   POST /api/sprints
 * @desc    Create a new planned sprint
 * @access  Private (Admin / Manager / Project Owner)
 */
export const createSprint = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const sprint = await sprintService.createSprint(req.body, user);
  return sendSuccess(res, 'Sprint created successfully', sprint, 201);
});

/**
 * @route   GET /api/sprints
 * @desc    Get paginated and filtered list of sprints
 * @access  Private
 */
export const getSprints = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await sprintService.getSprints(req.query, req.user!);
  return sendSuccess(res, 'Sprints retrieved successfully', result);
});

/**
 * @route   GET /api/sprints/:id
 * @desc    Get a single sprint with live progress stats
 * @access  Private
 */
export const getSprintById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const sprint = await sprintService.getSprintById(req.params.id, req.user!);
  return sendSuccess(res, 'Sprint details retrieved successfully', sprint);
});

/**
 * @route   PUT /api/sprints/:id
 * @desc    Update sprint fields
 * @access  Private (Owner / Manager / Admin)
 */
export const updateSprint = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const sprint = await sprintService.updateSprint(req.params.id, req.body, req.user!);
  return sendSuccess(res, 'Sprint updated successfully', sprint);
});

/**
 * @route   DELETE /api/sprints/:id
 * @desc    Remove a sprint workspace
 * @access  Private (Owner / Admin)
 */
export const deleteSprint = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await sprintService.deleteSprint(req.params.id, req.user!);
  return sendSuccess(res, 'Sprint deleted successfully', {});
});

// ---------------------------------------------------------------------------
// LIFECYCLE
// ---------------------------------------------------------------------------

/**
 * @route   PATCH /api/sprints/:id/start
 * @desc    Transition sprint from planned to active
 * @access  Private
 */
export const startSprint = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const sprint = await sprintService.startSprint(req.params.id, req.user!);
  return sendSuccess(res, 'Sprint started successfully', sprint);
});

/**
 * @route   PATCH /api/sprints/:id/end
 * @desc    Close an active sprint and calculate velocity
 * @access  Private
 */
export const endSprint = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const sprint = await sprintService.endSprint(req.params.id, req.body?.retrospective, req.user!);
  return sendSuccess(res, 'Sprint completed successfully', sprint);
});

/**
 * @route   PATCH /api/sprints/:id/cancel
 * @desc    Cancel a sprint
 * @access  Private
 */
export const cancelSprint = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const sprint = await sprintService.cancelSprint(req.params.id, req.user!);
  return sendSuccess(res, 'Sprint cancelled successfully', sprint);
});

// ---------------------------------------------------------------------------
// TASK ASSIGNMENT
// ---------------------------------------------------------------------------

/**
 * @route   PATCH /api/sprints/:id/tasks
 * @desc    Add or remove tasks from a sprint
 * @access  Private
 */
export const manageSprintTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { taskIds, action } = req.body;

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    res.status(400).json({ success: false, message: 'taskIds must be a non-empty array of task IDs.' });
    return;
  }
  if (!['add', 'remove'].includes(action)) {
    res.status(400).json({ success: false, message: 'action must be either "add" or "remove".' });
    return;
  }

  const sprint = await sprintService.manageSprintTasks(req.params.id, taskIds, action, req.user!);
  const msg    = action === 'add' ? 'Tasks added to sprint successfully' : 'Tasks removed from sprint successfully';
  return sendSuccess(res, msg, sprint);
});

// ---------------------------------------------------------------------------
// BURNDOWN
// ---------------------------------------------------------------------------

/**
 * @route   GET /api/sprints/:id/burndown
 * @desc    Get chart-ready daily burndown data
 * @access  Private
 */
export const getSprintBurndown = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await sprintService.buildBurndown(req.params.id, req.user!);
  return sendSuccess(res, 'Burndown data retrieved successfully', data);
});

// ---------------------------------------------------------------------------
// ANALYTICS
// ---------------------------------------------------------------------------

/**
 * @route   GET /api/sprints/:id/analytics
 * @desc    Detailed analytics for a single sprint
 * @access  Private
 */
export const getSprintAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const analytics = await sprintService.getSprintAnalytics(req.params.id, req.user!);
  return sendSuccess(res, 'Sprint analytics retrieved successfully', analytics);
});
