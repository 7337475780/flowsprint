import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Zap,
  Plus,
  Calendar,
  X,
  Play,
  CheckCircle2,
  XCircle,
  Layers,
  ClipboardList,
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader.js';
import EmptyState from '../components/common/EmptyState.js';
import Loader from '../components/common/Loader.js';
import {
  useSprints,
  useCreateSprint,
  useStartSprint,
  useEndSprint,
  useCancelSprint,
  useManageSprintTasks,
} from '../hooks/useSprints.js';
import { useProjects } from '../hooks/useProjects.js';
import { useTasks } from '../hooks/useTasks.js';
import { useAuthStore } from '../store/authStore.js';
import { cn } from '../lib/utils.js';
import type { Sprint } from '../api/sprintsApi.js';

// ─── Sprint creation form schema ─────────────────────────────────────────────
const createSprintSchema = z.object({
  name: z.string().min(1, 'Sprint name is required').min(3, 'Must be at least 3 characters'),
  project: z.string().min(1, 'Project selection is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  goal: z.string().optional(),
});

type CreateSprintFormValues = z.infer<typeof createSprintSchema>;

export default function SprintsPage() {
  const user = useAuthStore((s) => s.user);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [retroModalOpen, setRetroModalOpen] = useState(false);
  const [taskAssignModalOpen, setTaskAssignModalOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  // Retrospective text and tasks checklist states
  const [retroText, setRetroText] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // 1. Hook queries
  const { data: sprintsData, isLoading: sprintsLoading } = useSprints();
  const { data: projectsData } = useProjects({ limit: 100 });
  const { data: tasksData } = useTasks({ status: 'backlog' });

  const createSprintMutation = useCreateSprint();
  const startSprintMutation = useStartSprint();
  const endSprintMutation = useEndSprint();
  const cancelSprintMutation = useCancelSprint();
  const manageTasksMutation = useManageSprintTasks(selectedSprint?._id || '');

  const isEditor = user?.role === 'admin' || user?.role === 'manager';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSprintFormValues>({
    resolver: zodResolver(createSprintSchema),
  });

  const onSubmitSprint = async (values: CreateSprintFormValues) => {
    try {
      await createSprintMutation.mutateAsync(values);
      setCreateModalOpen(false);
      reset();
    } catch {
      // Toast handles error
    }
  };

  // Start Sprint
  const handleStartSprint = (id: string) => {
    if (confirm('Are you sure you want to start this sprint cycle?StartDate and endDate must be active.')) {
      startSprintMutation.mutate(id);
    }
  };

  // Complete Sprint Retro prompt
  const openCompleteSprint = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setRetroText('');
    setRetroModalOpen(true);
  };

  const handleCompleteSprint = async () => {
    if (!selectedSprint) return;
    try {
      await endSprintMutation.mutateAsync({ id: selectedSprint._id, retrospective: retroText || undefined });
      setRetroModalOpen(false);
      setSelectedSprint(null);
    } catch {
      // Toast handles error
    }
  };

  // Cancel Sprint
  const handleCancelSprint = (id: string) => {
    if (confirm('Are you sure you want to cancel this sprint cycle?')) {
      cancelSprintMutation.mutate(id);
    }
  };

  // Manage Tasks Dialog open
  const openManageTasks = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    // Pre-populate already assigned tasks if any
    const tids = sprint.tasks.map((t: any) => typeof t === 'object' ? t._id : t);
    setSelectedTaskIds(tids);
    setTaskAssignModalOpen(true);
  };

  const handleSaveTasks = async () => {
    if (!selectedSprint) return;
    try {
      // Determine what to add or remove: we can simply call ADD for selected ones and let server sync
      await manageTasksMutation.mutateAsync({
        taskIds: selectedTaskIds,
        action: 'add',
      });
      setTaskAssignModalOpen(false);
      setSelectedSprint(null);
    } catch {
      // Toast handles error
    }
  };

  const toggleTaskSelection = (tid: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(tid) ? prev.filter((id) => id !== tid) : [...prev, tid]
    );
  };

  const sprints = sprintsData?.sprints || [];

  // Group sprints by status
  const activeSprints = sprints.filter((s) => s.status === 'active');
  const plannedSprints = sprints.filter((s) => s.status === 'planned');
  const completedSprints = sprints.filter((s) => s.status === 'completed' || s.status === 'cancelled');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agile Sprints"
        description="Plan agile sprints, assign tasks, and trigger sprint completion velocity audits."
        actions={
          isEditor ? (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-sm active:scale-95"
            >
              <Plus className="h-4 w-4" /> New Sprint
            </button>
          ) : null
        }
      />

      {sprintsLoading ? (
        <Loader />
      ) : sprints.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No planned sprints"
          description="Create a sprint cycle to begin allocating resources and managing backlog burndowns."
          action={
            isEditor ? (
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-1 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all font-semibold shadow-sm"
              >
                <Plus className="h-4 w-4" /> Create first sprint
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-8">
          {/* ─── Active Sprint ─────────────────────────────────────────── */}
          <div className="space-y-3">
            <h2 className="font-heading font-extrabold text-base uppercase tracking-wider text-primary">
              Active Sprint Cycle
            </h2>
            {activeSprints.length > 0 ? (
              <div className="grid gap-6">
                {activeSprints.map((sprint) => (
                  <div key={sprint._id} className="border border-l-4 border-l-primary rounded-xl bg-card p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-2xs bg-primary/10 text-primary border px-2 py-0.5 rounded font-bold uppercase">
                          ACTIVE
                        </span>
                        <h3 className="font-heading font-bold text-lg">{sprint.name}</h3>
                        {sprint.goal && <p className="text-xs text-muted-foreground">{sprint.goal}</p>}
                      </div>

                      {/* Controls */}
                      {isEditor && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => openCompleteSprint(sprint)}
                            className="inline-flex items-center gap-1.5 bg-emerald-500 text-white hover:bg-emerald-600 text-xs px-3.5 py-2 rounded-lg font-semibold shadow-sm active:scale-95 transition-all"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Complete Sprint
                          </button>
                          <button
                            onClick={() => handleCancelSprint(sprint._id)}
                            className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs px-3.5 py-2 rounded-lg font-semibold active:scale-95 transition-all"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Cancel Cycle
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="border-t pt-4 mt-5 grid gap-4 sm:grid-cols-3 text-xs">
                      <div className="space-y-1.5">
                        <span className="text-muted-foreground font-semibold block uppercase tracking-wider text-2xs">Planned Story Points</span>
                        <span className="font-mono text-base font-bold text-foreground">{sprint.plannedPoints} SP</span>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-muted-foreground font-semibold block uppercase tracking-wider text-2xs">Allocation Tasks</span>
                        <span className="font-mono text-base font-bold text-foreground">{sprint.tasks?.length ?? 0} tickets</span>
                      </div>
                      <div className="space-y-1.5 col-span-1">
                        <span className="text-muted-foreground font-semibold block uppercase tracking-wider text-2xs">Completion Progress</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${sprint.progress}%` }} />
                          </div>
                          <span className="font-bold shrink-0">{sprint.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border border-dashed rounded-xl bg-secondary/15 text-center text-xs text-muted-foreground">
                No active sprint cycle is running. Start a planned sprint from below.
              </div>
            )}
          </div>

          {/* ─── Planned Sprints ───────────────────────────────────────── */}
          <div className="space-y-3">
            <h2 className="font-heading font-extrabold text-base uppercase tracking-wider text-indigo-400">
              Planned Sprints Backlog
            </h2>
            {plannedSprints.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {plannedSprints.map((sprint) => (
                  <div
                    key={sprint._id}
                    className="border rounded-xl bg-card p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-3xs bg-indigo-500/10 text-indigo-400 border px-2 py-0.5 rounded font-bold uppercase">
                          PLANNED
                        </span>
                        {sprint.tasks && sprint.tasks.length > 0 && (
                          <span className="text-3xs font-mono font-bold text-muted-foreground">
                            {sprint.plannedPoints} SP
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold font-heading text-sm">{sprint.name}</h3>
                        {sprint.goal && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {sprint.goal}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-4 mt-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-2xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ClipboardList className="h-3.5 w-3.5 text-primary" />
                          <span>{sprint.tasks?.length ?? 0} Tasks Assigned</span>
                        </div>
                        {sprint.startDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(sprint.startDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      {isEditor && (
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <button
                            onClick={() => handleStartSprint(sprint._id)}
                            className="inline-flex items-center justify-center gap-1 bg-primary text-primary-foreground text-xs py-1.5 rounded hover:bg-primary/90 font-semibold shadow-sm active:scale-95 transition-all"
                          >
                            <Play className="h-3 w-3" /> Start Sprint
                          </button>
                          <button
                            onClick={() => openManageTasks(sprint)}
                            className="inline-flex items-center justify-center gap-1 bg-secondary text-foreground text-xs py-1.5 rounded hover:bg-secondary/80 font-semibold transition-colors"
                          >
                            <Layers className="h-3 w-3" /> Assign Tasks
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border border-dashed rounded-xl bg-secondary/15 text-center text-xs text-muted-foreground">
                No sprints are currently planned. Establish a new sprint cycle above.
              </div>
            )}
          </div>

          {/* ─── Completed Cycles ──────────────────────────────────────── */}
          <div className="space-y-3">
            <h2 className="font-heading font-extrabold text-base uppercase tracking-wider text-emerald-500">
              Completed Agile Sprints
            </h2>
            {completedSprints.length > 0 ? (
              <div className="border rounded-xl bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b bg-secondary/35 font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="p-4">Sprint</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Velocity ratio</th>
                        <th className="p-4">Story Points Completed</th>
                        <th className="p-4">Retrospective log</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {completedSprints.map((sprint) => (
                        <tr key={sprint._id} className="hover:bg-secondary/10 transition-colors">
                          <td className="p-4 font-bold text-foreground">{sprint.name}</td>
                          <td className="p-4">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wider border',
                                sprint.status === 'completed'
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                              )}
                            >
                              {sprint.status}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-bold text-primary">
                            {sprint.status === 'completed' ? `${Math.round(sprint.velocity * 100)}%` : 'N/A'}
                          </td>
                          <td className="p-4 font-mono">
                            {sprint.completedPoints} / {sprint.plannedPoints} SP
                          </td>
                          <td className="p-4 text-muted-foreground text-2xs truncate max-w-xs italic">
                            {sprint.retrospective || 'No retrospect logs provided'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-6 border border-dashed rounded-xl bg-secondary/15 text-center text-xs text-muted-foreground">
                No sprints have been completed yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Sprint planning Form Modal ───────────────────────────────── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)} />

          <div className="relative w-full max-w-lg border bg-card rounded-2xl p-6 shadow-xl z-10 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-heading font-extrabold text-xl tracking-tight mb-2">Plan new sprint cycle</h3>
            <p className="text-xs text-muted-foreground mb-6">Create a planned agile sprint box inside a project workspace.</p>

            <form onSubmit={handleSubmit(onSubmitSprint)} className="space-y-4" noValidate>
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider block text-muted-foreground">Sprint Name</label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Sprint 4 — Centralized Services"
                  className={cn(
                    'w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none transition-all focus:ring-2 focus:ring-primary/20',
                    errors.name && 'border-destructive focus:ring-destructive/10'
                  )}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              {/* Project select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider block text-muted-foreground">Project Workspace</label>
                <select
                  {...register('project')}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select Target Project</option>
                  {projectsData?.projects?.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.project && <p className="text-xs text-destructive">{errors.project.message}</p>}
              </div>

              {/* Goal */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider block text-muted-foreground">Sprint Goal</label>
                <textarea
                  {...register('goal')}
                  placeholder="Deliver robust auth integrations, setup TanStack query provider, and clean UI components..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider block text-muted-foreground">Start Date</label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider block text-muted-foreground">End Date</label>
                  <input
                    type="date"
                    {...register('endDate')}
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="border-t pt-4 flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-all shadow-sm active:scale-95"
                >
                  Plan Sprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Complete Sprint Retrospective Dialog Modal ───────────────── */}
      {retroModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setRetroModalOpen(false)} />

          <div className="relative w-full max-w-md border bg-card rounded-2xl p-6 shadow-xl z-10 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setRetroModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-heading font-extrabold text-xl tracking-tight mb-2">Complete Sprint Cycle</h3>
            <p className="text-xs text-muted-foreground mb-6">
              Complete sprint cycle. Review your final velocity counts, and post retrospective logs.
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider block text-muted-foreground">
                  Retrospective Feedback Logs
                </label>
                <textarea
                  value={retroText}
                  onChange={(e) => setRetroText(e.target.value)}
                  placeholder="Review team performance, velocity multipliers, and list retrospective milestones..."
                  rows={4}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="border-t pt-4 flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setRetroModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteSprint}
                  className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all shadow-sm active:scale-95"
                >
                  Complete & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Backlog Task Assignment Dialog Modal ────────────────────── */}
      {taskAssignModalOpen && selectedSprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setTaskAssignModalOpen(false)} />

          <div className="relative w-full max-w-lg border bg-card rounded-2xl p-6 shadow-xl z-10 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setTaskAssignModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-4">
              <h3 className="font-heading font-extrabold text-xl tracking-tight mb-1">
                Assign Backlog Tasks
              </h3>
              <p className="text-2xs text-muted-foreground">
                Assign planned backlog tickets to <span className="font-bold text-primary">{selectedSprint.name}</span>.
              </p>
            </div>

            {/* Scrollable backlog tasks checkbox list */}
            <div className="flex-1 overflow-y-auto space-y-2.5 my-2 border rounded-lg bg-secondary/10 p-4">
              {tasksData?.tasks && tasksData.tasks.length > 0 ? (
                tasksData.tasks
                  .filter((t) => typeof t.project === 'object' && t.project._id === (typeof selectedSprint.project === 'object' ? selectedSprint.project._id : selectedSprint.project))
                  .map((task) => {
                    const isChecked = selectedTaskIds.includes(task._id);
                    return (
                      <div
                        key={task._id}
                        onClick={() => toggleTaskSelection(task._id)}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-secondary/40 transition-colors cursor-pointer',
                          isChecked && 'border-primary/50 bg-primary/5'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Controlled click on container
                          className="mt-0.5 h-4 w-4 rounded accent-primary"
                        />
                        <div className="min-w-0 text-xs">
                          <span className="font-bold block truncate text-foreground">{task.title}</span>
                          <span className="text-3xs text-muted-foreground block mt-0.5">
                            Priority: {task.priority.toUpperCase()} • {task.storyPoints} Story Points
                          </span>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-2xs text-muted-foreground text-center py-6">
                  No backlog tasks found for this project workspace.
                </p>
              )}
            </div>

            <div className="border-t pt-4 flex justify-end gap-2 bg-card">
              <button
                type="button"
                onClick={() => setTaskAssignModalOpen(false)}
                className="px-4 py-2 text-sm rounded-lg hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTasks}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-all shadow-sm active:scale-95"
              >
                Assign Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
