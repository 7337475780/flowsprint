import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';
import * as analyticsService from './analytics.service.js';
import { analyticsCache } from './analytics.utils.js';
import { User } from '../../models/User.js';
import { Project } from '../../models/Project.js';
import { Sprint } from '../../models/Sprint.js';
import { Task } from '../../models/Task.js';
import { Notification } from '../notifications/notification.model.js';
import bcrypt from 'bcryptjs';

// Cache TTL constant: 5 minutes in milliseconds
const CACHE_TTL = 300_000;

/**
 * GET /api/analytics/overview
 * Global workspace productivity overview (cached)
 */
export const getOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const cacheKey = `overview:${userId}`;

    const cachedData = analyticsCache.get(cacheKey);
    if (cachedData) {
      res.status(200).json({
        success: true,
        data: cachedData,
        cached: true,
      });
      return;
    }

    const data = await analyticsService.getWorkspaceOverview(req.user!);
    analyticsCache.set(cacheKey, data, CACHE_TTL);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error compiling workspace overview',
    });
  }
};

/**
 * GET /api/analytics/projects/:projectId
 * Specific project progress, workload, and member stats
 */
export const getProjectAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const projectId = req.params.projectId;
    const cacheKey = `project:${projectId}:${userId}`;

    const cachedData = analyticsCache.get(cacheKey);
    if (cachedData) {
      res.status(200).json({
        success: true,
        data: cachedData,
        cached: true,
      });
      return;
    }

    const data = await analyticsService.getProjectAnalytics(projectId, req.user!);
    analyticsCache.set(cacheKey, data, CACHE_TTL);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    const status = error.name === 'UnauthorizedError' ? 403 : error.name === 'NotFoundError' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error compiling project analytics',
    });
  }
};

/**
 * GET /api/analytics/sprints/:sprintId
 * Specific sprint burndown progress and points charts
 */
export const getSprintAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const sprintId = req.params.sprintId;
    const cacheKey = `sprint:${sprintId}:${userId}`;

    const cachedData = analyticsCache.get(cacheKey);
    if (cachedData) {
      res.status(200).json({
        success: true,
        data: cachedData,
        cached: true,
      });
      return;
    }

    const data = await analyticsService.getSprintMetrics(sprintId, req.user!);
    analyticsCache.set(cacheKey, data, CACHE_TTL);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    const status = error.name === 'UnauthorizedError' ? 403 : error.name === 'NotFoundError' ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Error compiling sprint analytics',
    });
  }
};

/**
 * GET /api/analytics/team
 * Aggregated active members leaderboard scores
 */
export const getTeamAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const cacheKey = `team:${userId}`;

    const cachedData = analyticsCache.get(cacheKey);
    if (cachedData) {
      res.status(200).json({
        success: true,
        data: cachedData,
        cached: true,
      });
      return;
    }

    const data = await analyticsService.getTeamMetrics(req.user!);
    analyticsCache.set(cacheKey, data, CACHE_TTL);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error compiling team analytics',
    });
  }
};

/**
 * GET /api/analytics/trends
 * Weekly completion rates and velocity history (cached)
 */
export const getTrendAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const cacheKey = `trends:${userId}`;

    const cachedData = analyticsCache.get(cacheKey);
    if (cachedData) {
      res.status(200).json({
        success: true,
        data: cachedData,
        cached: true,
      });
      return;
    }

    const data = await analyticsService.getTrendMetrics(req.user!);
    analyticsCache.set(cacheKey, data, CACHE_TTL);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error compiling trends analytics',
    });
  }
};

/**
 * Helper to clear analytical cache on updates (to guarantee real-time updates)
 */
export const invalidateAnalyticsCache = (userId?: string): void => {
  if (userId) {
    // Clear user specific keys
    const pattern = new RegExp(`:${userId}$`);
    analyticsCache.invalidatePattern(pattern);
  } else {
    // Clear everything
    analyticsCache.clear();
  }
};

/**
 * POST /api/analytics/seed
 * Programmatically seed the database with gorgeous mock agile datasets
 */
export const seedDatabase = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const currentUser = req.user!;
    const currentUserId = currentUser._id;

    // 1. Create Mock Teammates if they do not exist
    const mockTeammates = [
      {
        name: 'Sarah Connor',
        email: 'sarah.connor@flowsprint.io',
        password: 'Password123!',
        role: 'member' as const,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        bio: 'Senior Technical Product Owner. Specializing in high-velocity agile sprints and scrum scaling.',
        isActive: true
      },
      {
        name: 'Marcus Wright',
        email: 'marcus.wright@flowsprint.io',
        password: 'Password123!',
        role: 'member' as const,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        bio: 'Lead Full-Stack Developer. Focused on React Kanban boards and robust Node.js backend workflows.',
        isActive: true
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@flowsprint.io',
        password: 'Password123!',
        role: 'manager' as const,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        bio: 'Agile Coach & Project Workspace Manager. Helping teams accelerate sprint velocities.',
        isActive: true
      }
    ];

    const teamMembers = [];
    for (const item of mockTeammates) {
      let u = await User.findOne({ email: item.email });
      if (!u) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(item.password, salt);
        u = await User.create({ ...item, password: hashed });
      }
      teamMembers.push(u);
    }

    const [sarah, marcus, elena] = teamMembers;

    // 2. Clear existing Projects, Sprints, Tasks, and Notifications to make data perfectly consistent
    await Project.deleteMany({});
    await Sprint.deleteMany({});
    await Task.deleteMany({});
    await Notification.deleteMany({});

    // 3. Seed projects
    const membersList = [sarah._id, marcus._id, elena._id, currentUserId];

    const project1 = await Project.create({
      name: 'FlowSprint Core Platform',
      key: 'FS',
      description: 'Primary workspace repository for FlowSprint planning, sprint telemetries, and Kanban engines.',
      status: 'active' as const,
      priority: 'high' as const,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      owner: currentUserId,
      members: membersList,
      tags: ['React', 'Node.js', 'WebSockets', 'Agile'],
      progress: 68
    });

    const project2 = await Project.create({
      name: 'Alpha Mobile App client',
      key: 'AMA',
      description: 'React Native mobile application client with real-time push alerts and board views.',
      status: 'planning' as const,
      priority: 'medium' as const,
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      owner: currentUserId,
      members: membersList,
      tags: ['React Native', 'Mobile', 'iOS', 'Android'],
      progress: 0
    });

    // 4. Seed Sprints
    const sprint1 = await Sprint.create({
      name: 'Sprint 1 - System Foundations',
      goal: 'Deploy initial databases, Auth servers, and baseline workspace routers.',
      project: project1._id,
      startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
      status: 'completed' as const,
      plannedPoints: 30,
      completedPoints: 26,
      velocity: 0.8667,
      progress: 100,
      owner: currentUserId,
      members: membersList,
      retrospective: 'Excellent baseline speed. Redundant routing is resolved; authorization pipelines are extremely robust.'
    });

    const sprint2 = await Sprint.create({
      name: 'Sprint 2 - Realtime Boards',
      goal: 'Integrate dynamic drag-and-drop dashboards and socket connection feeds.',
      project: project1._id,
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      status: 'active' as const,
      plannedPoints: 38,
      completedPoints: 0,
      velocity: 0,
      progress: 45,
      owner: currentUserId,
      members: membersList
    });

    const sprint3 = await Sprint.create({
      name: 'Sprint 3 - Performance Tuning',
      goal: 'Optimize telemetry aggregation caches and resolve mobile scaling bottlenecks.',
      project: project1._id,
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000),
      status: 'planned' as const,
      plannedPoints: 25,
      completedPoints: 0,
      velocity: 0,
      progress: 0,
      owner: currentUserId,
      members: membersList
    });

    // 5. Seed Tasks
    const tasksToCreate = [
      {
        title: 'FS-101: Express Setup & TypeScript compilation',
        description: 'Setup initial node packages, tsconfigs, and dev scripts for server hot-reload.',
        status: 'done' as const,
        priority: 'high' as const,
        storyPoints: 5,
        assignee: marcus._id,
        reporter: currentUserId,
        sprintId: sprint1._id,
        dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'FS-102: Mongoose database schema definitions',
        description: 'Model users, projects, tasks, sprints and configure compound index fields.',
        status: 'done' as const,
        priority: 'critical' as const,
        storyPoints: 8,
        assignee: elena._id,
        reporter: currentUserId,
        sprintId: sprint1._id,
        dueDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'FS-103: Wireframe Authentication layout shells',
        description: 'Draw wireframes for registration/login and baseline login session forms.',
        status: 'done' as const,
        priority: 'medium' as const,
        storyPoints: 3,
        assignee: sarah._id,
        reporter: currentUserId,
        sprintId: sprint1._id,
        dueDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'FS-104: Design landing dashboard layout mockups',
        description: 'Establish standard sidebar navigations, headers, and grid widgets styles.',
        status: 'done' as const,
        priority: 'high' as const,
        storyPoints: 5,
        assignee: currentUserId,
        reporter: marcus._id,
        sprintId: sprint1._id,
        dueDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'FS-105: Core JWT Session verification logic',
        description: 'Write auth middleware, cookie parser settings, and session token generation.',
        status: 'done' as const,
        priority: 'critical' as const,
        storyPoints: 5,
        assignee: marcus._id,
        reporter: currentUserId,
        sprintId: sprint1._id,
        dueDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'FS-106: Setup socket.io communication pipelines',
        description: 'Connect client connection listeners and configure private channels for team updates.',
        status: 'in-progress' as const,
        priority: 'high' as const,
        storyPoints: 8,
        assignee: marcus._id,
        reporter: currentUserId,
        sprintId: sprint2._id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'FS-107: Implement Drag & Drop Kanban board grids',
        description: 'Introduce beautiful HTML5 drag handles and batch rank reorders algorithms.',
        status: 'in-progress' as const,
        priority: 'critical' as const,
        storyPoints: 8,
        assignee: sarah._id,
        reporter: currentUserId,
        sprintId: sprint2._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'FS-108: Fix Tickets Ring Mobile layout overflows',
        description: 'Introduce fluid aspect ratios and change fixed height containers to auto.',
        status: 'done' as const,
        priority: 'high' as const,
        storyPoints: 3,
        assignee: currentUserId,
        reporter: sarah._id,
        sprintId: sprint2._id,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'FS-109: Dynamic Recent Activity stream widgets',
        description: 'Connect active telemetry grids directly to database notification logs.',
        status: 'done' as const,
        priority: 'medium' as const,
        storyPoints: 5,
        assignee: currentUserId,
        reporter: marcus._id,
        sprintId: sprint2._id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'FS-110: Compact task discussion comments thread',
        description: 'Render inline discussion streams, author avatars, and post text fields.',
        status: 'review' as const,
        priority: 'medium' as const,
        storyPoints: 5,
        assignee: elena._id,
        reporter: currentUserId,
        sprintId: sprint2._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'FS-111: Setup centralized error handling hooks',
        description: 'Write robust express catches for database failures and schema validation.',
        status: 'todo' as const,
        priority: 'low' as const,
        storyPoints: 3,
        assignee: marcus._id,
        reporter: currentUserId,
        sprintId: sprint2._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'FS-112: Write dynamic telemetry database aggregation',
        description: 'Formulate aggregate groupings to calculate workload densities and completion indices.',
        status: 'todo' as const,
        priority: 'high' as const,
        storyPoints: 5,
        assignee: elena._id,
        reporter: currentUserId,
        sprintId: sprint2._id,
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'FS-113: Implement full-text project search index',
        description: 'Register text index fields on databases and hook search query strings parameters.',
        status: 'backlog' as const,
        priority: 'low' as const,
        storyPoints: 8,
        assignee: sarah._id,
        reporter: currentUserId,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'FS-114: Deploy production assets bundles to Vercel',
        description: 'Setup continuous integration workflows and specify custom caching parameters.',
        status: 'backlog' as const,
        priority: 'medium' as const,
        storyPoints: 5,
        assignee: elena._id,
        reporter: currentUserId,
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      }
    ];

    const createdTasks = [];
    const sprint1TaskIds: any[] = [];
    const sprint2TaskIds: any[] = [];

    for (let i = 0; i < tasksToCreate.length; i++) {
      const item = tasksToCreate[i];
      const task = await Task.create({
        ...item,
        project: project1._id,
        projectId: project1._id,
        order: i,
        position: i,
        subtasks: [
          { title: 'Subtask 1 - Setup baseline environment', completed: true },
          { title: 'Subtask 2 - Implement test validation', completed: item.status === 'done' }
        ],
        comments: item.status === 'done' ? [
          { author: marcus._id, text: 'Clean PR, works perfectly!' },
          { author: currentUserId, text: 'Awesome, ready to merge.' }
        ] : [
          { author: elena._id, text: 'Please check the mobile layout scaling again.' }
        ],
        activities: [
          { action: 'created', performedBy: item.reporter, details: `Created task "${item.title}"` },
          { action: 'assigned', performedBy: item.reporter, details: `Assigned task to assignee` },
          { action: 'moved', performedBy: currentUserId, details: `Moved task to [${item.status}]` }
        ]
      });

      createdTasks.push(task);

      if (item.sprintId && item.sprintId.toString() === sprint1._id.toString()) {
        sprint1TaskIds.push(task._id);
      } else if (item.sprintId && item.sprintId.toString() === sprint2._id.toString()) {
        sprint2TaskIds.push(task._id);
      }
    }

    await Sprint.findByIdAndUpdate(sprint1._id, { tasks: sprint1TaskIds });
    await Sprint.findByIdAndUpdate(sprint2._id, { tasks: sprint2TaskIds });

    // 6. Seed Dynamic Notification Logs
    const logsToCreate = [
      {
        type: 'sprint_completed' as const,
        title: 'Sprint Completed',
        message: `${elena.name} completed the sprint "Sprint 1 - System Foundations"`,
        entityType: 'sprint' as const,
        entityId: sprint1._id,
        createdBy: elena._id,
        createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'task_moved' as const,
        title: 'Task Completed',
        message: `${currentUser.name} completed the task "FS-108: Fix Tickets Ring Mobile layout overflows"`,
        entityType: 'task' as const,
        entityId: createdTasks.find(t => t.title.includes('FS-108'))?._id,
        createdBy: currentUserId,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'task_moved' as const,
        title: 'Task Completed',
        message: `${currentUser.name} completed the task "FS-109: Dynamic Recent Activity stream widgets"`,
        entityType: 'task' as const,
        entityId: createdTasks.find(t => t.title.includes('FS-109'))?._id,
        createdBy: currentUserId,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'task_assigned' as const,
        title: 'Task Assigned',
        message: `${currentUser.name} assigned task "FS-106: Setup socket.io communication pipelines" to ${marcus.name}`,
        entityType: 'task' as const,
        entityId: createdTasks.find(t => t.title.includes('FS-106'))?._id,
        createdBy: currentUserId,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'comment_added' as const,
        title: 'Discussion Update',
        message: `${sarah.name} added a comment on "FS-110: Compact task discussion comments thread"`,
        entityType: 'comment' as const,
        entityId: createdTasks.find(t => t.title.includes('FS-110'))?._id,
        createdBy: sarah._id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      }
    ];

    for (const log of logsToCreate) {
      await Notification.create({
        userId: currentUserId,
        type: log.type,
        title: log.title,
        message: log.message,
        entityType: log.entityType,
        entityId: log.entityId,
        createdBy: log.createdBy,
        isRead: false,
        priority: 'medium',
        createdAt: log.createdAt,
        updatedAt: log.createdAt
      });
    }

    // Invalidate Analytical cache to guarantee fresh dashboards load instantly
    invalidateAnalyticsCache();

    res.status(200).json({
      success: true,
      message: '✅ Workspace database seeded dynamically with realistic sprint history!',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error occurred during database seeding',
    });
  }
};
