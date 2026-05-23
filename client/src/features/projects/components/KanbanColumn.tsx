import { Calendar, Trash2, Edit, Users } from 'lucide-react';
import { cn } from '../../../lib/utils.js';
import type { Project } from '../api/projectApi.js';
import { useAuthStore } from '../../../store/authStore.js';
import { useUpdateProjectMutation } from '../hooks/useProjects.js';

interface KanbanColumnProps {
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  title: string;
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_BADGES = {
  low: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  medium: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  high: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  critical: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
};

const COLUMN_THEMES = {
  planning: {
    dot: 'bg-blue-500',
    border: 'border-t-blue-500',
    bg: 'bg-blue-500/5',
    text: 'text-blue-500',
  },
  active: {
    dot: 'bg-emerald-500',
    border: 'border-t-emerald-500',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-500',
  },
  'on-hold': {
    dot: 'bg-amber-500',
    border: 'border-t-amber-500',
    bg: 'bg-amber-500/5',
    text: 'text-amber-500',
  },
  completed: {
    dot: 'bg-violet-500',
    border: 'border-t-violet-500',
    bg: 'bg-violet-500/5',
    text: 'text-violet-500',
  },
};

// ─── Kanban Project Card Component ───────────────────────────────────────────
interface KanbanProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

function KanbanProjectCard({ project, onEdit, onDelete }: KanbanProjectCardProps) {
  const user = useAuthStore((s) => s.user);
  const ownerId = typeof project.owner === 'object' ? project.owner._id : project.owner;
  const isOwner = user?.role === 'admin' || user?._id === ownerId;

  // Mutation Hook to update this specific project
  const updateMutation = useUpdateProjectMutation(project._id);

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === project.status) return;
    updateMutation.mutate({
      status: newStatus as any,
    });
  };

  return (
    <div className="group relative border bg-card rounded-xl p-4 shadow-3xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border-l-3 border-l-primary/30">
      <div className="space-y-3">
        {/* Header metadata */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-3xs font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/25 tracking-widest uppercase">
            {project.key}
          </span>
          <span className={cn('px-2 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wide', PRIORITY_BADGES[project.priority])}>
            {project.priority}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h5 className="font-heading font-extrabold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {project.name}
          </h5>
          {project.description && (
            <p className="text-3xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>

        {/* Progress status */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-3xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Progress</span>
            <span className="font-mono text-foreground font-bold">{project.progress}%</span>
          </div>
          <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Quick Status Dropdown */}
        <div className="space-y-1">
          <label className="text-3xs font-bold uppercase tracking-wider text-muted-foreground block">
            Transition Status
          </label>
          <select
            value={project.status}
            disabled={updateMutation.isPending}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-2 py-1 text-3xs font-semibold rounded border bg-background text-foreground outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
          >
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="border-t pt-3 mt-3.5 flex items-center justify-between text-3xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 shrink-0 text-primary/75" />
          <span className="font-mono font-bold">
            {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No date'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Members Count */}
          <div className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded border">
            <Users className="h-3 w-3 text-primary/75" />
            <span className="font-extrabold text-foreground">{project.members?.length ?? 0}</span>
          </div>

          {/* Actions */}
          {isOwner && (
            <div className="flex items-center gap-0.5 border rounded bg-secondary/50 p-0.5">
              <button
                onClick={() => onEdit(project)}
                className="p-0.5 text-muted-foreground hover:text-primary hover:bg-card rounded transition-colors"
                aria-label="Edit project"
              >
                <Edit className="h-2.5 w-2.5" />
              </button>
              <button
                onClick={() => onDelete(project._id)}
                className="p-0.5 text-muted-foreground hover:text-destructive hover:bg-card rounded transition-colors"
                aria-label="Delete project"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Kanban Column Component ────────────────────────────────────────────
export default function KanbanColumn({
  status,
  title,
  projects,
  onEdit,
  onDelete,
}: KanbanColumnProps) {
  const theme = COLUMN_THEMES[status];

  return (
    <div
      className={cn(
        'flex flex-col h-full min-h-[500px] rounded-2xl border bg-card/60 backdrop-blur-xs shadow-3xs overflow-hidden',
        theme.border
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', theme.dot)} />
          <h4 className="font-heading font-extrabold text-sm tracking-tight text-foreground">
            {title}
          </h4>
          <span className="font-mono text-3xs font-extrabold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border">
            {projects.length}
          </span>
        </div>
      </div>

      {/* Projects List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
        {projects.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center border border-dashed rounded-xl p-4 text-center">
            <span className="text-3xs font-bold uppercase tracking-widest text-muted-foreground">
              Empty Column
            </span>
          </div>
        ) : (
          projects.map((project) => (
            <KanbanProjectCard
              key={project._id}
              project={project}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
