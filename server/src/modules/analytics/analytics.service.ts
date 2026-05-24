import mongoose from 'mongoose';
import { Project } from '../../models/Project.js';
import { Task } from '../../models/Task.js';
import { Sprint } from '../../models/Sprint.js';
import { User } from '../../models/User.js';
import { IUser } from '../../types/user.js';
import { NotFoundError, UnauthorizedError } from '../../utils/errors.js';
import {
  calculateProductivityScore,
  calculateWorkloadIndex,
} from './analytics.utils.js';
import {
  DashboardOverview,
  ProjectAnalytics,
  SprintAnalytics,
  TeamAnalytics,
  TrendAnalytics,
} from './analytics.types.js';

/**
 * Resolves accessible project IDs for the logged-in user context
 */
const getVisibleProjects = async (user: IUser): Promise<string[]> => {
  let projectFilter: any = {};
  if (user.role === 'member') {
    projectFilter = {
      $or: [{ owner: user._id }, { members: user._id }],
    };
  }

  const projects = await Project.find(projectFilter).select('_id');
  return projects.map((p) => p._id.toString());
};

/**
 * 1. Get Global Workspace Overview KPIs
 */
export const getWorkspaceOverview = async (user: IUser): Promise<DashboardOverview> => {
  const visibleProjectIds = await getVisibleProjects(user);

  if (visibleProjectIds.length === 0) {
    return {
      totalProjects: 0,
      activeProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      activeSprints: 0,
      completionRate: 0,
      avgVelocity: 0,
      teamWorkloadIndex: 0,
    };
  }

  const now = new Date();

  // Executing aggregation calculations in parallel for maximum query performance
  const [
    totalProjects,
    activeProjects,
    activeSprints,
    taskStats,
    sprintStats,
    teamWorkloads,
  ] = await Promise.all([
    Project.countDocuments({ _id: { $in: visibleProjectIds } }),
    Project.countDocuments({ _id: { $in: visibleProjectIds }, status: 'active', isArchived: false }),
    Sprint.countDocuments({ project: { $in: visibleProjectIds }, status: 'active' }),
    
    // Aggregated Task counts (Total, Done, Overdue)
    Task.aggregate([
      { $match: { project: { $in: visibleProjectIds.map(id => new mongoose.Types.ObjectId(id)) }, isArchived: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', now] },
                    { $ne: ['$status', 'done'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),

    // Sprint Velocity Averages
    Sprint.aggregate([
      { $match: { project: { $in: visibleProjectIds.map(id => new mongoose.Types.ObjectId(id)) }, status: 'completed' } },
      { $group: { _id: null, avgVelocity: { $avg: '$velocity' } } },
    ]),

    // Team Workload density evaluation
    Task.aggregate([
      {
        $match: {
          project: { $in: visibleProjectIds.map(id => new mongoose.Types.ObjectId(id)) },
          isArchived: false,
          assignee: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$assignee',
          assignedTasks: { $sum: 1 },
          completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', now] },
                    { $ne: ['$status', 'done'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const tasksCount = taskStats[0] || { total: 0, completed: 0, overdue: 0 };
  const avgVel = sprintStats[0]?.avgVelocity || 0;

  // Calculate Average Team Workload Index
  let totalWorkload = 0;
  if (teamWorkloads.length > 0) {
    teamWorkloads.forEach((member) => {
      totalWorkload += calculateWorkloadIndex(
        member.assignedTasks,
        member.completedTasks,
        member.overdueTasks
      );
    });
  }

  const teamWorkloadIndex = teamWorkloads.length > 0
    ? Math.round(totalWorkload / teamWorkloads.length)
    : 0;

  const completionRate = tasksCount.total > 0
    ? Math.round((tasksCount.completed / tasksCount.total) * 100)
    : 0;

  return {
    totalProjects,
    activeProjects,
    totalTasks: tasksCount.total,
    completedTasks: tasksCount.completed,
    overdueTasks: tasksCount.overdue,
    activeSprints,
    completionRate,
    avgVelocity: parseFloat(avgVel.toFixed(2)),
    teamWorkloadIndex,
  };
};

/**
 * 2. Get Project Specific Performance Metrics
 */
export const getProjectAnalytics = async (
  projectId: string,
  user: IUser
): Promise<ProjectAnalytics> => {
  const visibleProjects = await getVisibleProjects(user);
  if (!visibleProjects.includes(projectId)) {
    throw new UnauthorizedError('Access denied to query this project dashboard');
  }

  const project = await Project.findById(projectId);
  if (!project) throw new NotFoundError('Project was not found');

  const now = new Date();

  const [tasks, sprints] = await Promise.all([
    Task.find({ project: projectId, isArchived: false }).populate('assignee', 'name email avatar'),
    Sprint.find({ project: projectId }),
  ]);

  // Calculated Progress & Status Distribution
  const total = tasks.length;
  const distribution = {
    backlog: 0,
    todo: 0,
    'in-progress': 0,
    review: 0,
    done: 0,
  };

  const overdueList: any[] = [];
  const memberStats = new Map<string, { assigned: number; completed: number; name: string; avatar?: string }>();

  // Feed project members list to contribution map
  project.members.forEach((m: any) => {
    memberStats.set(m.toString(), { assigned: 0, completed: 0, name: 'Team Member' });
  });
  memberStats.set(project.owner.toString(), { assigned: 0, completed: 0, name: 'Project Owner' });

  tasks.forEach((task) => {
    // Increment status count
    if (task.status in distribution) {
      distribution[task.status as keyof typeof distribution]++;
    }

    // Evaluate overdue tasks
    if (task.dueDate && task.dueDate < now && task.status !== 'done') {
      overdueList.push({
        _id: task._id.toString(),
        title: task.title,
        dueDate: task.dueDate.toISOString(),
        assigneeName: (task.assignee as any)?.name || 'Unassigned',
      });
    }

    // Populate team statistics
    if (task.assignee) {
      const assigneeId = (task.assignee as any)._id?.toString() || task.assignee.toString();
      const assigneeName = (task.assignee as any).name || 'Teammate';
      const assigneeAvatar = (task.assignee as any).avatar;
      
      const stats = memberStats.get(assigneeId) || { assigned: 0, completed: 0, name: assigneeName, avatar: assigneeAvatar };
      stats.name = assigneeName;
      stats.avatar = assigneeAvatar;
      stats.assigned++;
      if (task.status === 'done') {
        stats.completed++;
      }
      memberStats.set(assigneeId, stats);
    }
  });

  // Calculate Project completion trends over the last 14 days
  const trendMap = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    trendMap.set(date.toISOString().split('T')[0], 0);
  }

  // Look up completed tasks timestamps from activities
  tasks.forEach((task) => {
    if (task.status === 'done') {
      const doneActivity = [...task.activities]
        .reverse()
        .find((a: any) => a.action === 'moved' && a.details?.includes('done'));
      
      const completedDate = doneActivity 
        ? new Date(doneActivity.createdAt).toISOString().split('T')[0]
        : new Date(task.updatedAt).toISOString().split('T')[0];

      if (trendMap.has(completedDate)) {
        trendMap.set(completedDate, trendMap.get(completedDate)! + 1);
      }
    }
  });

  const completionTrend = Array.from(trendMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));

  // Clean member contribution array format
  const teamContribution = Array.from(memberStats.entries())
    .map(([userId, stats]) => {
      const completedTasks = stats.completed;
      const assignedTasks = stats.assigned;
      const totalDone = distribution.done || 1;

      return {
        userId,
        name: stats.name,
        avatar: stats.avatar,
        assignedTasks,
        completedTasks,
        contributionPercentage: Math.round((completedTasks / totalDone) * 100),
      };
    })
    .filter((member) => member.assignedTasks > 0); // Only return active assignees

  const projectProgress = total > 0 ? Math.round((distribution.done / total) * 100) : 0;

  return {
    projectProgress,
    taskDistribution: distribution,
    completionTrend,
    teamContribution,
    overdueTasks: overdueList,
    sprintInvolvement: sprints.map((s) => ({
      _id: s._id.toString(),
      name: s.name,
      status: s.status,
      plannedPoints: s.plannedPoints,
      completedPoints: s.completedPoints || 0,
    })),
  };
};

/**
 * 3. Get Sprint Performance Burndown and Efficiency Metrics
 */
export const getSprintMetrics = async (
  sprintId: string,
  user: IUser
): Promise<SprintAnalytics> => {
  const sprint = await Sprint.findById(sprintId).populate('tasks');
  if (!sprint) throw new NotFoundError('Sprint was not found');

  const visibleProjects = await getVisibleProjects(user);
  if (!visibleProjects.includes(sprint.project.toString())) {
    throw new UnauthorizedError('Access denied to view this sprint metrics');
  }

  const tasks = sprint.tasks as any[];
  const plannedPoints = sprint.plannedPoints || 0;
  const completedPoints = sprint.completedPoints || 0;

  // 1. Calculate Burndown Curve
  const burndownData: any[] = [];
  if (sprint.startDate && sprint.endDate) {
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Check when points were burned from activities log
    const burnedByDayMap = new Map<string, number>();
    tasks.forEach((t) => {
      if (t.status === 'done') {
        const doneActivity = [...t.activities]
          .reverse()
          .find((a: any) => a.action === 'moved' && a.details?.includes('[done]'));
        
        const dateStr = doneActivity
          ? new Date(doneActivity.createdAt).toISOString().split('T')[0]
          : new Date(t.updatedAt).toISOString().split('T')[0];
        
        burnedByDayMap.set(dateStr, (burnedByDayMap.get(dateStr) || 0) + (t.storyPoints || 0));
      }
    });

    let remainingPoints = plannedPoints;
    for (let i = 0; i <= totalDays; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const dayStr = day.toISOString().split('T')[0];

      const ideal = Math.round(plannedPoints - (plannedPoints / totalDays) * i);
      remainingPoints -= (burnedByDayMap.get(dayStr) || 0);

      burndownData.push({
        date: dayStr,
        ideal: Math.max(0, ideal),
        remaining: Math.max(0, remainingPoints),
      });

      // Break if we exceed current date for real-time preview burndown
      if (day > new Date() && sprint.status === 'active') break;
    }
  }

  // 2. Daily progress trend
  const dailyProgressMap = new Map<string, { completedTasks: number; points: number }>();
  tasks.forEach((t) => {
    if (t.status === 'done') {
      const doneActivity = [...t.activities]
        .reverse()
        .find((a: any) => a.action === 'moved' && a.details?.includes('done'));
      
      const dateStr = doneActivity
        ? new Date(doneActivity.createdAt).toISOString().split('T')[0]
        : new Date(t.updatedAt).toISOString().split('T')[0];
      
      const record = dailyProgressMap.get(dateStr) || { completedTasks: 0, points: 0 };
      record.completedTasks++;
      record.points += (t.storyPoints || 0);
      dailyProgressMap.set(dateStr, record);
    }
  });

  const dailyProgressTrend = Array.from(dailyProgressMap.entries()).map(([date, record]) => ({
    date,
    completedTasks: record.completedTasks,
    storyPointsBurned: record.points,
  })).sort((a, b) => a.date.localeCompare(b.date));

  // Compute Efficiency Index
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const totalTasks = tasks.length;
  const overdueTasks = tasks.filter((t) => t.dueDate && t.dueDate < new Date() && t.status !== 'done').length;
  
  const sprintEfficiencyScore = calculateProductivityScore(
    completedTasks,
    totalTasks,
    completedPoints,
    plannedPoints,
    overdueTasks
  );

  return {
    velocity: sprint.velocity || 0,
    plannedPoints,
    completedPoints,
    burndownData,
    dailyProgressTrend,
    sprintEfficiencyScore,
  };
};

/**
 * 4. Get Team Workload Leaderboard and Productivity Scores
 */
export const getTeamMetrics = async (user: IUser): Promise<TeamAnalytics> => {
  const visibleProjects = await getVisibleProjects(user);

  if (visibleProjects.length === 0) {
    return { teamMembers: [], averageProductivityScore: 0, workloadDistribution: [] };
  }

  const now = new Date();

  // Aggregate user allocations across visible scopes
  const usersList = await User.find({ isActive: true }).select('name email avatar');

  // Multi-aggregation fetches metrics for all matching assignees
  const memberMetrics = await Task.aggregate([
    { $match: { project: { $in: visibleProjects.map(id => new mongoose.Types.ObjectId(id)) }, isArchived: false } },
    {
      $group: {
        _id: '$assignee',
        assigned: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ['$dueDate', now] },
                  { $ne: ['$status', 'done'] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  // Query planned and completed story points per user from Sprints aggregation
  const sprintPointsByUser = await Sprint.aggregate([
    { $match: { project: { $in: visibleProjects.map(id => new mongoose.Types.ObjectId(id)) } } },
    { $unwind: '$tasks' },
    {
      $lookup: {
        from: 'tasks',
        localField: 'tasks',
        foreignField: '_id',
        as: 'taskDoc',
      },
    },
    { $unwind: '$taskDoc' },
    {
      $group: {
        _id: '$taskDoc.assignee',
        planned: { $sum: '$taskDoc.storyPoints' },
        completed: {
          $sum: { $cond: [{ $eq: ['$taskDoc.status', 'done'] }, '$taskDoc.storyPoints', 0] },
        },
      },
    },
  ]);

  const sprintPointsMap = new Map<string, { planned: number; completed: number }>();
  sprintPointsByUser.forEach((row) => {
    if (row._id) {
      sprintPointsMap.set(row._id.toString(), { planned: row.planned, completed: row.completed });
    }
  });

  let totalScore = 0;
  let scoreCount = 0;

  const teamMembers = usersList
    .map((u) => {
      const metric = memberMetrics.find((m) => m._id && m._id.toString() === u._id.toString()) || {
        assigned: 0,
        completed: 0,
        overdue: 0,
      };

      const pts = sprintPointsMap.get(u._id.toString()) || { planned: 0, completed: 0 };

      const workloadIndex = calculateWorkloadIndex(metric.assigned, metric.completed, metric.overdue);
      const productivityScore = calculateProductivityScore(
        metric.completed,
        metric.assigned,
        pts.completed,
        pts.planned,
        metric.overdue
      );

      if (metric.assigned > 0) {
        totalScore += productivityScore;
        scoreCount++;
      }

      return {
        userId: u._id.toString(),
        name: u.name,
        avatar: u.avatar,
        assignedTasks: metric.assigned,
        completedTasks: metric.completed,
        overdueTasks: metric.overdue,
        completionRate: metric.assigned > 0 ? Math.round((metric.completed / metric.assigned) * 100) : 0,
        workloadIndex,
        productivityScore,
      };
    })
    .filter((member) => member.assignedTasks > 0) // Focus leaderboard on users actively holding assignments
    .sort((a, b) => b.productivityScore - a.productivityScore);

  const averageProductivityScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 80;

  return {
    teamMembers,
    averageProductivityScore,
    workloadDistribution: teamMembers.map((m) => ({
      userId: m.userId,
      name: m.name,
      activeCount: Math.max(0, m.assignedTasks - m.completedTasks),
    })),
  };
};

/**
 * 5. Get rolling 12 months productivity trends
 */
export const getTrendMetrics = async (user: IUser): Promise<TrendAnalytics> => {
  const visibleProjects = await getVisibleProjects(user);

  if (visibleProjects.length === 0) {
    return { weeklyTaskCompletion: [], monthlyVelocityTrend: [], sprintPerformanceHistory: [] };
  }

  // 1. Weekly Task Completion Aggregation (rolling 8 weeks)
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const weeklyCompletion = await Task.aggregate([
    {
      $match: {
        project: { $in: visibleProjects.map(id => new mongoose.Types.ObjectId(id)) },
        status: 'done',
        updatedAt: { $gte: eightWeeksAgo },
      },
    },
    {
      $group: {
        _id: {
          week: { $week: '$updatedAt' },
          year: { $year: '$updatedAt' },
        },
        completedCount: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
  ]);

  // 2. Sprint performance history
  const sprintsList = await Sprint.find({
    project: { $in: visibleProjects },
    status: 'completed',
  })
    .sort({ createdAt: -1 })
    .limit(6);

  const sprintHistory = sprintsList.map((s) => {
    const planned = s.plannedPoints || 0;
    const completed = s.completedPoints || 0;
    const efficiency = planned > 0 ? Math.round((completed / planned) * 100) : 100;

    return {
      sprintId: s._id.toString(),
      name: s.name,
      plannedPoints: planned,
      completedPoints: completed,
      efficiency,
    };
  }).reverse();

  // 3. Monthly velocity trend
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyVelocity = await Sprint.aggregate([
    {
      $match: {
        project: { $in: visibleProjects.map(id => new mongoose.Types.ObjectId(id)) },
        status: 'completed',
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
        avgVelocity: { $avg: '$velocity' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return {
    weeklyTaskCompletion: weeklyCompletion.map((row) => ({
      week: `Wk ${row._id.week}`,
      completedCount: row.completedCount,
    })),
    monthlyVelocityTrend: monthlyVelocity.map((row) => ({
      month: `${monthNames[row._id.month - 1]} ${row._id.year.toString().slice(-2)}`,
      avgVelocity: parseFloat(row.avgVelocity.toFixed(2)),
    })),
    sprintPerformanceHistory: sprintHistory,
  };
};
