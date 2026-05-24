import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';
import * as workspaceService from './workspace.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';
import { User } from '../../models/User.js';
import { BadRequestError } from '../../utils/errors.js';

/**
 * Handle POST /api/workspaces - Create workspace.
 */
export const createWorkspace = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const workspace = await workspaceService.createWorkspace(req.body.name, req.user!._id.toString());
  return sendSuccess(res, 'Workspace created successfully', workspace, 201);
});

/**
 * Handle GET /api/workspaces - Get all workspaces active user belongs to.
 */
export const getWorkspaces = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const workspaces = await workspaceService.getWorkspaces(req.user!._id.toString());
  return sendSuccess(res, 'Workspaces retrieved successfully', workspaces, 200);
});

/**
 * Handle GET /api/workspaces/:id - Fetch details.
 */
export const getWorkspaceById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const workspace = await workspaceService.getWorkspaceById(req.params.id, req.user!._id.toString());
  return sendSuccess(res, 'Workspace details retrieved successfully', workspace, 200);
});

/**
 * Handle POST /api/workspaces/:id/members - Assign teammates to workspace.
 */
export const addMemberToWorkspace = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const workspace = await workspaceService.addMemberToWorkspace(
    req.params.id,
    req.body.email,
    req.user!._id.toString()
  );
  return sendSuccess(res, 'Teammate added to workspace successfully', workspace, 200);
});

/**
 * Handle POST /api/workspaces/:id/switch - Switch the active workspace context.
 */
export const switchWorkspace = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.params.id;
  const user = await User.findById(req.user!._id);
  if (!user) {
    throw new BadRequestError('User profile context not found');
  }

  // Ensure user is actually mapped in this workspace
  const workspacesList = user.workspaces || [];
  if (!workspacesList.includes(workspaceId)) {
    // Perform verification on DB directly
    const belongs = await workspaceService.getWorkspaceById(workspaceId, user._id.toString());
    if (!belongs) {
      throw new BadRequestError('You do not belong to the requested workspace');
    }
  }

  user.currentWorkspace = workspaceId as any;
  await user.save();

  return sendSuccess(res, 'Workspace switched successfully', { currentWorkspace: workspaceId }, 200);
});
