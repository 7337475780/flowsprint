import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';
import * as projectService from './project.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/response.js';
import { BadRequestError } from '../../utils/errors.js';

/**
 * Handle POST /api/projects - Create a new project.
 */
export const createProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const workspaceId = req.headers['x-workspace-id'] || req.user!.currentWorkspace?.toString();
  if (!workspaceId) {
    throw new BadRequestError('Workspace ID context is required');
  }
  const project = await projectService.createProject(req.body, req.user!._id.toString(), workspaceId as string);
  return sendSuccess(res, 'Project created successfully', project, 201);
});

/**
 * Handle GET /api/projects - Get paginated/filtered list of projects.
 */
export const getProjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await projectService.getProjects(req.query, req.user!);
  return sendSuccess(res, 'Projects list retrieved successfully', result, 200);
});

/**
 * Handle GET /api/projects/:id - Inspect a project's details.
 */
export const getProjectById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const project = await projectService.getProjectById(req.params.id, req.user!);
  return sendSuccess(res, 'Project details retrieved successfully', project, 200);
});

/**
 * Handle PATCH /api/projects/:id - Update project fields.
 */
export const updateProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const project = await projectService.updateProject(req.params.id, req.body, req.user!);
  return sendSuccess(res, 'Project updated successfully', project, 200);
});

/**
 * Handle DELETE /api/projects/:id - Remove a project.
 */
export const deleteProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await projectService.deleteProject(req.params.id, req.user!);
  return sendSuccess(res, 'Project deleted successfully', {}, 200);
});

/**
 * Handle GET /api/projects/stats/overview - Get projects status statistics.
 */
export const getProjectStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const stats = await projectService.getProjectStats(req.user!);
  return sendSuccess(res, 'Project statistics retrieved successfully', stats, 200);
});
