import { memo } from 'react';
import { Calendar, MessageSquare, CheckSquare, Trash2, Edit } from 'lucide-react';
import { cn } from '../../../lib/utils.js';
import type { Task } from '../api/taskApi.js';
import { useAuthStore } from '../../../store/authStore.js';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onClick: (task: Task) => void;
  className?: string;
  onDragOverCard?: (e: React.DragEvent, taskId: string, direction: 'above' | 'below') => void;
  onDragLeaveCard?: (e: React.DragEvent) => void;
}

const PRIORITY_BADGES = {
  low: 'bg-slate-500/10 text-slate-400 border border-slate-500/20 dark:bg-slate-500/5',
  medium: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 dark:bg-indigo-500/5',
  high: 'bg-amber-500/10 text-amber-500 border border-amber-500/20 dark:bg-amber-500/5',
  critical: 'bg-rose-500/10 text-rose-500 border border-rose-500/20 dark:bg-rose-500/5',
};

const TaskCard = memo(function TaskCard({
  task,
  onEdit,
  onDelete,
  onClick,
  className,
  onDragOverCard,
  onDragLeaveCard,
}: TaskCardProps) {
  const user = useAuthStore((s) => s.user);

  const reporterId = typeof task.reporter === 'object' ? task.reporter._id : task.reporter;
  const isReporter = user?.role === 'admin' || user?._id === reporterId;

  // Calculate subtask completion
  const totalSubtasks = task.subtasks?.length ?? 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-40');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-40');
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!onDragOverCard) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const isTopHalf = relativeY < rect.height / 2;
    onDragOverCard(e, task._id, isTopHalf ? 'above' : 'below');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (onDragLeaveCard) onDragLeaveCard(e);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => onClick(task)}
      className={cn(
        'group relative border bg-card/75 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between shadow-xs cursor-grab active:cursor-grabbing',
        'hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-slate-200/80 dark:border-slate-800/80 hover:border-primary/40 dark:hover:border-primary/40 border-l-4 border-l-primary/60',
        className
      )}
    >
      <div className="space-y-3">
        {/* Priority & Project Key */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-3xs font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/25 tracking-widest uppercase">
            {task.project?.key ?? 'TASK'}
          </span>
          <span className={cn('px-2.5 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wide', PRIORITY_BADGES[task.priority])}>
            {task.priority}
          </span>
        </div>

        {/* Title */}
        <div>
          <h4 className="font-heading font-extrabold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-3xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Labels / Tags */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.map((label) => (
              <span
                key={label}
                className="bg-secondary/80 text-muted-foreground text-3xs px-2 py-0.5 rounded-md font-medium"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Subtask Checklists Bar */}
        {totalSubtasks > 0 && (
          <div className="space-y-1 pt-0.5">
            <div className="flex justify-between items-center text-3xs font-bold uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                <span>Subtasks</span>
              </span>
              <span>
                {completedSubtasks}/{totalSubtasks} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-secondary h-1 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="border-t pt-3 mt-4 flex items-center justify-between text-3xs text-muted-foreground">
        <div className="flex items-center gap-1.5 min-w-0">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-primary/70" />
          <span className="font-mono font-bold truncate">
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Comments count */}
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center gap-1 text-3xs font-bold text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>{task.comments.length}</span>
            </div>
          )}

          {/* Assignee Avatar */}
          {task.assignee ? (
            <div className="h-5.5 w-5.5 rounded-full border bg-secondary overflow-hidden shrink-0" title={task.assignee.name}>
              {task.assignee.avatar ? (
                <img src={task.assignee.avatar} alt={task.assignee.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-bold text-3xs text-foreground uppercase bg-primary/20">
                  {task.assignee.name.charAt(0)}
                </div>
              )}
            </div>
          ) : (
            <div className="h-5.5 w-5.5 rounded-full border border-dashed flex items-center justify-center shrink-0 bg-secondary/30" title="Unassigned">
              <span className="text-3xs font-bold text-muted-foreground">?</span>
            </div>
          )}

          {/* Action buttons for owner */}
          {isReporter && (
            <div
              className="flex items-center gap-0.5 border rounded-md bg-secondary/50 p-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onEdit(task)}
                className="p-0.5 text-muted-foreground hover:text-primary hover:bg-card rounded transition-colors"
                aria-label="Edit task"
              >
                <Edit className="h-2.5 w-2.5" />
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="p-0.5 text-muted-foreground hover:text-destructive hover:bg-card rounded transition-colors"
                aria-label="Delete task"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}, (prev, next) => {
  return (
    prev.task._id === next.task._id &&
    prev.task.status === next.task.status &&
    prev.task.position === next.task.position &&
    prev.task.title === next.task.title &&
    prev.task.description === next.task.description &&
    prev.task.priority === next.task.priority &&
    prev.task.dueDate === next.task.dueDate &&
    prev.task.assignee?._id === next.task.assignee?._id &&
    prev.task.assignee?.avatar === next.task.assignee?.avatar &&
    prev.task.comments?.length === next.task.comments?.length &&
    prev.task.subtasks?.length === next.task.subtasks?.length &&
    prev.task.subtasks?.every((sub, i) => sub.completed === next.task.subtasks?.[i]?.completed) &&
    prev.className === next.className
  );
});

export default TaskCard;
