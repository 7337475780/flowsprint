export interface DashboardOverview {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  activeSprints: number;
  completionRate: number;
  avgVelocity: number;
  teamWorkloadIndex: number;
}

export interface ProjectAnalytics {
  projectProgress: number;
  taskDistribution: {
    backlog: number;
    todo: number;
    'in-progress': number;
    review: number;
    done: number;
  };
  completionTrend: Array<{ date: string; count: number }>;
  teamContribution: Array<{
    userId: string;
    name: string;
    avatar?: string;
    assignedTasks: number;
    completedTasks: number;
    contributionPercentage: number;
  }>;
  overdueTasks: Array<{
    _id: string;
    title: string;
    dueDate?: string;
    assigneeName?: string;
  }>;
  sprintInvolvement: Array<{
    _id: string;
    name: string;
    status: string;
    plannedPoints: number;
    completedPoints: number;
  }>;
}

export interface SprintAnalytics {
  velocity: number;
  plannedPoints: number;
  completedPoints: number;
  burndownData: Array<{
    date: string;
    ideal: number;
    remaining: number;
  }>;
  dailyProgressTrend: Array<{
    date: string;
    completedTasks: number;
    storyPointsBurned: number;
  }>;
  sprintEfficiencyScore: number;
}

export interface TeamMemberAnalytics {
  userId: string;
  name: string;
  avatar?: string;
  assignedTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  workloadIndex: number;
  productivityScore: number;
}

export interface TeamAnalytics {
  teamMembers: TeamMemberAnalytics[];
  averageProductivityScore: number;
  workloadDistribution: Array<{
    userId: string;
    name: string;
    activeCount: number;
  }>;
}

export interface TrendAnalytics {
  weeklyTaskCompletion: Array<{ week: string; completedCount: number }>;
  monthlyVelocityTrend: Array<{ month: string; avgVelocity: number }>;
  sprintPerformanceHistory: Array<{
    sprintId: string;
    name: string;
    plannedPoints: number;
    completedPoints: number;
    efficiency: number;
  }>;
}
