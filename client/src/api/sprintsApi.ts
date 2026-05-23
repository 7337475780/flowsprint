import api from './axios.js';
import type { User } from './authApi.js';
import type { Task } from './tasksApi.js';

export interface Sprint {
  _id: string;
  name: string;
  project: string | { _id: string; name: string };
  startDate?: string;
  endDate?: string;
  goal?: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  tasks: string[] | Task[];
  owner: User;
  members: User[];
  plannedPoints: number;
  completedPoints: number;
  progress: number;
  velocity: number;
  retrospective?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SprintInput {
  name: string;
  project: string;
  startDate?: string;
  endDate?: string;
  goal?: string;
  tasks?: string[];
  members?: string[];
}

export interface SprintsResponse {
  success: boolean;
  message: string;
  data: {
    sprints: Sprint[];
    total: number;
    page: number;
    pages: number;
  };
}

export interface SprintDetailsResponse {
  success: boolean;
  message: string;
  data: Sprint & {
    stats: {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
      plannedPoints: number;
      completedPoints: number;
      progress: number;
    };
  };
}

export interface BurndownDataPoint {
  date: string;
  ideal: number;
  remaining: number;
}

export interface BurndownResponse {
  success: boolean;
  message: string;
  data: {
    sprintName: string;
    totalPoints: number;
    startDate: string;
    endDate: string;
    status: Sprint['status'];
    data: BurndownDataPoint[];
  };
}

export interface SprintAnalyticsResponse {
  success: boolean;
  message: string;
  data: {
    sprint: {
      id: string;
      name: string;
      status: Sprint['status'];
      velocity: number;
    };
    completionRate: number;
    total: number;
    completed: number;
    overdue: { id: string; title: string; dueDate?: string }[];
    teamOutput: { name: string; avatar?: string; completed: number; total: number }[];
    avgCompletionDays: number;
    plannedPoints: number;
    completedPoints: number;
    velocity: number;
  };
}

/**
 * Get paginated and filtered sprints.
 */
export const getSprints = async (params?: Record<string, any>): Promise<SprintsResponse['data']> => {
  const { data } = await api.get<SprintsResponse>('/sprints', { params });
  return data.data;
};

/**
 * Get sprint details with live stats and populated tasks.
 */
export const getSprintById = async (id: string): Promise<SprintDetailsResponse['data']> => {
  const { data } = await api.get<SprintDetailsResponse>(`/sprints/${id}`);
  return data.data;
};

/**
 * Create a new planned sprint.
 */
export const createSprint = async (payload: SprintInput): Promise<Sprint> => {
  const { data } = await api.post<{ success: boolean; data: Sprint }>('/sprints', payload);
  return data.data;
};

/**
 * Update sprint fields.
 */
export const updateSprint = async (id: string, payload: Partial<SprintInput>): Promise<Sprint> => {
  const { data } = await api.put<{ success: boolean; data: Sprint }>(`/sprints/${id}`, payload);
  return data.data;
};

/**
 * Delete a sprint.
 */
export const deleteSprint = async (id: string): Promise<void> => {
  await api.delete(`/sprints/${id}`);
};

/**
 * Start a planned sprint.
 */
export const startSprint = async (id: string): Promise<Sprint> => {
  const { data } = await api.patch<{ success: boolean; data: Sprint }>(`/sprints/${id}/start`);
  return data.data;
};

/**
 * Close an active sprint and calculate final velocity with comments.
 */
export const endSprint = async (id: string, retrospective?: string): Promise<Sprint> => {
  const { data } = await api.patch<{ success: boolean; data: Sprint }>(`/sprints/${id}/end`, { retrospective });
  return data.data;
};

/**
 * Cancel a sprint.
 */
export const cancelSprint = async (id: string): Promise<Sprint> => {
  const { data } = await api.patch<{ success: boolean; data: Sprint }>(`/sprints/${id}/cancel`);
  return data.data;
};

/**
 * Assign or remove a batch of tasks directly to/from a sprint.
 */
export const manageSprintTasks = async (
  id: string,
  taskIds: string[],
  action: 'add' | 'remove'
): Promise<Sprint> => {
  const { data } = await api.patch<{ success: boolean; data: Sprint }>(`/sprints/${id}/tasks`, {
    taskIds,
    action,
  });
  return data.data;
};

/**
 * Fetch daily burndown data points.
 */
export const getSprintBurndown = async (id: string): Promise<BurndownResponse['data']> => {
  const { data } = await api.get<BurndownResponse>(`/sprints/${id}/burndown`);
  return data.data;
};

/**
 * Get full in-depth analytics report for a sprint.
 */
export const getSprintAnalytics = async (id: string): Promise<SprintAnalyticsResponse['data']> => {
  const { data } = await api.get<SprintAnalyticsResponse>(`/sprints/${id}/analytics`);
  return data.data;
};
