import { ISprint } from '../../types/sprint.js';

export interface PaginatedSprints {
  sprints: ISprint[];
  total: number;
  page: number;
  pages: number;
}
