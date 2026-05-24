import api from '../../../api/axios.js';
import type { User } from '../../../api/authApi.js';

export interface Project {
  _id: string;
  name: string;
  key: string;
  slug: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate?: string;
  dueDate?: string;
  owner: User;
  members: User[];
  tags: string[];
  progress: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInput {
  name: string;
  key: string;
  description?: string;
  status?: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  startDate?: string;
  dueDate?: string;
  tags?: string[];
  members?: string[];
}

export interface PaginatedProjectsResponse {
  success: boolean;
  message: string;
  data: {
    data: Project[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProjectResponse {
  success: boolean;
  message: string;
  data: Project;
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  onHold: number;
  overdue: number;
  archived: number;
}

export interface ProjectStatsResponse {
  success: boolean;
  message: string;
  data: ProjectStats;
}

/**
 * Get paginated and filtered MERN projects.
 */
export const getProjects = async (params?: Record<string, any>): Promise<PaginatedProjectsResponse['data']> => {
  const { data } = await api.get<PaginatedProjectsResponse>('/projects', { params });
  return data.data;
};

/**
 * Fetch a single project.
 */
export const getProjectById = async (id: string): Promise<Project> => {
  const { data } = await api.get<ProjectResponse>(`/projects/${id}`);
  return data.data;
};

/**
 * Create a new project.
 */
export const createProject = async (payload: ProjectInput): Promise<Project> => {
  const { data } = await api.post<ProjectResponse>('/projects', payload);
  return data.data;
};

/**
 * Update project details using standard PATCH.
 */
export const updateProject = async (id: string, payload: Partial<ProjectInput>): Promise<Project> => {
  const { data } = await api.patch<ProjectResponse>(`/projects/${id}`, payload);
  return data.data;
};

/**
 * Delete a project.
 */
export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/projects/${id}`);
};

/**
 * Get project statistics.
 */
export const getProjectStats = async (): Promise<ProjectStats> => {
  const { data } = await api.get<ProjectStatsResponse>('/projects/stats/overview');
  return data.data;
};
