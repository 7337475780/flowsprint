import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';
import { Workspace } from '../models/Workspace.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { UnauthorizedError, NotFoundError, BadRequestError } from '../utils/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export interface SecurityRequest extends AuthenticatedRequest {
  workspaceId?: string;
  project?: any;
  task?: any;
}

// Global Permission Matrix
export type Role = 'admin' | 'manager' | 'member';

export type Permission =
  | 'create:workspace'
  | 'manage:workspace'
  | 'create:project'
  | 'delete:project'
  | 'create:task'
  | 'delete:task'
  | 'manage:sprint'
  | 'upload:files';

const permissionMatrix: Record<Role, Permission[]> = {
  admin: [
    'create:workspace',
    'manage:workspace',
    'create:project',
    'delete:project',
    'create:task',
    'delete:task',
    'manage:sprint',
    'upload:files',
  ],
  manager: [
    'manage:workspace',
    'create:project',
    'delete:project', // Restricts deletion of other projects at resource layer
    'create:task',
    'delete:task',
    'manage:sprint',
    'upload:files',
  ],
  member: [
    'create:task',
    'upload:files',
  ],
};

/**
 * Middleware ensuring a user possesses a specific role.
 */
export const requireRole = (allowedRoles: string | string[]) => {
  return (req: SecurityRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Not authorized, session credentials missing');
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError(`Access denied. Allowed roles: ${roles.join(', ')}`);
    }

    next();
  };
};

/**
 * Middleware ensuring a user possesses a specific permission according to the permission matrix.
 */
export const requirePermission = (permission: Permission) => {
  return (req: SecurityRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Not authorized, session credentials missing');
    }

    const role = req.user.role || 'member';
    const permissions = permissionMatrix[role as Role] || [];

    if (!permissions.includes(permission)) {
      throw new UnauthorizedError(`Access denied. You do not have permission to perform this action.`);
    }

    next();
  };
};

/**
 * Middleware validating active user membership inside a Workspace tenant.
 * Hydrates `req.workspaceId` for subsequent queries.
 */
export const requireWorkspaceAccess = asyncHandler(async (req: SecurityRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('Not authorized, session credentials missing');
  }

  // 1. Resolve workspaceId from request context or user preferences
  const workspaceId =
    req.headers['x-workspace-id'] ||
    req.params.workspaceId ||
    req.query.workspaceId ||
    req.body.workspaceId ||
    req.user.currentWorkspace?.toString();

  if (!workspaceId) {
    throw new BadRequestError('Workspace ID context is required');
  }

  // 2. Fetch workspace
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundError('Workspace was not found');
  }

  // 3. Admin bypass, or membership validation checks
  const isOwner = workspace.owner.toString() === req.user._id.toString();
  const isMember = workspace.members.some((m) => m.toString() === req.user!._id.toString());

  if (req.user.role !== 'admin' && !isOwner && !isMember) {
    throw new UnauthorizedError('Access denied. You do not belong to this workspace.');
  }

  req.workspaceId = workspace._id.toString();
  next();
});

/**
 * Middleware validating user has member/owner access to a Project workspace.
 * Hydrates `req.project` for downstream controller logic.
 */
export const requireProjectAccess = asyncHandler(async (req: SecurityRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('Not authorized, session credentials missing');
  }

  const projectId = req.params.projectId || req.params.id || req.body.projectId || req.query.projectId || req.body.project;
  if (!projectId) {
    throw new BadRequestError('Project ID context is required');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project workspace not found');
  }

  // Ensure project belongs to the user's active workspace
  const activeWorkspaceId = req.workspaceId || req.user.currentWorkspace?.toString();
  if (project.workspaceId && project.workspaceId.toString() !== activeWorkspaceId) {
    throw new UnauthorizedError('Access denied. Project is not unlinked to active workspace context.');
  }

  // Admin bypass
  if (req.user.role === 'admin') {
    req.project = project;
    return next();
  }

  const isOwner = project.owner.toString() === req.user._id.toString();
  const isMember = project.members.some((m) => m.toString() === req.user!._id.toString());

  if (!isOwner && !isMember) {
    throw new UnauthorizedError('Access denied. You are not a member of this project workspace.');
  }

  req.project = project;
  next();
});

/**
 * Middleware validating user has member/owner access to a Task project workspace.
 * Hydrates `req.task` for downstream logic.
 */
export const requireTaskAccess = asyncHandler(async (req: SecurityRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('Not authorized, session credentials missing');
  }

  const taskId = req.params.taskId || req.params.id || req.body.taskId || req.query.taskId;
  if (!taskId) {
    throw new BadRequestError('Task ID context is required');
  }

  const task = await Task.findById(taskId).populate('project');
  if (!task) {
    throw new NotFoundError('Task not found');
  }

  const project = task.project as any;
  if (!project) {
    throw new NotFoundError('Associated project workspace not found');
  }

  // Validate task project belongs to the user's active workspace
  const activeWorkspaceId = req.workspaceId || req.user.currentWorkspace?.toString();
  if (project.workspaceId && project.workspaceId.toString() !== activeWorkspaceId) {
    throw new UnauthorizedError('Access denied. Task project is unlinked to active workspace context.');
  }

  // Admin bypass
  if (req.user.role === 'admin') {
    req.task = task;
    return next();
  }

  const isOwner = project.owner.toString() === req.user._id.toString();
  const isMember = project.members.some((m: any) => m.toString() === req.user!._id.toString());

  if (!isOwner && !isMember) {
    throw new UnauthorizedError('Access denied. You do not have access to the task project.');
  }

  req.task = task;
  next();
});
