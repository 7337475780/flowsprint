import { Project } from '../../models/Project.js';
import { IProject } from '../../types/project.js';
import { IUser } from '../../types/user.js';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../../utils/errors.js';
import type { PaginatedProjects, ProjectStats } from './project.types.js';
import { logEvent } from '../audit/audit.service.js';
import { Workspace } from '../workspaces/workspace.model.js';

/**
 * Establish a new project workspace.
 */
export const createProject = async (data: any, ownerId: string, workspaceId: string): Promise<IProject> => {
  const existingKey = await Project.findOne({ key: data.key.toUpperCase() });
  if (existingKey) {
    throw new BadRequestError(`Project key "${data.key}" already exists in workspace.`);
  }

  const project = new Project({
    ...data,
    owner: ownerId,
    workspaceId: workspaceId || undefined,
  });

  const saved = await project.save();

  // Log auditing trail
  await logEvent(ownerId, 'PROJECT_CREATED', 'Project', saved._id.toString(), {
    name: saved.name,
    key: saved.key,
  });

  return saved;
};

/**
 * Filter, search, and paginate projects based on roles and options.
 */
export const getProjects = async (query: any, user: IUser): Promise<PaginatedProjects> => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const dbQuery: any = {};

  // Enforce Workspace Isolation
  const activeWorkspaceId = query.workspaceId || user.currentWorkspace?.toString();
  if (activeWorkspaceId) {
    dbQuery.workspaceId = activeWorkspaceId;
  }

  // 1. Role-based Project Security Scope
  if (user.role === 'member') {
    dbQuery.$or = [{ owner: user._id }, { members: user._id }];
  }

  // 2. Column filters
  if (query.status) {
    dbQuery.status = query.status;
  }
  if (query.priority) {
    dbQuery.priority = query.priority;
  }
  if (query.owner) {
    dbQuery.owner = query.owner;
  }
  if (query.archived !== undefined) {
    dbQuery.isArchived = query.archived === 'true';
  } else {
    dbQuery.isArchived = false;
  }

  // 3. Debounced Search text q (matches name, key, tags)
  if (query.q) {
    const searchRegex = new RegExp(query.q, 'i');
    dbQuery.$and = dbQuery.$and || [];
    dbQuery.$and.push({
      $or: [
        { name: searchRegex },
        { key: searchRegex },
        { tags: { $in: [searchRegex] } },
      ],
    });
  }

  const [projects, total] = await Promise.all([
    Project.find(dbQuery)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(dbQuery),
  ]);

  return {
    data: projects as any as IProject[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Fetch a single project (Member security scope checked).
 */
export const getProjectById = async (id: string, user: IUser): Promise<IProject> => {
  const project = await Project.findById(id)
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar');

  if (!project) {
    throw new NotFoundError('Project workspace was not found');
  }

  // Enforce Workspace Isolation
  const activeWorkspaceId = user.currentWorkspace?.toString();
  if (project.workspaceId && project.workspaceId.toString() !== activeWorkspaceId) {
    throw new UnauthorizedError('Access denied. Project does not belong to your active workspace context.');
  }

  const ownerId = (project.owner as any)._id?.toString() || project.owner.toString();
  const memberIds = project.members.map((m: any) => m._id?.toString() || m.toString());

  if (
    user.role === 'member' &&
    ownerId !== user._id.toString() &&
    !memberIds.includes(user._id.toString())
  ) {
    throw new UnauthorizedError('Access denied. You are not assigned to this project workspace.');
  }

  return project;
};

/**
 * Update project details (Owner or administrator only).
 */
export const updateProject = async (id: string, updateData: any, user: IUser): Promise<IProject> => {
  const project = await Project.findById(id);
  if (!project) {
    throw new NotFoundError('Project workspace was not found');
  }

  // Enforce Workspace Isolation
  const activeWorkspaceId = user.currentWorkspace?.toString();
  if (project.workspaceId && project.workspaceId.toString() !== activeWorkspaceId) {
    throw new UnauthorizedError('Access denied. Project does not belong to your active workspace context.');
  }

  const ownerId = project.owner.toString();
  const canModify = user.role === 'admin' || ownerId === user._id.toString();
  if (!canModify) {
    throw new UnauthorizedError('Access denied. Only the project owner or admins can modify this workspace.');
  }

  // Key collision check
  if (updateData.key && updateData.key.toUpperCase() !== project.key) {
    const existingKey = await Project.findOne({ key: updateData.key.toUpperCase() });
    if (existingKey) {
      throw new BadRequestError(`Project key "${updateData.key}" already exists.`);
    }
  }

  const editableFields = [
    'name',
    'key',
    'description',
    'status',
    'priority',
    'startDate',
    'dueDate',
    'progress',
    'tags',
    'isArchived',
    'members',
  ];

  editableFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      (project as any)[field] = updateData[field];
    }
  });

  const updated = await project.save();

  // Log auditing trail
  await logEvent(user._id.toString(), 'PROJECT_UPDATED', 'Project', updated._id.toString(), {
    name: updated.name,
  });

  return (await updated.populate('owner', 'name email avatar')).populate('members', 'name email avatar');
};

/**
 * Delete a project workspace (Owner or administrator only).
 */
export const deleteProject = async (id: string, user: IUser): Promise<void> => {
  const project = await Project.findById(id);
  if (!project) {
    throw new NotFoundError('Project workspace was not found');
  }

  // Enforce Workspace Isolation
  const activeWorkspaceId = user.currentWorkspace?.toString();
  if (project.workspaceId && project.workspaceId.toString() !== activeWorkspaceId) {
    throw new UnauthorizedError('Access denied. Project does not belong to your active workspace context.');
  }

  const ownerId = project.owner.toString();
  const canDelete = user.role === 'admin' || ownerId === user._id.toString();
  if (!canDelete) {
    throw new UnauthorizedError('Access denied. Only the project owner or admins can delete this workspace.');
  }

  // Log auditing trail
  await logEvent(user._id.toString(), 'PROJECT_DELETED', 'Project', project._id.toString(), {
    name: project.name,
  });

  await Project.findByIdAndDelete(id);
};

/**
 * Retrieve aggregated status totals for workspace statistics widgets.
 */
export const getProjectStats = async (user: IUser): Promise<ProjectStats> => {
  const dbQuery: any = {};
  if (user.role === 'member') {
    dbQuery.$or = [{ owner: user._id }, { members: user._id }];
  }

  const now = new Date();

  const [
    total,
    active,
    completed,
    onHold,
    archived,
    overdue,
  ] = await Promise.all([
    Project.countDocuments({ ...dbQuery, isArchived: false }),
    Project.countDocuments({ ...dbQuery, status: 'active', isArchived: false }),
    Project.countDocuments({ ...dbQuery, status: 'completed', isArchived: false }),
    Project.countDocuments({ ...dbQuery, status: 'on-hold', isArchived: false }),
    Project.countDocuments({ ...dbQuery, isArchived: true }),
    Project.countDocuments({
      ...dbQuery,
      dueDate: { $lt: now },
      status: { $nin: ['completed', 'cancelled'] },
      isArchived: false,
    }),
  ]);

  return {
    total,
    active,
    completed,
    onHold,
    overdue,
    archived,
  };
};
