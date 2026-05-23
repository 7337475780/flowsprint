import api from './axios.js';
import type { User } from './authApi.js';

export interface ProjectInput {
  name: string;
  description?: string;
  status?: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  tags?: string[];
}

export interface Project {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  tags: string[];
  owner: User;
  members: User[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  success: boolean;
  message: string;
  data: {
    projects: Project[];
    total: number;
    page: number;
    pages: number;
  };
}

export interface ProjectResponse {
  success: boolean;
  message: string;
  data: Project;
}

/**
 * Get paginated and filtered project listings.
 */
export const getProjects = async (params?: Record<string, any>): Promise<ProjectsResponse['data']> => {
  const { data } = await api.get<ProjectsResponse>('/projects', { params });
  return data.data;
};

/**
 * Get details for a single project workspace.
 */
export const getProjectById = async (id: string): Promise<Project> => {
  const { data } = await api.get<ProjectResponse>(`/projects/${id}`);
  return data.data;
};

/**
 * Create a new project space (Admin/Manager only).
 */
export const createProject = async (payload: ProjectInput): Promise<Project> => {
  const { data } = await api.post<ProjectResponse>('/projects', payload);
  return data.data;
};

/**
 * Update an existing project's metadata parameters.
 */
export const updateProject = async (id: string, payload: Partial<ProjectInput>): Promise<Project> => {
  const { data } = await api.put<ProjectResponse>(`/projects/${id}`, payload);
  return data.data;
};

/**
 * Remove a project (Owner/Admin only).
 */
export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/projects/${id}`);
};

/**
 * Assign or unassign teammates from the project workspace.
 */
export const manageProjectMembers = async (
  projectId: string,
  memberId: string,
  action: 'add' | 'remove'
): Promise<Project> => {
  const { data } = await api.patch<ProjectResponse>(`/projects/${projectId}/members`, {
    memberId,
    action,
  });
  return data.data;
};
