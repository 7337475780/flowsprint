import { IProject } from '../../types/project.js';

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  onHold: number;
  overdue: number;
  archived: number;
}

export interface PaginatedProjects {
  data: IProject[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
