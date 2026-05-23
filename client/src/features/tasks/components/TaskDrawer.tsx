import { X, Calendar, User, Zap, Hourglass, ShieldAlert, Paperclip, ClipboardList } from 'lucide-react';
import { cn } from '../../../lib/utils.js';
import { useTaskDetailsQuery, useUpdateTaskStatusMutation } from '../hooks/useTasks.js';
import SubtaskList from './SubtaskList.js';
import CommentThread from './CommentThread.js';

interface TaskDrawerProps {
  taskId: string | null;
  onClose: () => void;
}

const PRIORITY_THEMES = {
  low: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  medium: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  high: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  critical: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
};

const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'Todo' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Completed' },
];

export default function TaskDrawer({ taskId, onClose }: TaskDrawerProps) {
  const { data: task, isLoading, error } = useTaskDetailsQuery(taskId ?? '');
  const statusMutation = useUpdateTaskStatusMutation(task?._id ?? '');

  if (!taskId) return null;

  const handleStatusChange = (newStatus: string) => {
    statusMutation.mutate(newStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={onClose} />

      {/* Slideout Container */}
      <div className="relative w-full max-w-xl border-l bg-card shadow-2xl z-10 flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-secondary/10">
          <div className="flex items-center gap-2">
            <span className="font-mono text-3xs font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 tracking-wider">
              {task?.project?.key ?? 'TASK'}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">Task Details</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition-colors"
            aria-label="Close panel"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <div className="h-6 w-6 border-2 border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground font-medium">Fetching details...</p>
          </div>
        ) : error || !task ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm text-destructive font-medium">Failed to retrieve task details</p>
            <button onClick={onClose} className="mt-2 text-xs text-primary underline">
              Close Panel
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col divide-y">
            {/* 1. Core Meta */}
            <div className="p-6 space-y-4">
              <h3 className="font-heading font-extrabold text-lg tracking-tight text-foreground">
                {task.title}
              </h3>

              {task.description ? (
                <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/10 border p-3.5 rounded-xl whitespace-pre-wrap">
                  {task.description}
                </p>
              ) : (
                <p className="text-2xs text-muted-foreground italic">No description provided.</p>
              )}

              {/* Quick Status Shift selector */}
              <div className="flex items-center gap-3">
                <span className="text-3xs font-extrabold uppercase tracking-widest text-muted-foreground">
                  Task Status
                </span>
                <select
                  value={task.status}
                  disabled={statusMutation.isPending}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-2 py-1 text-2xs font-bold rounded border bg-background text-foreground outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Parameters Grid */}
            <div className="p-6 grid grid-cols-2 gap-4 text-2xs">
              {/* Left Column Parameters */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                  <span className="font-semibold w-16 shrink-0">Assignee:</span>
                  <span className="font-extrabold text-foreground truncate">
                    {task.assignee?.name ?? 'Unassigned'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                  <span className="font-semibold w-16 shrink-0">Priority:</span>
                  <span className={cn('px-2 py-0.5 rounded font-extrabold uppercase text-3xs border shrink-0', PRIORITY_THEMES[task.priority])}>
                    {task.priority}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                  <span className="font-semibold w-16 shrink-0">Due Date:</span>
                  <span className="font-bold text-foreground">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                  </span>
                </div>
              </div>

              {/* Right Column Parameters */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hourglass className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                  <span className="font-semibold w-16 shrink-0">Estimate:</span>
                  <span className="font-mono font-bold text-foreground">
                    {task.estimatedHours ? `${task.estimatedHours} hrs` : 'No estimate'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hourglass className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                  <span className="font-semibold w-16 shrink-0">Spent:</span>
                  <span className="font-mono font-bold text-foreground">
                    {task.spentHours ? `${task.spentHours} hrs` : '0 hrs'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldAlert className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                  <span className="font-semibold w-16 shrink-0">Story Pts:</span>
                  <span className="font-mono font-bold text-foreground">
                    {task.storyPoints ?? 0} pts
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Subtasks checklist */}
            <div className="p-6">
              <SubtaskList task={task} />
            </div>

            {/* 4. Comments discuss */}
            <div className="p-6">
              <CommentThread task={task} />
            </div>

            {/* 5. Attachments Section (Premium UI Placeholder) */}
            <div className="p-6 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Paperclip className="h-4 w-4 text-primary" />
                <span>Task Attachments</span>
              </div>
              <div className="border border-dashed rounded-xl p-4 text-center bg-secondary/5 flex flex-col items-center justify-center gap-1">
                <Paperclip className="h-5 w-5 text-muted-foreground opacity-60" />
                <span className="text-3xs font-extrabold uppercase tracking-widest text-muted-foreground">
                  Drag assets here
                </span>
                <span className="text-4xs text-muted-foreground">
                  Supports PDF, PNG, JPG up to 10MB
                </span>
              </div>
            </div>

            {/* 6. Activity log stream (Chronological log display!) */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <ClipboardList className="h-4 w-4 text-primary" />
                <span>Changelog & Activity History</span>
              </div>
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-secondary">
                {task.activities && task.activities.length > 0 ? (
                  task.activities.map((act) => (
                    <div key={act._id} className="flex gap-3 items-start relative pl-1">
                      <div className="h-6 w-6 rounded-full border bg-card flex items-center justify-center shrink-0 z-10 text-3xs font-bold text-primary shadow-3xs">
                        {act.action.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-2xs text-muted-foreground leading-normal font-medium">
                          {act.details}
                        </p>
                        <span className="font-mono text-4xs text-muted-foreground block mt-0.5">
                          {new Date(act.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-2xs text-muted-foreground italic pl-1">No activities logged yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
