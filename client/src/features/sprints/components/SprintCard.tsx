import { Calendar, Trash2, PlayCircle, CheckCircle2, StopCircle } from 'lucide-react';
import { cn } from '../../../lib/utils.js';
import type { Sprint } from '../api/sprintApi.js';
import { useAuthStore } from '../../../store/authStore.js';

interface SprintCardProps {
  sprint: Sprint;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect: (sprint: Sprint) => void;
  isActive: boolean;
}

const STATUS_THEMES = {
  planned: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  active: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  completed: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  cancelled: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

export default function SprintCard({
  sprint,
  onStart,
  onComplete,
  onCancel,
  onDelete,
  onSelect,
  isActive,
}: SprintCardProps) {
  const user = useAuthStore((s) => s.user);

  const ownerId = typeof sprint.owner === 'object' ? sprint.owner._id : sprint.owner;
  const isManager = user?.role === 'admin' || user?.role === 'manager' || user?._id === ownerId;

  return (
    <div
      onClick={() => onSelect(sprint)}
      className={cn(
        'group relative border bg-card rounded-2xl p-5 flex flex-col justify-between shadow-2xs cursor-pointer',
        'hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border-l-4',
        isActive ? 'border-primary shadow-xs ring-1 ring-primary/25' : 'border-l-primary/30'
      )}
    >
      <div className="space-y-4">
        {/* Header pill & Status */}
        <div className="flex items-center justify-between">
          <span className={cn('px-2.5 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wide border', STATUS_THEMES[sprint.status])}>
            {sprint.status}
          </span>
          <span className="font-mono text-3xs font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 tracking-wider">
            {typeof sprint.project === 'object' ? sprint.project.key : 'SPRINT'}
          </span>
        </div>

        {/* Title & Goal */}
        <div>
          <h4 className="font-heading font-extrabold text-base text-foreground group-hover:text-primary transition-colors truncate">
            {sprint.name}
          </h4>
          {sprint.goal ? (
            <p className="text-3xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
              {sprint.goal}
            </p>
          ) : (
            <p className="text-4xs text-muted-foreground italic mt-1">No sprint goal specified.</p>
          )}
        </div>

        {/* Progress Progress */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-3xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Milestone progress</span>
            <span className="font-mono text-foreground font-bold">{sprint.progress}%</span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${sprint.progress}%` }}
            />
          </div>
        </div>

        {/* Story points summaries */}
        <div className="flex items-center gap-3 text-3xs font-bold text-muted-foreground font-mono">
          <div>
            Planned: <span className="text-foreground">{sprint.plannedPoints} SP</span>
          </div>
          {sprint.status === 'completed' && (
            <div>
              Completed: <span className="text-foreground">{sprint.completedPoints} SP</span>
            </div>
          )}
        </div>

        {/* Retrospective feedback for completed sprints */}
        {sprint.status === 'completed' && sprint.retrospective && (
          <div className="bg-secondary/20 p-2.5 rounded-lg border border-dashed text-4xs italic text-muted-foreground leading-relaxed">
            <span className="font-bold text-foreground not-italic uppercase tracking-wider block mb-1">
              Sprint Retrospective:
            </span>
            &ldquo;{sprint.retrospective}&rdquo;
          </div>
        )}
      </div>

      {/* Footer controls & timeline */}
      <div className="border-t pt-4 mt-5 flex items-center justify-between text-3xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-primary/75" />
          <span className="font-mono font-bold">
            {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'No date'}
          </span>
          <span>-</span>
          <span className="font-mono font-bold">
            {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'No date'}
          </span>
        </div>

        {/* Agile controls */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isManager && sprint.status === 'planned' && (
            <button
              onClick={() => onStart(sprint._id)}
              className="inline-flex items-center gap-1 text-3xs font-bold uppercase text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/20"
              title="Start Sprint Cycle"
            >
              <PlayCircle className="h-3 w-3" /> Start
            </button>
          )}

          {isManager && sprint.status === 'active' && (
            <>
              <button
                onClick={() => onComplete(sprint._id)}
                className="inline-flex items-center gap-1 text-3xs font-bold uppercase text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded border border-indigo-500/20"
                title="Complete Agile Sprint"
              >
                <CheckCircle2 className="h-3 w-3" /> Complete
              </button>
              <button
                onClick={() => onCancel(sprint._id)}
                className="inline-flex items-center gap-1 text-3xs font-bold uppercase text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded border border-rose-500/20"
                title="Cancel Sprint"
              >
                <StopCircle className="h-3 w-3" /> Cancel
              </button>
            </>
          )}

          {/* Delete icon */}
          {user?.role === 'admin' && (
            <button
              onClick={() => onDelete(sprint._id)}
              className="p-1 text-muted-foreground hover:text-destructive hover:bg-secondary rounded transition-colors"
              title="Delete Sprint"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
