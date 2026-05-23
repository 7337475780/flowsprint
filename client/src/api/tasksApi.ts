import api from './axios.js';
import type { User } from './authApi.js';

export interface Comment {
  _id: string;
  author: User;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  action: 'created' | 'assigned' | 'moved' | 'commented' | 'updated' | 'archived';
  performedBy: User;
  details?: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  project: string | { _id: string; name: string };
  assignee?: User;
  reporter: User;
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  labels: string[];
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  storyPoints: number;
  order: number;
  attachments: string[];
  isArchived: boolean;
  comments: Comment[];
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  project: string;
  assignee?: string;
  status?: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  labels?: string[];
  dueDate?: string;
  estimatedHours?: number;
  storyPoints?: number;
}

export interface TasksResponse {
  success: boolean;
  message: string;
  data: {
    tasks: Task[];
    total: number;
    page: number;
    pages: number;
  };
}

export interface TaskResponse {
  success: boolean;
  message: string;
  data: Task;
}

/**
 * Get paginated and filtered tasks.
 */
export const getTasks = async (params?: Record<string, any>): Promise<TasksResponse['data']> => {
  const { data } = await api.get<TasksResponse>('/tasks', { params });
  return data.data;
};

/**
 * Get task details by ID (including comments and activities).
 */
export const getTaskById = async (id: string): Promise<Task> => {
  const { data } = await api.get<TaskResponse>(`/tasks/${id}`);
  return data.data;
};

/**
 * Create a new task in a project.
 */
export const createTask = async (payload: TaskInput): Promise<Task> => {
  const { data } = await api.post<TaskResponse>('/tasks', payload);
  return data.data;
};

/**
 * Update an existing task.
 */
export const updateTask = async (id: string, payload: Partial<TaskInput>): Promise<Task> => {
  const { data } = await api.put<TaskResponse>(`/tasks/${id}`, payload);
  return data.data;
};

/**
 * Delete a task.
 */
export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

/**
 * Move a task's status and order position.
 */
export const moveTask = async (
  id: string,
  status: Task['status'],
  position?: number
): Promise<Task> => {
  const { data } = await api.patch<TaskResponse>(`/tasks/${id}/move`, {
    status,
    position,
  });
  return data.data;
};

/**
 * Reorder a batch of tasks (for drag and drop sorting).
 */
export const reorderTasks = async (
  reorders: { taskId: string; status: Task['status']; order: number }[]
): Promise<void> => {
  await api.patch('/tasks/reorder', { reorders });
};

/**
 * Add a comment to the task's discussion thread.
 */
export const addComment = async (taskId: string, text: string): Promise<Comment> => {
  const { data } = await api.post<{ success: boolean; data: Comment }>(`/tasks/${taskId}/comments`, { text });
  return data.data;
};

/**
 * Modify an existing comment.
 */
export const editComment = async (taskId: string, commentId: string, text: string): Promise<Comment> => {
  const { data } = await api.put<{ success: boolean; data: Comment }>(`/tasks/${taskId}/comments/${commentId}`, { text });
  return data.data;
};

/**
 * Delete a comment from the discussion thread.
 */
export const deleteComment = async (taskId: string, commentId: string): Promise<void> => {
  await api.delete(`/tasks/${taskId}/comments/${commentId}`);
};
