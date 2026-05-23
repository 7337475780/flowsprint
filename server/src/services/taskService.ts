import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { ITask } from '../types/task.js';
import { IUser } from '../types/user.js';
import { 
  BadRequestError, 
  NotFoundError, 
  UnauthorizedError 
} from '../utils/errors.js';
import { createNotification } from '../modules/notifications/notification.service.js';
import { parseMentions } from '../utils/mentionHelper.js';

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
        performedBy: user._id as any,
        details: 'Task initialized in backlog',
      },
    ],
  });

  const savedTask = await task.save();

  // If assignee is assigned, log an additional assignment activity
  if (savedTask.assignee) {
    savedTask.activities.push({
      action: 'assigned',
      performedBy: user._id as any,
      details: `Task assigned directly to teammate`,
    } as any);
    await savedTask.save();

    // Trigger Notification for Assignment
    const assigneeId = savedTask.assignee.toString();
    const creatorId = user._id.toString();
    if (assigneeId !== creatorId) {
      createNotification({
        userId: assigneeId,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `${user.name} assigned you the task: "${savedTask.title}"`,
        entityType: 'task',
        entityId: savedTask._id.toString(),
        priority: savedTask.priority || 'medium',
        createdBy: creatorId,
      }).catch(console.error);
    }
  }

  // Parse mentions in the description
  if (savedTask.description) {
    parseMentions(savedTask.description).then(async (mentions) => {
      const creatorId = user._id.toString();
      const filterMentions = mentions.filter(
        (uid) => uid !== creatorId && uid !== savedTask.assignee?.toString()
      );
      if (filterMentions.length > 0) {
        await Promise.all(
          filterMentions.map((uid) =>
            createNotification({
              userId: uid,
              type: 'mention',
              title: 'Mentioned in Task Description',
              message: `${user.name} mentioned you in the description of: "${savedTask.title}"`,
              entityType: 'task',
              entityId: savedTask._id.toString(),
              priority: savedTask.priority || 'medium',
              createdBy: creatorId,
            })
          )
        );
      }
    }).catch(console.error);
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
  await checkProjectAccess(task.project.toString(), user);

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
    performedBy: user._id as any,
    details: 'Task details updated',
  } as any);

  if (isAssigneeChanged) {
    task.activities.push({
      action: 'assigned',
      performedBy: user._id as any,
      details: task.assignee 
        ? 'Task reassigned to teammate'
        : 'Task unassigned',
    } as any);
  }

  const savedTask = await task.save();
  const creatorId = user._id.toString();

  // Trigger assignment notification if assignee changed
  if (isAssigneeChanged && savedTask.assignee) {
    const assigneeId = savedTask.assignee.toString();
    if (assigneeId !== creatorId) {
      createNotification({
        userId: assigneeId,
        type: 'task_assigned',
        title: 'Task Assigned',
        message: `${user.name} assigned you the task: "${savedTask.title}"`,
        entityType: 'task',
        entityId: savedTask._id.toString(),
        priority: savedTask.priority || 'medium',
        createdBy: creatorId,
      }).catch(console.error);
    }
  } 
  // Trigger task updated notification for assignee if someone else modified it
  else if (savedTask.assignee) {
    const assigneeId = savedTask.assignee.toString();
    if (assigneeId !== creatorId) {
      createNotification({
        userId: assigneeId,
        type: 'task_updated',
        title: 'Task Updated',
        message: `${user.name} updated the task: "${savedTask.title}"`,
        entityType: 'task',
        entityId: savedTask._id.toString(),
        priority: savedTask.priority || 'medium',
        createdBy: creatorId,
      }).catch(console.error);
    }
  }

  // Parse mentions in the description
  if (updateData.description) {
    parseMentions(updateData.description).then(async (mentions) => {
      const filterMentions = mentions.filter(
        (uid) => uid !== creatorId && uid !== savedTask.assignee?.toString()
      );
      if (filterMentions.length > 0) {
        await Promise.all(
          filterMentions.map((uid) =>
            createNotification({
              userId: uid,
              type: 'mention',
              title: 'Mentioned in Task Description',
              message: `${user.name} mentioned you in the description of: "${savedTask.title}"`,
              entityType: 'task',
              entityId: savedTask._id.toString(),
              priority: savedTask.priority || 'medium',
              createdBy: creatorId,
            })
          )
        );
      }
    }).catch(console.error);
  }

  return savedTask;
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

/**
 * Direct task status and column index movement logic.
 */
export const moveTask = async (
  id: string,
  newStatus: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done',
  newOrder: number,
  user: IUser
): Promise<ITask> => {
  const task = await Task.findById(id).populate('project', 'owner');
  if (!task) {
    throw new NotFoundError('Task was not found');
  }

  const projectOwner = (task.project as any).owner.toString();
  const isProjectOwner = projectOwner === user._id.toString();
  const isAssignee = task.assignee?.toString() === user._id.toString();

  // Role Restriction: Admin, Managers, and Project Owners can move any task. Teammates can only move tasks assigned to them.
  const isAuthorized = user.role === 'admin' || user.role === 'manager' || isProjectOwner || isAssignee;
  if (!isAuthorized) {
    throw new UnauthorizedError('Access denied. You can only move tasks assigned to you.');
  }

  const oldStatus = task.status;
  const oldOrder = task.order;

  if (oldStatus === newStatus && oldOrder === newOrder) {
    return task;
  }

  // 1. Open slot in destination column (increment order of tasks with order >= newOrder)
  await Task.updateMany(
    {
      project: task.project,
      status: newStatus,
      _id: { $ne: task._id },
      order: { $gte: newOrder },
    },
    { $inc: { order: 1 } }
  );

  // 2. Close gap in source column (decrement order of tasks with order > oldOrder)
  await Task.updateMany(
    {
      project: task.project,
      status: oldStatus,
      _id: { $ne: task._id },
      order: { $gt: oldOrder },
    },
    { $inc: { order: -1 } }
  );

  // 3. Update task
  task.status = newStatus;
  task.order = newOrder;

  task.activities.push({
    action: 'moved',
    performedBy: user._id as any,
    details: `Task status changed from [${oldStatus}] to [${newStatus}]`,
  } as any);

  const savedTask = await task.save();
  const performerId = user._id.toString();

  // Trigger task moved notification for assignee if someone else moved it
  if (savedTask.assignee) {
    const assigneeId = savedTask.assignee.toString();
    if (assigneeId !== performerId) {
      createNotification({
        userId: assigneeId,
        type: 'task_moved',
        title: 'Task Status Changed',
        message: `${user.name} moved task "${savedTask.title}" to "${newStatus}"`,
        entityType: 'task',
        entityId: savedTask._id.toString(),
        priority: savedTask.priority || 'medium',
        createdBy: performerId,
      }).catch(console.error);
    }
  }

  return savedTask;
};

/**
 * Reorders tasks within a column or across columns (Frontend Drag and Drop).
 * Recalculates index orders dynamically to prevent index collisions.
 */
export const reorderTasks = async (
  taskId: string,
  sourceStatus: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done',
  destinationStatus: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done',
  sourceIndex: number,
  destinationIndex: number,
  user: IUser
): Promise<ITask> => {
  const task = await Task.findById(taskId).populate('project', 'owner');
  if (!task) {
    throw new NotFoundError('Task was not found');
  }

  const projectOwner = (task.project as any).owner.toString();
  const isProjectOwner = projectOwner === user._id.toString();
  const isAssignee = task.assignee?.toString() === user._id.toString();

  const isAuthorized = user.role === 'admin' || user.role === 'manager' || isProjectOwner || isAssignee;
  if (!isAuthorized) {
    throw new UnauthorizedError('Access denied. You do not have permission to reorder this task.');
  }

  if (sourceStatus === destinationStatus) {
    // Same-column index shift
    if (sourceIndex === destinationIndex) {
      return task;
    }

    if (sourceIndex < destinationIndex) {
      // Dragging down: decrement items between source and destination
      await Task.updateMany(
        {
          project: task.project,
          status: sourceStatus,
          order: { $gt: sourceIndex, $lte: destinationIndex },
        },
        { $inc: { order: -1 } }
      );
    } else {
      // Dragging up: increment items between destination and source
      await Task.updateMany(
        {
          project: task.project,
          status: sourceStatus,
          order: { $gte: destinationIndex, $lt: sourceIndex },
        },
        { $inc: { order: 1 } }
      );
    }

    task.order = destinationIndex;
  } else {
    // Cross-column index shift
    // 1. Close gap in source column
    await Task.updateMany(
      {
        project: task.project,
        status: sourceStatus,
        order: { $gt: sourceIndex },
      },
      { $inc: { order: -1 } }
    );

    // 2. Open slot in destination column
    await Task.updateMany(
      {
        project: task.project,
        status: destinationStatus,
        order: { $gte: destinationIndex },
      },
      { $inc: { order: 1 } }
    );

    task.status = destinationStatus;
    task.order = destinationIndex;

    task.activities.push({
      action: 'moved',
      performedBy: user._id as any,
      details: `Task status changed from [${sourceStatus}] to [${destinationStatus}]`,
    } as any);
  }

  const savedTask = await task.save();
  const performerId = user._id.toString();

  // Trigger task moved notification for assignee if moved across status columns by someone else
  if (sourceStatus !== destinationStatus && savedTask.assignee) {
    const assigneeId = savedTask.assignee.toString();
    if (assigneeId !== performerId) {
      createNotification({
        userId: assigneeId,
        type: 'task_moved',
        title: 'Task Status Changed',
        message: `${user.name} moved task "${savedTask.title}" to "${destinationStatus}"`,
        entityType: 'task',
        entityId: savedTask._id.toString(),
        priority: savedTask.priority || 'medium',
        createdBy: performerId,
      }).catch(console.error);
    }
  }

  return savedTask;
};

/**
 * Adds an embedded comment context to a task document.
 */
export const addComment = async (
  taskId: string,
  text: string,
  user: IUser
): Promise<ITask> => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError('Task was not found');
  }

  // Verify access
  await checkProjectAccess(task.project.toString(), user);

  // Append comment
  const comment: any = {
    author: user._id as any,
    text,
  };
  task.comments.push(comment);

  // Log activity
  task.activities.push({
    action: 'commented',
    performedBy: user._id as any,
    details: 'Added a comment to the task thread',
  } as any);

  const saved = await task.save();

  // Trigger Notifications: Mentions + Comment Added
  const commenterId = user._id.toString();
  parseMentions(text).then(async (mentions) => {
    const filterMentions = mentions.filter((uid) => uid !== commenterId);
    
    // 1. Dispatch mention notifications
    if (filterMentions.length > 0) {
      await Promise.all(
        filterMentions.map((uid) =>
          createNotification({
            userId: uid,
            type: 'mention',
            title: 'Mentioned in Task Comment',
            message: `${user.name} mentioned you in a comment on task: "${saved.title}"`,
            entityType: 'comment',
            entityId: saved._id.toString(),
            priority: saved.priority || 'medium',
            createdBy: commenterId,
          })
        )
      );
    }

    // 2. Dispatch comment_added notification to task assignee (if assignee is not the commenter and was not already mentioned)
    if (saved.assignee) {
      const assigneeId = saved.assignee.toString();
      if (assigneeId !== commenterId && !filterMentions.includes(assigneeId)) {
        await createNotification({
          userId: assigneeId,
          type: 'comment_added',
          title: 'New Task Comment',
          message: `${user.name} commented on your task: "${saved.title}"`,
          entityType: 'comment',
          entityId: saved._id.toString(),
          priority: saved.priority || 'medium',
          createdBy: commenterId,
        });
      }
    }
  }).catch(console.error);

  return await saved.populate('comments.author', 'name email avatar');
};

/**
 * Modifies an existing embedded comment in a task document.
 */
export const editComment = async (
  taskId: string,
  commentId: string,
  text: string,
  user: IUser
): Promise<ITask> => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new NotFoundError('Task was not found');
  }

  const comment = (task.comments as any).id(commentId);
  if (!comment) {
    throw new NotFoundError('Comment was not found');
  }

  // Restrict editing: only comment author can modify
  if (comment.author.toString() !== user._id.toString()) {
    throw new UnauthorizedError('Access denied. You can only edit your own comments.');
  }

  comment.text = text;

  // Log activity
  task.activities.push({
    action: 'updated',
    performedBy: user._id as any,
    details: 'Modified a task comment',
  } as any);

  const saved = await task.save();
  return await saved.populate('comments.author', 'name email avatar');
};

/**
 * Removes an embedded comment from a task document.
 */
export const deleteComment = async (
  taskId: string,
  commentId: string,
  user: IUser
): Promise<ITask> => {
  const task = await Task.findById(taskId).populate('project', 'owner');
  if (!task) {
    throw new NotFoundError('Task was not found');
  }

  const comment = (task.comments as any).id(commentId);
  if (!comment) {
    throw new NotFoundError('Comment was not found');
  }

  const projectOwner = (task.project as any).owner.toString();
  const isProjectOwner = projectOwner === user._id.toString();

  // Restrict deletion: only comment author, project owner, or admin can delete comments
  const isAuthor = comment.author.toString() === user._id.toString();
  const canDelete = isAuthor || isProjectOwner || user.role === 'admin';

  if (!canDelete) {
    throw new UnauthorizedError('Access denied. You do not have permission to delete this comment.');
  }

  // Pull out of embedded array
  (task.comments as any).pull(commentId);

  // Log activity
  task.activities.push({
    action: 'updated',
    performedBy: user._id as any,
    details: 'Removed a task comment',
  } as any);

  const saved = await task.save();
  return await saved.populate('comments.author', 'name email avatar');
};
