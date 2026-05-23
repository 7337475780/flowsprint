import api from './axios.js';

export interface AnalyticsOverview {
  activeProjects: number;
  activeSprints: number;
  completedTasks: number;
  overdueTasks: number;
  taskDistribution: {
    backlog?: number;
    todo?: number;
    'in-progress'?: number;
    review?: number;
    done?: number;
  };
  velocitySummary: {
    avgVelocity: number;
    count: number;
  };
}

export interface AnalyticsOverviewResponse {
  success: boolean;
  message: string;
  data: AnalyticsOverview;
}

/**
 * Fetch a global productivity and workload metric snapshot across the workspace.
 */
export const getAnalyticsOverview = async (): Promise<AnalyticsOverview> => {
  const { data } = await api.get<AnalyticsOverviewResponse>('/analytics/overview');
  return data.data;
};
