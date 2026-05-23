import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';
import * as sprintService from './sprint.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export const createSprint = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const sprint = await sprintService.createSprint(req.body, req.user!);
  return sendSuccess(res, 'Sprint created successfully', sprint, 201);
});

export const getSprints = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await sprintService.getSprints(req.query, req.user!);
  return sendSuccess(res, 'Sprints retrieved successfully', result);
});

export const getSprintById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const sprint = await sprintService.getSprintById(req.params.id, req.user!);
  return sendSuccess(res, 'Sprint details retrieved successfully', sprint);
});

export const updateSprint = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const sprint = await sprintService.updateSprint(req.params.id, req.body, req.user!);
  return sendSuccess(res, 'Sprint updated successfully', sprint);
});

export const deleteSprint = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await sprintService.deleteSprint(req.params.id, req.user!);
  return sendSuccess(res, 'Sprint deleted successfully', {});
});

// ---------------------------------------------------------------------------
// LIFECYCLE
// ---------------------------------------------------------------------------

export const startSprint = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const sprint = await sprintService.startSprint(req.params.id, req.user!);
  return sendSuccess(res, 'Sprint started successfully', sprint);
});

export const endSprint = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const sprint = await sprintService.endSprint(req.params.id, req.body?.retrospective, req.user!);
  return sendSuccess(res, 'Sprint completed successfully', sprint);
});

export const cancelSprint = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const sprint = await sprintService.cancelSprint(req.params.id, req.user!);
  return sendSuccess(res, 'Sprint cancelled successfully', sprint);
});

// ---------------------------------------------------------------------------
// TASK ASSIGNMENT
// ---------------------------------------------------------------------------

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
  const msg = action === 'add' ? 'Tasks added to sprint successfully' : 'Tasks removed from sprint successfully';
  return sendSuccess(res, msg, sprint);
});

// ---------------------------------------------------------------------------
// BURNDOWN & ANALYTICS
// ---------------------------------------------------------------------------

export const getSprintBurndown = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await sprintService.buildBurndown(req.params.id, req.user!);
  return sendSuccess(res, 'Burndown data retrieved successfully', data);
});

export const getSprintAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const analytics = await sprintService.getSprintAnalytics(req.params.id, req.user!);
  return sendSuccess(res, 'Sprint analytics retrieved successfully', analytics);
});
