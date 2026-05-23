import { ITask } from '../../types/task.js';

export interface PaginatedTasks {
  data: ITask[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskStats {
  total: number;
  overdue: number;
  completed: number;
  inProgress: number;
  blocked: number;
}
