import api from '../../../api/axios.js';
import type { User } from '../../../api/authApi.js';

export interface TaskComment {
  _id: string;
  author: User;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskSubtask {
  _id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskActivity {
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
  project: { _id: string; name: string; key: string };
  projectId?: string;
  sprintId?: string;
  assignee?: User;
  reporter: User;
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  labels: string[];
  dueDate?: string;
  estimatedHours?: number;
  spentHours?: number;
  storyPoints?: number;
  position: number;
  attachments: string[];
  archived: boolean;
  isArchived?: boolean;
  subtasks: TaskSubtask[];
  comments: TaskComment[];
  activities: TaskActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  projectId: string;
  sprintId?: string | null;
  assignee?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  dueDate?: string | null;
  labels?: string[];
  estimatedHours?: number;
  spentHours?: number;
  storyPoints?: number;
}

export interface PaginatedTasksResponse {
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

export interface TaskStats {
  total: number;
  overdue: number;
  completed: number;
  inProgress: number;
  blocked: number;
}

export interface TaskStatsResponse {
  success: boolean;
  message: string;
  data: TaskStats;
}

/**
 * Get paginated, sorted and filtered task lists.
 */
export const getTasks = async (params?: Record<string, any>): Promise<PaginatedTasksResponse['data']> => {
  const { data } = await api.get<any>('/tasks', { params });
  return {
    tasks: data.data.data,
    total: data.data.total,
    page: data.data.page,
    pages: data.data.totalPages,
  };
};

/**
 * Fetch detailed task variables.
 */
export const getTaskById = async (id: string): Promise<Task> => {
  const { data } = await api.get<TaskResponse>(`/tasks/${id}`);
  return data.data;
};

/**
 * Establish a new task.
 */
export const createTask = async (payload: TaskInput): Promise<Task> => {
  const { data } = await api.post<TaskResponse>('/tasks', payload);
  return data.data;
};

/**
 * Modify task fields (partial updates).
 */
export const updateTask = async (id: string, payload: Partial<TaskInput> & { archived?: boolean }): Promise<Task> => {
  const { data } = await api.patch<TaskResponse>(`/tasks/${id}`, payload);
  return data.data;
};

/**
 * Hard delete a task workspace item.
 */
export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

/**
 * Move a task status and optionally order position.
 */
export const moveTask = async (id: string, status: string, position?: number): Promise<Task> => {
  const { data } = await api.patch<TaskResponse>(`/tasks/${id}/move`, { status, position });
  return data.data;
};

/**
 * Quick status column transition (fallback wrapper around moveTask).
 */
export const updateTaskStatus = async (id: string, status: string): Promise<Task> => {
  return await moveTask(id, status);
};

/**
 * Drag & Drop batch task reordering.
 */
export const reorderTasks = async (
  reorders: { taskId: string; status: Task['status']; order: number }[]
): Promise<void> => {
  await api.patch('/tasks/reorder', { reorders });
};

/**
 * Append a comment to the task discussion logs.
 */
export const addComment = async (id: string, text: string): Promise<Task> => {
  const { data } = await api.post<TaskResponse>(`/tasks/${id}/comments`, { text });
  return data.data;
};

/**
 * Checkbox toggle subtask checklist item.
 */
export const toggleSubtask = async (taskId: string, subtaskId: string, completed: boolean): Promise<Task> => {
  const { data } = await api.patch<TaskResponse>(`/tasks/${taskId}/subtasks/${subtaskId}`, { completed });
  return data.data;
};

/**
 * Get task aggregate KPIs overview.
 */
export const getTaskStats = async (projectId?: string): Promise<TaskStats> => {
  const { data } = await api.get<TaskStatsResponse>('/tasks/stats/overview', { params: { projectId } });
  return data.data;
};
