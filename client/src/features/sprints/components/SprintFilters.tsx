import { Loader2 } from 'lucide-react';
import type { Project } from '../../projects/api/projectApi.js';

interface SprintFiltersProps {
  projectId: string;
  status: string;
  projects: Project[];
  isLoadingProjects?: boolean;
  onProjectIdChange: (id: string) => void;
  onStatusChange: (status: string) => void;
}

export default function SprintFilters({
  projectId,
  status,
  projects,
  isLoadingProjects,
  onProjectIdChange,
  onStatusChange,
}: SprintFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
      {/* Project Selector */}
      <div className="relative flex items-center">
        {isLoadingProjects ? (
          <div className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border bg-background font-medium text-muted-foreground min-w-[180px]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading projects…
          </div>
        ) : (
          <select
            value={projectId}
            onChange={(e) => onProjectIdChange(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2.5 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium cursor-pointer min-w-[180px]"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} [{p.key}]
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Status Selector */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="flex-1 sm:flex-initial px-3 py-2.5 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium cursor-pointer"
      >
        <option value="">All Statuses</option>
        <option value="planned">Planned</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
  );
}
