import { Task } from '../../models/Task.js';
import { Project } from '../../models/Project.js';
import { ITask } from '../../types/task.js';
import { IUser } from '../../types/user.js';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../../utils/errors.js';
import type { PaginatedTasks, TaskStats } from './task.types.js';

/**
 * Helper to check project membership permissions.
 */
const checkProjectAccess = async (projectId: string, user: IUser): Promise<void> => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project workspace not found');
  }

  if (user.role === 'admin') return;

  const ownerId = project.owner.toString();
  const memberIds = project.members.map((m) => m.toString());

  if (ownerId !== user._id.toString() && !memberIds.includes(user._id.toString())) {
    throw new UnauthorizedError('Access denied. You are not a member of this project workspace.');
  }
};

/**
 * Helper to verify edit/delete permissions for tasks.
 * Reporter, Project Owner, or Admin only.
 */
const canModifyTaskDetails = async (task: ITask, user: IUser): Promise<boolean> => {
  if (user.role === 'admin') return true;
  if (task.reporter.toString() === user._id.toString()) return true;

  const project = await Project.findById(task.project);
  if (project && project.owner.toString() === user._id.toString()) {
    return true;
  }

  return false;
};

/**
 * 1. Create a task workspace item.
 */
export const createTask = async (payload: any, user: IUser): Promise<ITask> => {
  await checkProjectAccess(payload.projectId, user);

  // Position rank calculate (put at bottom of target status list)
  const currentCount = await Task.countDocuments({
    project: payload.projectId,
    status: payload.status || 'backlog',
  });

  const task = new Task({
    ...payload,
    project: payload.projectId,
    reporter: user._id,
    position: currentCount,
    activities: [
      {
        action: 'created',
        performedBy: user._id,
        details: `Created task "${payload.title}"`,
      },
    ],
  });

  const saved = await task.save();
  return (await saved.populate('assignee', 'name email avatar')).populate('reporter', 'name email avatar');
};

/**
 * 2. Filter, search, paginate, and sort tasks.
 */
export const getTasks = async (query: any, user: IUser): Promise<PaginatedTasks> => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const dbQuery: any = {};

  // Filters
  if (query.projectId) {
    dbQuery.project = query.projectId;
  }
  if (query.sprintId) {
    dbQuery.sprintId = query.sprintId;
  }
  if (query.status) {
    dbQuery.status = query.status;
  }
  if (query.priority) {
    dbQuery.priority = query.priority;
  }
  if (query.assignee) {
    dbQuery.assignee = query.assignee;
  }

  // Archived filter (compatibly support isArchived or archived)
  if (query.archived !== undefined) {
    dbQuery.isArchived = query.archived === 'true';
  } else {
    dbQuery.isArchived = false;
  }

  // Debounced Search text match (title, description, labels)
  if (query.q) {
    const searchRegex = new RegExp(query.q, 'i');
    dbQuery.$and = dbQuery.$and || [];
    dbQuery.$and.push({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { labels: { $in: [searchRegex] } },
      ],
    });
  }

  // Security gate: members can only see tasks of projects they belong to
  if (user.role === 'member') {
    const userProjects = await Project.find({
      $or: [{ owner: user._id }, { members: user._id }],
    }).select('_id');
    const projectIds = userProjects.map((p) => p._id);
    dbQuery.project = { $in: projectIds };

    if (query.projectId && !projectIds.some((p) => p.toString() === query.projectId)) {
      throw new UnauthorizedError('Access denied to query tasks in this workspace');
    }
  }

  // Sorting
  const sortOption: any = {};
  if (query.sortBy) {
    const sortField = query.sortBy;
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
    sortOption[sortField] = sortOrder;
  } else {
    sortOption.position = 1; // Default Kanban positioning rank
    sortOption.createdAt = -1;
  }

  const [tasks, total] = await Promise.all([
    Task.find(dbQuery)
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name key')
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Task.countDocuments(dbQuery),
  ]);

  return {
    data: tasks,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * 3. Retrieve single task.
 */
export const getTaskById = async (id: string, user: IUser): Promise<ITask> => {
  const task = await Task.findById(id)
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .populate('project', 'name key members owner')
    .populate('comments.author', 'name email avatar');

  if (!task) {
    throw new NotFoundError('Task item not found');
  }

  await checkProjectAccess(task.project.toString(), user);
  return task;
};

/**
 * 4. Update task details (Scope guard rules applied).
 */
export const updateTask = async (id: string, updateData: any, user: IUser): Promise<ITask> => {
  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError('Task item not found');
  }

  await checkProjectAccess(task.project.toString(), user);

  const fullAccess = await canModifyTaskDetails(task, user);
  const isAssignee = task.assignee && task.assignee.toString() === user._id.toString();

  if (!fullAccess && !isAssignee) {
    throw new UnauthorizedError('Access denied. You do not have permissions to modify this task.');
  }

  // Scoped authorization checks
  let editableFields = [];
  if (fullAccess) {
    // Owner / Reporter can edit everything
    editableFields = [
      'title',
      'description',
      'assignee',
      'sprintId',
      'priority',
      'status',
      'dueDate',
      'labels',
      'estimatedHours',
      'spentHours',
      'storyPoints',
      'archived',
      'subtasks',
    ];
  } else {
    // Assigned member can only update progress (status, spentHours, subtasks)
    editableFields = ['status', 'spentHours', 'subtasks'];
  }

  const activities: any[] = [];

  editableFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      const oldVal = (task as any)[field];
      const newVal = updateData[field];

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        (task as any)[field] = newVal;

        if (field === 'status') {
          activities.push({
            action: 'moved',
            performedBy: user._id,
            details: `Moved task from "${oldVal}" to "${newVal}"`,
          });
        } else if (field === 'assignee') {
          activities.push({
            action: 'assigned',
            performedBy: user._id,
            details: `Assigned task to teammate`,
          });
        } else {
          activities.push({
            action: 'updated',
            performedBy: user._id,
            details: `Updated task ${field}`,
          });
        }
      }
    }
  });

  if (activities.length > 0) {
    task.activities.push(...activities);
  }

  const updated = await task.save();
  return (await updated.populate('assignee', 'name email avatar')).populate('reporter', 'name email avatar');
};

/**
 * 5. Delete task (Reporter / Owner / Admin only).
 */
export const deleteTask = async (id: string, user: IUser): Promise<void> => {
  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError('Task item not found');
  }

  const fullAccess = await canModifyTaskDetails(task, user);
  if (!fullAccess) {
    throw new UnauthorizedError('Access denied. Only the task reporter or project owner can delete this task.');
  }

  await Task.findByIdAndDelete(id);
};

/**
 * 6. Task actions: Quick status transition.
 */
export const updateTaskStatus = async (id: string, newStatus: string, user: IUser): Promise<ITask> => {
  return await updateTask(id, { status: newStatus }, user);
};

/**
 * 7. Drag & Drop Reorder positioning logic.
 */
export const reorderTasks = async (
  id: string,
  targetStatus: string,
  targetPosition: number,
  user: IUser
): Promise<ITask> => {
  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError('Task item not found');
  }

  await checkProjectAccess(task.project.toString(), user);

  const fullAccess = await canModifyTaskDetails(task, user);
  const isAssignee = task.assignee && task.assignee.toString() === user._id.toString();

  if (!fullAccess && !isAssignee) {
    throw new UnauthorizedError('Access denied. You do not have permissions to reorder this task.');
  }

  const sourceStatus = task.status;
  const sourcePosition = task.position;
  const projectId = task.project;

  if (sourceStatus === targetStatus) {
    // Reordering inside the same status column
    if (sourcePosition === targetPosition) return task;

    if (sourcePosition < targetPosition) {
      // Shifting down
      await Task.updateMany(
        { project: projectId, status: sourceStatus, position: { $gt: sourcePosition, $lte: targetPosition } },
        { $inc: { position: -1 } }
      );
    } else {
      // Shifting up
      await Task.updateMany(
        { project: projectId, status: sourceStatus, position: { $gte: targetPosition, $lt: sourcePosition } },
        { $inc: { position: 1 } }
      );
    }
    task.position = targetPosition;
  } else {
    // Moving between status columns
    // 1. Shift positions down in source column
    await Task.updateMany(
      { project: projectId, status: sourceStatus, position: { $gt: sourcePosition } },
      { $inc: { position: -1 } }
    );

    // 2. Open rank position slot in target column
    await Task.updateMany(
      { project: projectId, status: targetStatus, position: { $gte: targetPosition } },
      { $inc: { position: 1 } }
    );

    task.status = targetStatus as any;
    task.position = targetPosition;

    task.activities.push({
      action: 'moved',
      performedBy: user._id,
      details: `Moved task drag reordered to "${targetStatus}" at rank ${targetPosition}`,
    });
  }

  const saved = await task.save();
  return (await saved.populate('assignee', 'name email avatar')).populate('reporter', 'name email avatar');
};

/**
 * 8. Add a comment.
 */
export const addComment = async (id: string, text: string, user: IUser): Promise<ITask> => {
  const task = await Task.findById(id);
  if (!task) {
    throw new NotFoundError('Task item not found');
  }

  await checkProjectAccess(task.project.toString(), user);

  task.comments.push({
    author: user._id as any,
    text,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);

  task.activities.push({
    action: 'commented',
    performedBy: user._id,
    details: `Added comment to discussion thread`,
  });

  const saved = await task.save();
  return (await saved.populate('comments.author', 'name email avatar')).populate('assignee', 'name email avatar');
};

/**
 * 9. Checklist toggle subtask.
 */
export const toggleSubtask = async (
  taskId: string,
  subtaskId: string,
  completed: boolean,
  user: IUser
): Promise<ITask> => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError('Task item not found');
  }

  await checkProjectAccess(task.project.toString(), user);

  const subtask = task.subtasks.find((s: any) => s._id.toString() === subtaskId);
  if (!subtask) {
    throw new NotFoundError('Subtask not found');
  }

  subtask.completed = completed;

  task.activities.push({
    action: 'updated',
    performedBy: user._id,
    details: `Marked subtask "${subtask.title}" as ${completed ? 'complete' : 'incomplete'}`,
  });

  const saved = await task.save();
  return (await saved.populate('assignee', 'name email avatar')).populate('reporter', 'name email avatar');
};

/**
 * 10. Fetch aggregated task statistics.
 */
export const getTaskStats = async (projectId: string, user: IUser): Promise<TaskStats> => {
  await checkProjectAccess(projectId, user);

  const now = new Date();

  const [
    total,
    overdue,
    completed,
    inProgress,
    blocked,
  ] = await Promise.all([
    Task.countDocuments({ project: projectId, isArchived: false }),
    Task.countDocuments({
      project: projectId,
      dueDate: { $lt: now },
      status: { $ne: 'done' },
      isArchived: false,
    }),
    Task.countDocuments({ project: projectId, status: 'done', isArchived: false }),
    Task.countDocuments({ project: projectId, status: 'in-progress', isArchived: false }),
    Task.countDocuments({
      project: projectId,
      status: 'in-progress',
      priority: 'critical',
      isArchived: false,
    }),
  ]);

  return {
    total,
    overdue,
    completed,
    inProgress,
    blocked,
  };
};
