import { useState } from 'react';
import { Plus, CheckSquare, Square, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils.js';
import { useToggleSubtaskMutation } from '../hooks/useTasks.js';
import type { Task, TaskSubtask } from '../api/taskApi.js';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTask } from '../api/taskApi.js';

interface SubtaskListProps {
  task: Task;
}

export default function SubtaskList({ task }: SubtaskListProps) {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState('');

  // Toggle Subtask Mutation
  const toggleMutation = useToggleSubtaskMutation(task._id);

  // Add Subtask Mutation (updates subtask list on the task)
  const addSubtaskMutation = useMutation({
    mutationFn: (newSubtasks: any[]) => updateTask(task._id, { subtasks: newSubtasks } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['task-details', task._id] });
      toast.success('Subtask added successfully!');
      setNewTitle('');
    },
  });

  const handleToggle = (subtaskId: string, currentStatus: boolean) => {
    toggleMutation.mutate({ subtaskId, completed: !currentStatus });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const currentSubtasks = task.subtasks ?? [];
    const payload = [
      ...currentSubtasks.map((s) => ({ title: s.title, completed: s.completed })),
      { title: newTitle.trim(), completed: false },
    ];

    addSubtaskMutation.mutate(payload);
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const currentSubtasks = task.subtasks ?? [];
    const payload = currentSubtasks
      .filter((s) => s._id !== subtaskId)
      .map((s) => ({ title: s.title, completed: s.completed }));

    addSubtaskMutation.mutate(payload);
  };

  const subtasks = task.subtasks ?? [];
  const completedCount = subtasks.filter((s) => s.completed).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Subtasks Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckSquare className="h-4 w-4 text-primary" />
            <span>Subtask Progress Checklist</span>
          </span>
          <span className="font-mono text-foreground">
            {completedCount}/{subtasks.length} ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist list */}
      <div className="space-y-2">
        {subtasks.length === 0 ? (
          <p className="text-2xs text-muted-foreground italic pl-1">
            No subtasks added yet. Add items below to break down the task.
          </p>
        ) : (
          subtasks.map((sub: TaskSubtask) => (
            <div
              key={sub._id}
              className="flex items-center justify-between p-2 rounded-lg border bg-secondary/20 hover:bg-secondary/40 transition-all group"
            >
              <button
                type="button"
                onClick={() => handleToggle(sub._id, sub.completed)}
                disabled={toggleMutation.isPending}
                className="flex items-center gap-2.5 text-sm font-medium text-foreground select-none"
              >
                {sub.completed ? (
                  <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className={cn('text-xs transition-all text-left line-clamp-1', sub.completed && 'line-through text-muted-foreground')}>
                  {sub.title}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDeleteSubtask(sub._id)}
                disabled={addSubtaskMutation.isPending}
                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive hover:bg-card rounded-md transition-all"
                aria-label="Delete subtask"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Subtask Form */}
      <form onSubmit={handleAddSubtask} className="flex gap-2 items-center">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add subtask breakdown..."
          disabled={addSubtaskMutation.isPending}
          className="flex-1 px-3 py-1.5 text-xs rounded-lg border bg-background outline-none focus:ring-1 focus:ring-primary/20 transition-all"
        />
        <button
          type="submit"
          disabled={!newTitle.trim() || addSubtaskMutation.isPending}
          className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
