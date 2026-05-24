import { cn } from '../../../lib/utils.js';
import type { Task } from '../api/taskApi.js';
import TaskCard from './TaskCard.js';
import { useReorderTasksMutation } from '../hooks/useTasks.js';

interface TaskColumnProps {
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onCardClick: (task: Task) => void;
}

const COLUMN_THEMES = {
  backlog: {
    dot: 'bg-slate-500',
    border: 'border-t-slate-500',
    bg: 'bg-slate-500/5',
  },
  todo: {
    dot: 'bg-blue-500',
    border: 'border-t-blue-500',
    bg: 'bg-blue-500/5',
  },
  'in-progress': {
    dot: 'bg-amber-500',
    border: 'border-t-amber-500',
    bg: 'bg-amber-500/5',
  },
  review: {
    dot: 'bg-violet-500',
    border: 'border-t-violet-500',
    bg: 'bg-violet-500/5',
  },
  done: {
    dot: 'bg-emerald-500',
    border: 'border-t-emerald-500',
    bg: 'bg-emerald-500/5',
  },
};

export default function TaskColumn({
  status,
  title,
  tasks,
  onEdit,
  onDelete,
  onCardClick,
}: TaskColumnProps) {
  const theme = COLUMN_THEMES[status];
  const reorderMutation = useReorderTasksMutation();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Drop at the bottom of the target status column
    const targetPosition = tasks.length;
    reorderMutation.mutate({ id: taskId, status, position: targetPosition });
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col h-full min-h-[550px] w-[280px] md:w-[320px] shrink-0 rounded-2xl border bg-card/65 backdrop-blur-xs shadow-3xs overflow-hidden transition-all duration-300',
        theme.border,
        reorderMutation.isPending && 'opacity-60 cursor-wait'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <span className={cn('h-2.5 w-2.5 rounded-full animate-pulse', theme.dot)} />
          <h4 className="font-heading font-extrabold text-xs tracking-tight text-foreground">
            {title}
          </h4>
          <span className="font-mono text-3xs font-extrabold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Task Cards container */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="h-36 flex flex-col items-center justify-center border border-dashed rounded-xl p-4 text-center">
            <span className="text-4xs font-bold uppercase tracking-widest text-muted-foreground">
              Empty Column
            </span>
          </div>
        ) : (
          tasks
            .sort((a, b) => a.position - b.position)
            .map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onClick={onCardClick}
              />
            ))
        )}
      </div>
    </div>
  );
}
