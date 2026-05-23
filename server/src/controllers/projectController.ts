import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import * as projectService from '../services/projectService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

/**
 * @route   POST /api/projects
 * @desc    Create a new project workspace
 * @access  Private (Admin/Manager only)
 */
export const createProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  // Explicit security audit trail check for Manager/Admin
  if (user.role !== 'admin' && user.role !== 'manager') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Only admins or managers are authorized to create projects.',
    });
    return;
  }

  const project = await projectService.createProject(req.body, user._id.toString());

  return sendSuccess(res, 'Project created successfully', project, 201);
});

/**
 * @route   GET /api/projects
 * @desc    Get all workspace projects (Paginated & Filtered)
 * @access  Private
 */
export const getProjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const result = await projectService.getProjects(req.query, user);

  return sendSuccess(res, 'Projects list retrieved successfully', result, 200);
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get individual project details
 * @access  Private
 */
export const getProjectById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const project = await projectService.getProjectById(id, user);

  return sendSuccess(res, 'Project details retrieved successfully', project, 200);
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project parameters
 * @access  Private (Owner/Admin/Manager only)
 */
export const updateProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const project = await projectService.updateProject(id, req.body, user);

  return sendSuccess(res, 'Project updated successfully', project, 200);
});

/**
 * @route   DELETE /api/projects/:id
 * @desc    Hard remove a project from database
 * @access  Private (Owner/Admin only)
 */
export const deleteProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  await projectService.deleteProject(id, user);

  return sendSuccess(res, 'Project deleted successfully', {}, 200);
});

/**
 * @route   PATCH /api/projects/:id/members
 * @desc    Assign or unassign teammates from project arrays
 * @access  Private (Owner/Admin/Manager only)
 */
export const manageProjectMembers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { memberId, action } = req.body;

  if (!memberId || !action || !['add', 'remove'].includes(action)) {
    res.status(400).json({
      success: false,
      message: 'Invalid parameters: "memberId" and "action" (add/remove) are required in request body.',
    });
    return;
  }

  const project = await projectService.manageMembers(id, memberId, action, user);

  const text = action === 'add' ? 'Teammate assigned successfully' : 'Teammate unassigned successfully';
  return sendSuccess(res, text, project, 200);
});
