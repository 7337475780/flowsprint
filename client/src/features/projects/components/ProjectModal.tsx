import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils.js';
import type { Project, ProjectInput } from '../api/projectApi.js';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').min(3, 'Must be at least 3 characters'),
  key: z
    .string()
    .min(2, 'Project key must be at least 2 characters')
    .max(6, 'Project key cannot exceed 6 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Project key must be alphanumeric'),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']).default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  tagsInput: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectInput) => Promise<void>;
  project?: Project | null;
}

/**
 * Reusable project creation and update modal dialog.
 */
export default function ProjectModal({ isOpen, onClose, onSubmit, project }: ProjectModalProps) {
  const isEdit = !!project;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: 'planning',
      priority: 'medium',
    },
  });

  // React to project editing triggers
  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        key: project.key,
        description: project.description || '',
        status: project.status,
        priority: project.priority,
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
        tagsInput: project.tags ? project.tags.join(', ') : '',
      });
    } else {
      reset({
        name: '',
        key: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        startDate: '',
        dueDate: '',
        tagsInput: '',
      });
    }
  }, [project, reset]);

  const handleFormSubmit = async (values: ProjectFormValues) => {
    const payload: ProjectInput = {
      name: values.name,
      key: values.key.toUpperCase(),
      description: values.description || '',
      status: values.status,
      priority: values.priority,
      startDate: values.startDate || undefined,
      dueDate: values.dueDate || undefined,
      tags: values.tagsInput
        ? values.tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };
    await onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg border bg-card rounded-2xl p-6 shadow-xl z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="font-heading font-extrabold text-xl tracking-tight mb-1">
          {isEdit ? 'Modify project workspace' : 'Plan new project space'}
        </h3>
        <p className="text-2xs text-muted-foreground mb-6">
          {isEdit
            ? 'Adjust active workspace parameters.'
            : 'Establish a new project container for backlog sprints.'}
        </p>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-3 gap-4">
            {/* Name */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                Project Name
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="Product client redesign"
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none transition-all',
                  'focus:ring-2 focus:ring-primary/20 focus:border-primary',
                  errors.name && 'border-destructive focus:ring-destructive/10'
                )}
              />
              {errors.name && <p className="text-2xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Key */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                Short Key
              </label>
              <input
                type="text"
                disabled={isEdit}
                {...register('key')}
                placeholder="FS"
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none transition-all',
                  'focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50',
                  errors.key && 'border-destructive focus:ring-destructive/10'
                )}
              />
              {errors.key && <p className="text-2xs text-destructive">{errors.key.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
              Description
            </label>
            <textarea
              {...register('description')}
              placeholder="Workspace scope variables and deployment targets..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2.5 text-sm rounded-lg border bg-background outline-none transition-all focus:ring-2"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                Priority
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

          <div className="grid grid-cols-3 gap-4">
            {/* Start Date */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                Start Date
              </label>
              <input
                type="date"
                {...register('startDate')}
                className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                Due Date
              </label>
              <input
                type="date"
                {...register('dueDate')}
                className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                Tags (comma sep.)
              </label>
              <input
                type="text"
                {...register('tagsInput')}
                placeholder="web, backend"
                className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2"
              />
            </div>
          </div>

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
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
