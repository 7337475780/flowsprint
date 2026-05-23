import type { Project } from '../../projects/api/projectApi.js';

export interface TaskFiltersProps {
  projectId: string;
  sprintId: string;
  status: string;
  priority: string;
  archived: string;
  projects: Project[];
  sprints: { _id: string; name: string }[];
  onProjectIdChange: (id: string) => void;
  onSprintIdChange: (id: string) => void;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onArchivedChange: (archived: string) => void;
}

export default function TaskFilters({
  projectId,
  sprintId,
  status,
  priority,
  archived,
  projects,
  sprints,
  onProjectIdChange,
  onSprintIdChange,
  onStatusChange,
  onPriorityChange,
  onArchivedChange,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
      {/* Project Selector */}
      <select
        value={projectId}
        onChange={(e) => onProjectIdChange(e.target.value)}
        className="flex-1 sm:flex-initial px-3 py-2.5 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium cursor-pointer"
      >
        <option value="">All Projects</option>
        {projects.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name} [{p.key}]
          </option>
        ))}
      </select>

      {/* Sprint Selector */}
      <select
        value={sprintId}
        onChange={(e) => onSprintIdChange(e.target.value)}
        className="flex-1 sm:flex-initial px-3 py-2.5 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium cursor-pointer"
        disabled={!projectId}
      >
        <option value="">All Sprints</option>
        {sprints.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* Status Selector */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="flex-1 sm:flex-initial px-3 py-2.5 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium cursor-pointer"
      >
        <option value="">All Statuses</option>
        <option value="backlog">Backlog</option>
        <option value="todo">Todo</option>
        <option value="in-progress">In Progress</option>
        <option value="review">Review</option>
        <option value="done">Done</option>
      </select>

      {/* Priority Selector */}
      <select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="flex-1 sm:flex-initial px-3 py-2.5 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium cursor-pointer"
      >
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>

      {/* Archived Selector */}
      <select
        value={archived}
        onChange={(e) => onArchivedChange(e.target.value)}
        className="flex-1 sm:flex-initial px-3 py-2.5 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium cursor-pointer"
      >
        <option value="false">Active Tasks</option>
        <option value="true">Archived Tasks</option>
      </select>
    </div>
  );
}
