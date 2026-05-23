import { Sprint } from '../models/Sprint.js';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { ISprint } from '../types/sprint.js';
import { IUser } from '../types/user.js';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors.js';

// ---------------------------------------------------------------------------
// Private helper: verify a user can access a sprint's parent project
// ---------------------------------------------------------------------------
const checkSprintProjectAccess = async (projectId: string, user: IUser) => {
  const project = await Project.findById(projectId);
  if (!project) throw new NotFoundError('Target project was not found');

  const isOwner   = project.owner.toString() === user._id.toString();
  const isMember  = project.members.some((m) => m.toString() === user._id.toString());
  const hasAccess = user.role === 'admin' || user.role === 'manager' || isOwner || isMember;

  if (!hasAccess)
    throw new UnauthorizedError('Access denied. You are not a member of the target project.');

  return project;
};

// ---------------------------------------------------------------------------
// Private helper: recompute live progress metrics from sprint tasks
// ---------------------------------------------------------------------------
const computeProgress = async (taskIds: any[]) => {
  if (!taskIds || taskIds.length === 0)
    return { total: 0, completed: 0, inProgress: 0, pending: 0, plannedPoints: 0, completedPoints: 0, progress: 0 };

  const tasks = await Task.find({ _id: { $in: taskIds } });

  const total           = tasks.length;
  const completed       = tasks.filter((t) => t.status === 'done').length;
  const inProgress      = tasks.filter((t) => t.status === 'in-progress' || t.status === 'review').length;
  const pending         = tasks.filter((t) => t.status === 'backlog' || t.status === 'todo').length;
  const plannedPoints   = tasks.reduce((sum, t) => sum + ((t as any).storyPoints || 0), 0);
  const completedPoints = tasks.filter((t) => t.status === 'done').reduce((sum, t) => sum + ((t as any).storyPoints || 0), 0);
  const progress        = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, inProgress, pending, plannedPoints, completedPoints, progress };
};

// ===========================================================================
// CRUD
// ===========================================================================

/**
 * Creates a new sprint in planned state.
 */
export const createSprint = async (data: any, user: IUser): Promise<ISprint> => {
  await checkSprintProjectAccess(data.project, user);

  if (user.role === 'member') {
    const project = await Project.findById(data.project);
    const isOwner = project!.owner.toString() === user._id.toString();
    if (!isOwner)
      throw new UnauthorizedError('Only project owners, managers, and admins can create sprints.');
  }

  const metrics = await computeProgress(data.tasks || []);

  const sprint = new Sprint({
    ...data,
    owner:         user._id,
    status:        'planned',
    plannedPoints: metrics.plannedPoints,
    progress:      0,
  });

  return await sprint.save();
};

/**
 * Retrieves paginated and filtered sprints.
 */
export const getSprints = async (
  query: any,
  user: IUser
): Promise<{ sprints: ISprint[]; total: number; page: number; pages: number }> => {
  const page  = parseInt(query.page, 10)  || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip  = (page - 1) * limit;

  const dbQuery: any = {};

  // Role-based scope: members see only their project sprints
  if (user.role === 'member') {
    const ownedProjects  = await Project.find({ owner: user._id }).select('_id');
    const memberProjects = await Project.find({ members: user._id }).select('_id');
    const projectIds = [
      ...ownedProjects.map((p) => p._id),
      ...memberProjects.map((p) => p._id),
    ];
    dbQuery.project = { $in: projectIds };
  }

  if (query.project)  dbQuery.project  = query.project;
  if (query.status)   dbQuery.status   = query.status;
  if (query.owner)    dbQuery.owner    = query.owner;
  if (query.archived !== undefined) dbQuery.isArchived = query.archived === 'true';

  // Default: exclude archived unless explicitly requested
  if (query.archived === undefined) dbQuery.isArchived = false;

  // Sort control
  let sort: any = { createdAt: -1 };
  if (query.sort === 'oldest')  sort = { createdAt: 1 };
  if (query.sort === 'endDate') sort = { endDate: 1 };

  const [sprints, total] = await Promise.all([
    Sprint.find(dbQuery)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('project', 'name key')
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar'),
    Sprint.countDocuments(dbQuery),
  ]);

  return { sprints, total, page, pages: Math.ceil(total / limit) };
};

/**
 * Retrieves a single sprint with full population and live progress stats.
 */
export const getSprintById = async (id: string, user: IUser): Promise<ISprint & { stats: any }> => {
  const sprint = await Sprint.findById(id)
    .populate('project', 'name key slug owner members')
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar')
    .populate({
      path:   'tasks',
      select: 'title status priority storyPoints dueDate assignee',
      populate: { path: 'assignee', select: 'name avatar' },
    });

  if (!sprint) throw new NotFoundError('Sprint was not found');

  await checkSprintProjectAccess((sprint.project as any)._id.toString(), user);

  const stats = await computeProgress(sprint.tasks);
  return Object.assign(sprint.toObject(), { stats }) as any;
};

/**
 * Updates sprint fields and recalculates planned points if task list changes.
 */
export const updateSprint = async (id: string, data: any, user: IUser): Promise<ISprint> => {
  const sprint = await Sprint.findById(id);
  if (!sprint) throw new NotFoundError('Sprint was not found');

  await checkSprintProjectAccess(sprint.project.toString(), user);

  // Only admins, managers, and project owner can update
  const isOwner   = sprint.owner.toString() === user._id.toString();
  const canModify = user.role === 'admin' || user.role === 'manager' || isOwner;
  if (!canModify) throw new UnauthorizedError('Access denied. You cannot modify this sprint.');

  const allowed = ['name', 'goal', 'startDate', 'endDate', 'members', 'retrospective', 'isArchived', 'tasks'];
  for (const key of allowed) {
    if (data[key] !== undefined) (sprint as any)[key] = data[key];
  }

  // Recalculate planned points if tasks were updated
  if (data.tasks !== undefined) {
    const metrics = await computeProgress(sprint.tasks);
    sprint.plannedPoints = metrics.plannedPoints;
    sprint.progress      = metrics.progress;
  }

  return await sprint.save();
};

/**
 * Deletes a sprint. Only admins and sprint owners may delete.
 */
export const deleteSprint = async (id: string, user: IUser): Promise<void> => {
  const sprint = await Sprint.findById(id);
  if (!sprint) throw new NotFoundError('Sprint was not found');

  const isOwner = sprint.owner.toString() === user._id.toString();
  if (user.role !== 'admin' && !isOwner)
    throw new UnauthorizedError('Access denied. Only the sprint owner or an admin may delete this sprint.');

  await Sprint.deleteOne({ _id: id });
};

// ===========================================================================
// LIFECYCLE
// ===========================================================================

/**
 * Transitions a planned sprint to active.
 */
export const startSprint = async (id: string, user: IUser): Promise<ISprint> => {
  const sprint = await Sprint.findById(id);
  if (!sprint) throw new NotFoundError('Sprint was not found');

  await checkSprintProjectAccess(sprint.project.toString(), user);

  if (sprint.status !== 'planned')
    throw new BadRequestError(`Cannot start a sprint that is already "${sprint.status}".`);

  if (!sprint.startDate || !sprint.endDate)
    throw new BadRequestError('Sprint must have both a startDate and endDate before it can be started.');

  if (sprint.endDate <= new Date())
    throw new BadRequestError('Sprint endDate must be a future date.');

  const metrics = await computeProgress(sprint.tasks);
  sprint.status        = 'active';
  sprint.plannedPoints = metrics.plannedPoints;
  sprint.progress      = metrics.progress;

  return await sprint.save();
};

/**
 * Closes an active sprint and calculates final velocity.
 */
export const endSprint = async (id: string, retrospective: string | undefined, user: IUser): Promise<ISprint> => {
  const sprint = await Sprint.findById(id);
  if (!sprint) throw new NotFoundError('Sprint was not found');

  await checkSprintProjectAccess(sprint.project.toString(), user);

  if (sprint.status !== 'active')
    throw new BadRequestError(`Cannot end a sprint that is "${sprint.status}".`);

  const metrics = await computeProgress(sprint.tasks);

  sprint.status          = 'completed';
  sprint.progress        = metrics.progress;
  sprint.completedPoints = metrics.completedPoints;
  // velocity = ratio of story points delivered vs planned (capped to 1 for over-delivery)
  sprint.velocity = sprint.plannedPoints > 0
    ? parseFloat((metrics.completedPoints / sprint.plannedPoints).toFixed(4))
    : 0;

  if (retrospective) sprint.retrospective = retrospective;

  return await sprint.save();
};

/**
 * Cancels a sprint regardless of its current state.
 */
export const cancelSprint = async (id: string, user: IUser): Promise<ISprint> => {
  const sprint = await Sprint.findById(id);
  if (!sprint) throw new NotFoundError('Sprint was not found');

  await checkSprintProjectAccess(sprint.project.toString(), user);

  if (sprint.status === 'completed' || sprint.status === 'cancelled')
    throw new BadRequestError(`Sprint is already "${sprint.status}" and cannot be cancelled.`);

  const isOwner   = sprint.owner.toString() === user._id.toString();
  const canCancel = user.role === 'admin' || user.role === 'manager' || isOwner;
  if (!canCancel) throw new UnauthorizedError('Access denied. Only the sprint owner, manager, or admin may cancel this sprint.');

  sprint.status = 'cancelled';
  return await sprint.save();
};

// ===========================================================================
// TASK ASSIGNMENT
// ===========================================================================

/**
 * Adds or removes tasks from a sprint, enforcing project boundary and avoiding duplicates.
 */
export const manageSprintTasks = async (
  id: string,
  taskIds: string[],
  action: 'add' | 'remove',
  user: IUser
): Promise<ISprint> => {
  const sprint = await Sprint.findById(id);
  if (!sprint) throw new NotFoundError('Sprint was not found');

  await checkSprintProjectAccess(sprint.project.toString(), user);

  if (sprint.status === 'completed' || sprint.status === 'cancelled')
    throw new BadRequestError('Cannot modify tasks in a completed or cancelled sprint.');

  // Validate all tasks exist and belong to the same project
  const tasks = await Task.find({ _id: { $in: taskIds } });
  if (tasks.length !== taskIds.length)
    throw new BadRequestError('One or more task IDs are invalid or do not exist.');

  for (const task of tasks) {
    if (task.project.toString() !== sprint.project.toString())
      throw new BadRequestError(`Task "${task.title}" does not belong to the sprint's project.`);
  }

  if (action === 'add') {
    for (const tid of taskIds) {
      const alreadyAssigned = sprint.tasks.some((t) => t.toString() === tid);
      if (!alreadyAssigned) sprint.tasks.push(tid as any);
    }
  } else {
    sprint.tasks = sprint.tasks.filter((t) => !taskIds.includes(t.toString())) as any;
  }

  // Recalculate planned points
  const metrics = await computeProgress(sprint.tasks);
  sprint.plannedPoints = metrics.plannedPoints;
  sprint.progress      = metrics.progress;

  return await sprint.save();
};

// ===========================================================================
// BURNDOWN
// ===========================================================================

/**
 * Builds a chart-ready daily burndown dataset for the sprint.
 * Returns ideal line + actual remaining points by date.
 */
export const buildBurndown = async (id: string, user: IUser) => {
  const sprint = await Sprint.findById(id).populate({
    path:   'tasks',
    select: 'storyPoints status activities',
  });

  if (!sprint) throw new NotFoundError('Sprint was not found');

  await checkSprintProjectAccess(sprint.project.toString(), user);

  if (!sprint.startDate || !sprint.endDate)
    throw new BadRequestError('Sprint must have startDate and endDate to generate burndown data.');

  const start         = new Date(sprint.startDate);
  const end           = sprint.status === 'active' ? new Date() : new Date(sprint.endDate);
  const totalDays     = Math.max(1, Math.ceil((new Date(sprint.endDate).getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const tasks         = sprint.tasks as any[];
  const totalPoints   = tasks.reduce((s, t) => s + (t.storyPoints || 0), 0);

  // Build a map of date -> points burned on that day
  const burnedByDay: Record<string, number> = {};

  for (const task of tasks) {
    if (task.status !== 'done' || !task.activities) continue;

    // Find the 'moved' activity that set the task to done
    const doneActivity = [...task.activities]
      .reverse()
      .find((a: any) => a.action === 'moved' && a.details?.includes('[done]'));

    if (!doneActivity) continue;

    const doneDate = new Date(doneActivity.createdAt).toISOString().split('T')[0];
    burnedByDay[doneDate] = (burnedByDay[doneDate] || 0) + (task.storyPoints || 0);
  }

  // Generate day-by-day burndown data
  const data: { date: string; ideal: number; remaining: number }[] = [];
  let remaining = totalPoints;

  for (let i = 0; i <= totalDays; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);

    if (current > end) break;

    const dateStr = current.toISOString().split('T')[0];
    const burned  = burnedByDay[dateStr] || 0;
    remaining    -= burned;

    const ideal = Math.round(totalPoints - (totalPoints / totalDays) * i);

    data.push({ date: dateStr, ideal: Math.max(0, ideal), remaining: Math.max(0, remaining) });
  }

  return {
    sprintName:  sprint.name,
    totalPoints,
    startDate:   sprint.startDate,
    endDate:     sprint.endDate,
    status:      sprint.status,
    data,
  };
};

// ===========================================================================
// ANALYTICS
// ===========================================================================

/**
 * Generates in-depth analytics for a single sprint.
 */
export const getSprintAnalytics = async (id: string, user: IUser) => {
  const sprint = await Sprint.findById(id).populate({
    path:   'tasks',
    select: 'title status priority dueDate assignee storyPoints activities createdAt',
    populate: { path: 'assignee', select: 'name avatar' },
  });

  if (!sprint) throw new NotFoundError('Sprint was not found');

  await checkSprintProjectAccess(sprint.project.toString(), user);

  const tasks        = sprint.tasks as any[];
  const now          = new Date();

  const total           = tasks.length;
  const done            = tasks.filter((t) => t.status === 'done');
  const overdue         = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done');
  const completionRate  = total > 0 ? Math.round((done.length / total) * 100) : 0;

  // Team output: tasks completed per assignee
  const teamOutput: Record<string, { name: string; avatar: string; completed: number; total: number }> = {};
  for (const task of tasks) {
    if (!task.assignee) continue;
    const aid  = task.assignee._id.toString();
    if (!teamOutput[aid]) teamOutput[aid] = { name: task.assignee.name, avatar: task.assignee.avatar || '', completed: 0, total: 0 };
    teamOutput[aid].total++;
    if (task.status === 'done') teamOutput[aid].completed++;
  }

  // Average days to complete a task (from createdAt to done activity)
  const completionTimes: number[] = [];
  for (const task of done) {
    const doneActivity = [...(task.activities || [])].reverse().find((a: any) => a.action === 'moved' && a.details?.includes('[done]'));
    if (doneActivity) {
      const days = (new Date(doneActivity.createdAt).getTime() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      completionTimes.push(days);
    }
  }
  const avgCompletionDays = completionTimes.length > 0
    ? parseFloat((completionTimes.reduce((s, d) => s + d, 0) / completionTimes.length).toFixed(1))
    : 0;

  return {
    sprint:         { id: sprint._id, name: sprint.name, status: sprint.status, velocity: sprint.velocity },
    completionRate,
    total,
    completed:      done.length,
    overdue:        overdue.map((t) => ({ id: t._id, title: t.title, dueDate: t.dueDate })),
    teamOutput:     Object.values(teamOutput),
    avgCompletionDays,
    plannedPoints:  sprint.plannedPoints,
    completedPoints:sprint.completedPoints,
    velocity:       sprint.velocity,
  };
};

/**
 * Global analytics overview aggregating across all visible workspace entities.
 */
export const getGlobalOverview = async (user: IUser) => {
  const now = new Date();

  // Resolve accessible project IDs for non-admins
  let projectFilter: any = {};
  if (user.role === 'member') {
    const owned  = await Project.find({ owner: user._id }).select('_id');
    const member = await Project.find({ members: user._id }).select('_id');
    const ids    = [...owned.map((p) => p._id), ...member.map((p) => p._id)];
    projectFilter = { _id: { $in: ids } };
  }

  const [
    activeProjects,
    activeSprints,
    completedTasks,
    overdueTasks,
    taskDistribution,
    velocitySummary,
  ] = await Promise.all([
    Project.countDocuments({ ...projectFilter, status: 'active', isArchived: false }),
    Sprint.countDocuments({ status: 'active', isArchived: false }),
    Task.countDocuments({ status: 'done' }),
    Task.countDocuments({ dueDate: { $lt: now }, status: { $ne: 'done' } }),
    Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Sprint.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, avgVelocity: { $avg: '$velocity' }, count: { $sum: 1 } } },
    ]),
  ]);

  return {
    activeProjects,
    activeSprints,
    completedTasks,
    overdueTasks,
    taskDistribution: Object.fromEntries(taskDistribution.map((d: any) => [d._id, d.count])),
    velocitySummary: velocitySummary[0] || { avgVelocity: 0, count: 0 },
  };
};
