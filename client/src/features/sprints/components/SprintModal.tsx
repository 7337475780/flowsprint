import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils.js';
import type { Sprint, SprintInput } from '../api/sprintApi.js';
import { useProjectsQuery, useProjectDetailsQuery } from '../../projects/hooks/useProjects.js';

const sprintSchema = z
  .object({
    name: z.string().min(1, 'Sprint name is required').min(3, 'Sprint name must be at least 3 characters'),
    goal: z.string().max(500, 'Sprint goal cannot exceed 500 characters').optional(),
    projectId: z.string().min(1, 'Project selection is required'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    membersInput: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'Sprint end date must be after the start date',
      path: ['endDate'],
    }
  );

type SprintFormValues = z.infer<typeof sprintSchema>;

interface SprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: SprintInput) => Promise<void>;
  sprint?: Sprint | null;
}

export default function SprintModal({ isOpen, onClose, onSubmit, sprint }: SprintModalProps) {
  const isEdit = !!sprint;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SprintFormValues>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: '',
      goal: '',
      projectId: '',
      startDate: '',
      endDate: '',
      membersInput: '',
    },
  });

  const watchedProjectId = watch('projectId');

  // Query projects list for project dropdown
  const { data: projectsData } = useProjectsQuery({ limit: 100 });
  const projectsList = projectsData?.data ?? [];

  // Query project details to populate members if needed
  const { data: selectedProject } = useProjectDetailsQuery(watchedProjectId);
  const projectMembers = selectedProject?.members ?? [];

  // Re-populate form when sprint edit starts
  useEffect(() => {
    if (sprint) {
      const projId = typeof sprint.project === 'object' ? sprint.project._id : sprint.project;
      reset({
        name: sprint.name,
        goal: sprint.goal || '',
        projectId: projId || '',
        startDate: sprint.startDate ? new Date(sprint.startDate).toISOString().split('T')[0] : '',
        endDate: sprint.endDate ? new Date(sprint.endDate).toISOString().split('T')[0] : '',
        membersInput: sprint.members ? sprint.members.map((m) => m.name).join(', ') : '',
      });
    } else {
      reset({
        name: '',
        goal: '',
        projectId: '',
        startDate: '',
        endDate: '',
        membersInput: '',
      });
    }
  }, [sprint, reset]);

  const handleFormSubmit = async (values: SprintFormValues) => {
    const payload: SprintInput = {
      name: values.name,
      goal: values.goal || '',
      projectId: values.projectId,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
      // Map members Input to list of active project members
      members: projectMembers
        .filter((m) => values.membersInput?.toLowerCase().includes(m.name.toLowerCase()))
        .map((m) => m._id) || [],
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
          {isEdit ? 'Modify Planned Sprint' : 'Plan New Agile Sprint Cycle'}
        </h3>
        <p className="text-2xs text-muted-foreground mb-6">
          Initialize agile milestones and timeline boundaries.
        </p>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
              Sprint Milestone Name
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Sprint 1 - Core Auth scaffolding"
              className={cn(
                'w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none transition-all',
                'focus:ring-2 focus:ring-primary/20 focus:border-primary',
                errors.name && 'border-destructive focus:ring-destructive/10'
              )}
            />
            {errors.name && <p className="text-2xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Goal */}
          <div className="space-y-1.5">
            <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
              Sprint Core Goal
            </label>
            <textarea
              {...register('goal')}
              placeholder="Establish JWT authentications and secure CORS endpoints..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {/* Project Dropdown */}
          <div className="space-y-1.5">
            <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
              Parent Project Workspace
            </label>
            <select
              disabled={isEdit}
              {...register('projectId')}
              className="w-full px-3 py-2.5 text-sm rounded-lg border bg-background outline-none transition-all focus:ring-2 disabled:opacity-50"
            >
              <option value="">Select Project Workspace</option>
              {projectsList.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} [{p.key}]
                </option>
              ))}
            </select>
            {errors.projectId && <p className="text-2xs text-destructive">{errors.projectId.message}</p>}
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                Start Date
              </label>
              <input
                type="date"
                {...register('startDate')}
                className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                End Date
              </label>
              <input
                type="date"
                {...register('endDate')}
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2',
                  errors.endDate && 'border-destructive'
                )}
              />
              {errors.endDate && <p className="text-2xs text-destructive">{errors.endDate.message}</p>}
            </div>
          </div>

          {/* Members tagging placeholder */}
          <div className="space-y-1.5">
            <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
              Teammates assigned (comma separated)
            </label>
            <input
              type="text"
              {...register('membersInput')}
              placeholder="e.g. Alice, Bob (matches name strings)"
              className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2"
            />
          </div>

          {/* Action buttons */}
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
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Plan Sprint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
