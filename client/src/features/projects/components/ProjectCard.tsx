import { Calendar, Trash2, Edit, Users } from 'lucide-react';
import { cn } from '../../../lib/utils.js';
import type { Project } from '../api/projectApi.js';
import { useAuthStore } from '../../../store/authStore.js';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const PRIORITY_BADGES = {
  low: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  medium: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  high: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  critical: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
};

export default function ProjectCard({ project, onEdit, onDelete, className }: ProjectCardProps) {
  const user = useAuthStore((s) => s.user);

  const ownerId = typeof project.owner === 'object' ? project.owner._id : project.owner;
  const isOwner = user?.role === 'admin' || user?._id === ownerId;

  return (
    <div
      className={cn(
        'group border bg-card rounded-2xl p-5 flex flex-col justify-between shadow-2xs',
        'hover:shadow-md transition-all duration-300 hover:-translate-y-1 transform relative overflow-hidden',
        className
      )}
    >
      {/* Glow highlight */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="space-y-4">
        {/* Header pills */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-2xs font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/25 tracking-widest uppercase">
            {project.key}
          </span>
          <span className={cn('px-2.5 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wide', PRIORITY_BADGES[project.priority])}>
            {project.priority}
          </span>
        </div>

        {/* Info */}
        <div>
          <h3 className="font-heading font-extrabold text-base text-foreground truncate tracking-tight group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-2xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>

        {/* Progress scale */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-3xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Progress status</span>
            <span className="font-mono text-foreground font-bold">{project.progress}%</span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="bg-secondary text-muted-foreground text-3xs px-2 py-0.5 rounded font-mono font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="border-t pt-4 mt-5 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/75" />
          <span className="text-3xs font-bold font-mono">
            {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No deadline'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Members count */}
          <div className="flex items-center gap-1 text-3xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-md border">
            <Users className="h-3.5 w-3.5 text-primary/75" />
            <span className="font-extrabold text-foreground">{project.members?.length ?? 0}</span>
          </div>

          {/* Actions */}
          {isOwner && (
            <div className="flex items-center gap-1 border rounded-md bg-secondary/50 p-0.5">
              <button
                onClick={() => onEdit(project)}
                className="p-1 text-muted-foreground hover:text-primary hover:bg-card rounded transition-colors"
                aria-label="Edit project"
              >
                <Edit className="h-3 w-3" />
              </button>
              <button
                onClick={() => onDelete(project._id)}
                className="p-1 text-muted-foreground hover:text-destructive hover:bg-card rounded transition-colors"
                aria-label="Delete project"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
