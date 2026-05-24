import { useState } from 'react';
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

  // Local drag-and-drop state trackers
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | null>(null);
  const [isColumnDraggedOver, setIsColumnDraggedOver] = useState(false);

  const handleDragOverColumn = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsColumnDraggedOver(true);
  };

  const handleDragLeaveColumn = () => {
    setIsColumnDraggedOver(false);
    setHoveredCardId(null);
    setDropPosition(null);
  };

  const handleDragOverCard = (e: React.DragEvent, taskId: string, direction: 'above' | 'below') => {
    e.stopPropagation();
    setHoveredCardId(taskId);
    setDropPosition(direction);
  };

  const handleDragLeaveCard = () => {
    // We let the dragOver event continuously refresh it to prevent blinking
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    let targetPosition = tasks.length;

    if (hoveredCardId) {
      const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);
      const hoveredTaskIndex = sortedTasks.findIndex((t) => t._id === hoveredCardId);
      if (hoveredTaskIndex !== -1) {
        const hoveredTask = sortedTasks[hoveredTaskIndex];
        if (dropPosition === 'above') {
          targetPosition = hoveredTask.position;
        } else {
          // If placing below, we target the position of the next slot
          targetPosition = hoveredTask.position + 1;
        }
      }
    }

    // Construct the new list of tasks in the target column
    const currentTasks = [...tasks];
    const existingIndex = currentTasks.findIndex((t) => t._id === taskId);
    let draggedTask: Task;
    if (existingIndex !== -1) {
      draggedTask = currentTasks.splice(existingIndex, 1)[0];
    } else {
      draggedTask = { _id: taskId, status } as Task;
    }

    const sortedTasks = [...currentTasks].sort((a, b) => a.position - b.position);
    let targetIndex = sortedTasks.findIndex((t) => t.position >= targetPosition);
    if (targetIndex === -1) {
      targetIndex = sortedTasks.length;
    }

    sortedTasks.splice(targetIndex, 0, draggedTask);

    const reorders = sortedTasks.map((t, index) => ({
      taskId: t._id,
      status: status,
      order: index,
    }));

    reorderMutation.mutate(reorders);

    // Clean up states
    setHoveredCardId(null);
    setDropPosition(null);
    setIsColumnDraggedOver(false);
  };

  return (
    <div
      onDragOver={handleDragOverColumn}
      onDragLeave={handleDragLeaveColumn}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col h-full min-h-[550px] w-[280px] md:w-[320px] shrink-0 rounded-2xl border bg-card/65 backdrop-blur-xs shadow-3xs overflow-hidden transition-all duration-300',
        theme.border,
        isColumnDraggedOver && 'border-primary/40 bg-primary/[0.01]',
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
      <div
        className={cn(
          'flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar transition-all duration-200',
          isColumnDraggedOver && tasks.length === 0 && 'bg-primary/[0.02]'
        )}
      >
        {tasks.length === 0 ? (
          <div
            className={cn(
              'h-36 flex flex-col items-center justify-center border border-dashed rounded-xl p-4 text-center transition-all duration-200',
              isColumnDraggedOver
                ? 'border-primary/50 bg-primary/5 scale-[0.98] text-primary'
                : 'border-slate-200/80 dark:border-slate-800/80 text-muted-foreground'
            )}
          >
            <span className="text-4xs font-bold uppercase tracking-widest">
              {isColumnDraggedOver ? 'Drop card here' : 'Empty Column'}
            </span>
          </div>
        ) : (
          [...tasks]
            .sort((a, b) => a.position - b.position)
            .map((task) => {
              const showAbove = hoveredCardId === task._id && dropPosition === 'above';
              const showBelow = hoveredCardId === task._id && dropPosition === 'below';

              return (
                <div key={task._id} className="transition-all duration-200">
                  {showAbove && (
                    <div className="h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10 rounded-full border border-primary animate-pulse my-2" />
                  )}
                  <TaskCard
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onClick={onCardClick}
                    onDragOverCard={handleDragOverCard}
                    onDragLeaveCard={handleDragLeaveCard}
                  />
                  {showBelow && (
                    <div className="h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10 rounded-full border border-primary animate-pulse my-2" />
                  )}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
