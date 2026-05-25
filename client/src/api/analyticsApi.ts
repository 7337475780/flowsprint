import api from './axios.js';

export interface AnalyticsOverview {
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

export interface AnalyticsOverviewResponse {
  success: boolean;
  message: string;
  data: AnalyticsOverview;
}

export interface TeamMemberMetric {
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
  teamMembers: TeamMemberMetric[];
  averageProductivityScore: number;
  workloadDistribution: {
    userId: string;
    name: string;
    activeCount: number;
  }[];
}

export interface TeamAnalyticsResponse {
  success: boolean;
  message: string;
  data: TeamAnalytics;
}

/**
 * Fetch a global productivity and workload metric snapshot across the workspace.
 */
export const getAnalyticsOverview = async (): Promise<AnalyticsOverview> => {
  const { data } = await api.get<AnalyticsOverviewResponse>('/analytics/overview');
  return data.data;
};

/**
 * Fetch dynamic team resource workload and capacity allocation metrics.
 */
export const getTeamAnalytics = async (): Promise<TeamAnalytics> => {
  const { data } = await api.get<TeamAnalyticsResponse>('/analytics/team');
  return data.data;
};

