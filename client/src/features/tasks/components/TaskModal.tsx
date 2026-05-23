import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils.js';
import type { Task, TaskInput } from '../api/taskApi.js';
import { useProjectsQuery, useProjectDetailsQuery } from '../../projects/hooks/useProjects.js';
import { useSprints } from '../../../hooks/useSprints.js';

const taskValidationSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().optional(),
  projectId: z.string().min(1, 'Project selection is required'),
  sprintId: z.string().optional().nullable(),
  assignee: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  status: z.enum(['backlog', 'todo', 'in-progress', 'review', 'done']).default('backlog'),
  dueDate: z.string().optional().nullable(),
  labelsInput: z.string().optional(),
  estimatedHours: z.number().min(0).optional().nullable(),
  spentHours: z.number().min(0).optional().nullable(),
  storyPoints: z.number().min(0).optional().nullable(),
});

type TaskFormValues = z.infer<typeof taskValidationSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TaskInput) => Promise<void>;
  task?: Task | null;
}

export default function TaskModal({ isOpen, onClose, onSubmit, task }: TaskModalProps) {
  const isEdit = !!task;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskValidationSchema),
    defaultValues: {
      status: 'backlog',
      priority: 'medium',
      estimatedHours: null,
      spentHours: null,
      storyPoints: null,
    },
  });

  const watchedProjectId = watch('projectId');

  // Query projects for Project Selector
  const { data: projectsData } = useProjectsQuery({ limit: 100 });
  const projectsList = projectsData?.data ?? [];

  // Query detailed project to get the members
  const { data: selectedProject } = useProjectDetailsQuery(watchedProjectId);
  const assigneesList = selectedProject?.members ?? [];

  // Query sprints of the selected project
  const { data: sprintsData } = useSprints({ project: watchedProjectId, limit: 100 });
  const sprintsList = sprintsData?.sprints ?? [];

  // Set default values when editing triggers
  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        projectId: task.project?._id || '',
        sprintId: task.sprintId || '',
        assignee: task.assignee?._id || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        labelsInput: task.labels ? task.labels.join(', ') : '',
        estimatedHours: task.estimatedHours ?? null,
        spentHours: task.spentHours ?? null,
        storyPoints: task.storyPoints ?? null,
      });
    } else {
      reset({
        title: '',
        description: '',
        projectId: '',
        sprintId: '',
        assignee: '',
        priority: 'medium',
        status: 'backlog',
        dueDate: '',
        labelsInput: '',
        estimatedHours: null,
        spentHours: null,
        storyPoints: null,
      });
    }
  }, [task, reset]);

  // When project changes, optionally reset assignee and sprint to prevent orphan references
  useEffect(() => {
    if (watchedProjectId && task && task.project?._id !== watchedProjectId) {
      setValue('assignee', '');
      setValue('sprintId', '');
    }
  }, [watchedProjectId, setValue, task]);

  const handleFormSubmit = async (values: TaskFormValues) => {
    const payload: TaskInput = {
      title: values.title,
      description: values.description || '',
      projectId: values.projectId,
      sprintId: values.sprintId || null,
      assignee: values.assignee || null,
      priority: values.priority,
      status: values.status,
      dueDate: values.dueDate || null,
      estimatedHours: values.estimatedHours ?? undefined,
      spentHours: values.spentHours ?? undefined,
      storyPoints: values.storyPoints ?? undefined,
      labels: values.labelsInput
        ? values.labelsInput
            .split(',')
            .map((l) => l.trim())
            .filter(Boolean)
        : [],
    };
    await onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl border bg-card rounded-2xl p-6 shadow-xl z-10 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="font-heading font-extrabold text-xl tracking-tight mb-1">
          {isEdit ? 'Modify Task Details' : 'Create New Agile Task'}
        </h3>
        <p className="text-2xs text-muted-foreground mb-6">
          Fill in task metadata, estimate parameters, and assign team roles.
        </p>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
              Task Title
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Implement drag-and-drop Kanban reordering"
              className={cn(
                'w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none transition-all',
                'focus:ring-2 focus:ring-primary/20 focus:border-primary',
                errors.title && 'border-destructive focus:ring-destructive/10'
              )}
            />
            {errors.title && <p className="text-2xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
              Description / Scope
            </label>
            <textarea
              {...register('description')}
              placeholder="Details on requirements, acceptance criteria, and checklist notes..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {/* Project & Sprint Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                Project Workspace
              </label>
              <select
                disabled={isEdit}
                {...register('projectId')}
                className="w-full px-3 py-2.5 text-sm rounded-lg border bg-background outline-none transition-all focus:ring-2 disabled:opacity-50"
              >
                <option value="">Select Project</option>
                {projectsList.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} [{p.key}]
                  </option>
                ))}
              </select>
              {errors.projectId && <p className="text-2xs text-destructive">{errors.projectId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                Agile Sprint
              </label>
              <select
                disabled={!watchedProjectId}
                {...register('sprintId')}
                className="w-full px-3 py-2.5 text-sm rounded-lg border bg-background outline-none transition-all focus:ring-2 disabled:opacity-50"
              >
                <option value="">Backlog (No Sprint)</option>
                {sprintsList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                Assign User
              </label>
              <select
                disabled={!watchedProjectId}
                {...register('assignee')}
                className="w-full px-3 py-2.5 text-sm rounded-lg border bg-background outline-none transition-all focus:ring-2 disabled:opacity-50"
              >
                <option value="">Unassigned</option>
                {assigneesList.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                Task Priority
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2.5 text-sm rounded-lg border bg-background outline-none transition-all focus:ring-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Status & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2.5 text-sm rounded-lg border bg-background outline-none transition-all focus:ring-2"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                Due Date
              </label>
              <input
                type="date"
                {...register('dueDate')}
                className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2"
              />
            </div>
          </div>

          {/* Estimations & Tags */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                Estimate (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                {...register('estimatedHours', { valueAsNumber: true })}
                className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2"
                placeholder="8"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                Spent Hours
              </label>
              <input
                type="number"
                step="0.5"
                {...register('spentHours', { valueAsNumber: true })}
                className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2"
                placeholder="4"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                Story Points
              </label>
              <input
                type="number"
                {...register('storyPoints', { valueAsNumber: true })}
                className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2"
                placeholder="3"
              />
            </div>
          </div>

          {/* Labels input */}
          <div className="space-y-1.5">
            <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
              Labels / Tags (comma sep.)
            </label>
            <input
              type="text"
              {...register('labelsInput')}
              placeholder="frontend, bug, dnd"
              className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2"
            />
          </div>

          {/* Dialog Action Buttons */}
          <div className="border-t pt-4 flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg hover:bg-secondary font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/95 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
