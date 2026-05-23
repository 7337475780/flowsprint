interface ProjectFiltersProps {
  status: string;
  priority: string;
  archived: string;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onArchivedChange: (archived: string) => void;
}

/**
 * Filter select selectors for project prioritization and statuses.
 */
export default function ProjectFilters({
  status,
  priority,
  archived,
  onStatusChange,
  onPriorityChange,
  onArchivedChange,
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
      {/* Status Filter */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="flex-1 sm:flex-initial px-3 py-2.5 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium cursor-pointer"
      >
        <option value="">All Statuses</option>
        <option value="planning">Planning</option>
        <option value="active">Active</option>
        <option value="on-hold">On Hold</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {/* Priority Filter */}
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

      {/* Archive State Filter */}
      <select
        value={archived}
        onChange={(e) => onArchivedChange(e.target.value)}
        className="flex-1 sm:flex-initial px-3 py-2.5 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium cursor-pointer"
      >
        <option value="false">Active Projects</option>
        <option value="true">Archived Projects</option>
      </select>
    </div>
  );
}
