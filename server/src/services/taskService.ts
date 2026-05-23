import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { ITask } from '../types/task.js';
import { IUser } from '../types/user.js';
import { 
  BadRequestError, 
  NotFoundError, 
  UnauthorizedError 
} from '../utils/errors.js';

/**
 * Assures a user has access to a project's tasks (Admin, Manager, or assigned Member/Owner).
 */
const checkProjectAccess = async (projectId: string, user: IUser): Promise<any> => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError('Target project was not found');
  }

  const isOwner = project.owner.toString() === user._id.toString();
  const isMember = project.members.some((m) => m.toString() === user._id.toString());
  const hasAccess = user.role === 'admin' || user.role === 'manager' || isOwner || isMember;

  if (!hasAccess) {
    throw new UnauthorizedError('Access denied. You are not a member of the target project.');
  }

  return project;
};

/**
 * Creates a new task inside a project column.
 */
export const createTask = async (
  taskData: Partial<ITask>,
  reporterId: string,
  user: IUser
): Promise<ITask> => {
  if (!taskData.project) {
    throw new BadRequestError('Project reference is required to create a task');
  }

  // 1. Enforce project access boundary
  const project = await checkProjectAccess(taskData.project.toString(), user);

  // 2. Validate Role Restriction: Only project owners, managers, or admins can create tasks
  const isOwner = project.owner.toString() === user._id.toString();
  if (user.role !== 'admin' && user.role !== 'manager' && !isOwner) {
    throw new UnauthorizedError('Access denied. Only project owners, managers, or admins can create tasks.');
  }

  // 3. Compute dynamic column index order (backlog count + 1)
  const taskCount = await Task.countDocuments({
    project: taskData.project,
    status: 'backlog',
  });

  const task = new Task({
    ...taskData,
    reporter: reporterId,
    status: 'backlog', // Safe default
    order: taskCount + 1,
    activities: [
      {
        action: 'created',
        performedBy: user._id,
        details: 'Task initialized in backlog',
      },
    ],
  });

  const savedTask = await task.save();

  // If assignee is assigned, log an additional assignment activity
  if (savedTask.assignee) {
    savedTask.activities.push({
      action: 'assigned',
      performedBy: user._id,
      details: `Task assigned directly to teammate`,
    });
    await savedTask.save();
  }

  return savedTask;
};

/**
 * Retrieves a list of tasks matching search queries, status filters, and pagination values.
 */
export const getTasks = async (
  query: any,
  user: IUser
): Promise<{ tasks: ITask[]; total: number; page: number; pages: number }> => {
  const page = parseInt(query.page as string, 10) || 1;
  const limit = parseInt(query.limit as string, 10) || 10;
  const skip = (page - 1) * limit;

  const dbQuery: any = {};

  // 1. Enforce Project Filter or global role queries
  if (query.project) {
    // If querying a specific project, check access first
    await checkProjectAccess(query.project, user);
    dbQuery.project = query.project;
  } else {
    // If querying globally, members can only see tasks within projects they are assigned to
    if (user.role === 'member') {
      const assignedProjects = await Project.find({
        $or: [{ owner: user._id }, { members: user._id }],
      }).select('_id');
      const projectIds = assignedProjects.map((p) => p._id);
      dbQuery.project = { $in: projectIds };
    }
  }

  // 2. Client Filters
  if (query.assignee) {
    dbQuery.assignee = query.assignee;
  }
  if (query.status) {
    dbQuery.status = query.status;
  }
  if (query.priority) {
    dbQuery.priority = query.priority;
  }
  if (query.label) {
    dbQuery.labels = query.label;
  }
  if (query.search) {
    dbQuery.title = { $regex: query.search, $options: 'i' };
  }
  
  if (query.archived !== undefined) {
    dbQuery.isArchived = query.archived === 'true';
  } else {
    dbQuery.isArchived = false;
  }

  // 3. Sorting configuration
  let sortQuery: any = { order: 1, createdAt: -1 }; // Order priority by default
  if (query.sort) {
    if (query.sort === 'oldest') {
      sortQuery = { createdAt: 1 };
    } else if (query.sort === 'newest') {
      sortQuery = { createdAt: -1 };
    } else if (query.sort === 'dueDate') {
      sortQuery = { dueDate: 1 };
    }
  }

  // 4. Parallel Query Execution
  const [tasks, total] = await Promise.all([
    Task.find(dbQuery)
      .populate('project', 'name slug')
      .populate('assignee', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit),
    Task.countDocuments(dbQuery),
  ]);

  return {
    tasks,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

/**
 * Retrieves a single task and verifies project membership.
 */
export const getTaskById = async (id: string, user: IUser): Promise<ITask> => {
  const task = await Task.findById(id)
    .populate('project', 'name slug owner members')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .populate('comments.author', 'name email avatar');

  if (!task) {
    throw new NotFoundError('Task was not found');
  }

  // Verify that member has access to this parent project
  await checkProjectAccess(task.project._id.toString(), user);

  return task;
};

/**
 * Updates task variables with role based security restrictions.
 */
export const updateTask = async (
  id: string,
  updateData: Partial<ITask>,
  user: IUser
): Promise<ITask> => {
  const task = await Task.findById(id).populate('project', 'owner');
  if (!task) {
    throw new NotFoundError('Task was not found');
  }

  const projectOwner = (task.project as any).owner.toString();
  const isProjectOwner = projectOwner === user._id.toString();
  const isReporter = task.reporter.toString() === user._id.toString();
  const isAssignee = task.assignee?.toString() === user._id.toString();

  // 1. Role Restrictions:
  // - Admin and managers can update any task
  // - Project owners can update any task in their project
  // - Reporters can update tasks they created
  // - Members can ONLY update progress (status, actualHours) IF they are the assignee
  const canUpdateAll = user.role === 'admin' || user.role === 'manager' || isProjectOwner || isReporter;
  const canOnlyUpdateAssigned = isAssignee && user.role === 'member';

  if (!canUpdateAll && !canOnlyUpdateAssigned) {
    throw new UnauthorizedError('Access denied. You do not have permission to modify this task.');
  }

  // 2. Limit fields based on authorization levels
  const editableFields: Array<keyof ITask> = canUpdateAll
    ? ['title', 'description', 'assignee', 'priority', 'labels', 'dueDate', 'estimatedHours', 'actualHours', 'isArchived']
    : ['actualHours']; // Members can only modify work hours or status (status changed via /move route!)

  let isAssigneeChanged = false;
  let oldAssignee = task.assignee?.toString();

  editableFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      if (field === 'assignee' && updateData[field]?.toString() !== oldAssignee) {
        isAssigneeChanged = true;
      }
      (task as any)[field] = updateData[field];
    }
  });

  // Track updates in activity logs
  task.activities.push({
    action: 'updated',
    performedBy: user._id,
    details: 'Task details updated',
  });

  if (isAssigneeChanged) {
    task.activities.push({
      action: 'assigned',
      performedBy: user._id,
      details: task.assignee 
        ? 'Task reassigned to teammate'
        : 'Task unassigned',
    });
  }

  return await task.save();
};

/**
 * Handles task deletions.
 */
export const deleteTask = async (id: string, user: IUser): Promise<void> => {
  const task = await Task.findById(id).populate('project', 'owner');
  if (!task) {
    throw new NotFoundError('Task was not found');
  }

  const projectOwner = (task.project as any).owner.toString();
  const isProjectOwner = projectOwner === user._id.toString();
  const isReporter = task.reporter.toString() === user._id.toString();

  // Deletion restriction: Only Admin, Project Owner, or the original Reporter can delete tasks
  const canDelete = user.role === 'admin' || isProjectOwner || isReporter;
  if (!canDelete) {
    throw new UnauthorizedError('Access denied. Only project owners, task reporters, or admins can delete this task.');
  }

  await Task.findByIdAndDelete(id);
};
