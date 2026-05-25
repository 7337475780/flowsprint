import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Zap,
  Plus,
  X,
  PlayCircle,
  CheckCircle2,
  StopCircle,
  Layers,
  Flame,
  Award,
  Activity,
  Loader2,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';

import PageHeader from '../components/common/PageHeader.js';
import EmptyState from '../components/common/EmptyState.js';
import Loader from '../components/common/Loader.js';
import { useAuthStore } from '../store/authStore.js';
import { cn } from '../lib/utils.js';
import { hasPermission } from '../lib/permissions.js';

// Sprint Features Imports
import {
  useSprintsQuery,
  useSprintDetailsQuery,
  useSprintBurndownQuery,
  useSprintAnalyticsQuery,
  useCreateSprintMutation,
  useDeleteSprintMutation,
  useStartSprintMutation,
  useEndSprintMutation,
  useCancelSprintMutation,
} from '../features/sprints/hooks/useSprints.js';
import { updateSprint } from '../features/sprints/api/sprintApi.js';
import SprintCard from '../features/sprints/components/SprintCard.js';
import SprintStats from '../features/sprints/components/SprintStats.js';
import SprintFilters from '../features/sprints/components/SprintFilters.js';
import SprintProgress from '../features/sprints/components/SprintProgress.js';
import SprintBoard from '../features/sprints/components/SprintBoard.js';
import SprintTaskList from '../features/sprints/components/SprintTaskList.js';

// Heavy Sprint Components Lazy Loaded
const SprintModal = lazy(() => import('../features/sprints/components/SprintModal.js'));
const BurndownChart = lazy(() => import('../features/sprints/components/BurndownChart.js'));
const VelocityChart = lazy(() => import('../features/sprints/components/VelocityChart.js'));

// Project Imports
import { useProjectsQuery } from '../features/projects/hooks/useProjects.js';
import type { Sprint, SprintInput } from '../features/sprints/api/sprintApi.js';

export default function SprintsPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // Filters State
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState('');

  // Selected Sprint Details State
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'scrum' | 'analytics'>('scrum');

  // Modal Dialog States
  const [sprintModalOpen, setSprintModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [retroModalOpen, setRetroModalOpen] = useState(false);
  const [retroText, setRetroText] = useState('');

  // 1. Fetch Sprints (list) and Projects (for filtering & forms)
  const { data: sprintsData, isLoading: sprintsLoading } = useSprintsQuery({
    projectId: projectId || undefined,
    status: status || undefined,
    archived: false,
  });
  const sprints = sprintsData?.sprints || [];

  const { data: projectsData, isLoading: projectsLoading } = useProjectsQuery({ limit: 100 });
  const projects = projectsData?.data || [];

  // 2. Fetch Selected Sprint Details
  const { data: sprintDetails, isLoading: detailsLoading } = useSprintDetailsQuery(selectedSprintId || '');

  // 3. Fetch Selected Sprint Charts/Analytics
  const { data: burndownResponse, isLoading: burndownLoading } = useSprintBurndownQuery(selectedSprintId || '');
  const burndownPoints = burndownResponse?.data || [];

  const { data: analyticsData } = useSprintAnalyticsQuery(selectedSprintId || '');

  // Mutations
  const createSprintMut = useCreateSprintMutation();
  const deleteSprintMut = useDeleteSprintMutation();
  const startSprintMut = useStartSprintMutation();
  const endSprintMut = useEndSprintMutation();
  const cancelSprintMut = useCancelSprintMutation();

  const updateSprintMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SprintInput> }) => updateSprint(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['sprint-details', data._id] });
      toast.success(`Sprint "${data.name}" updated successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update sprint';
      toast.error(msg);
    },
  });

  const isEditor = hasPermission(user, 'manage:sprint');

  // Auto-select first active or planned sprint when list changes or on load
  useEffect(() => {
    if (sprints.length > 0 && !selectedSprintId) {
      const active = sprints.find((s) => s.status === 'active');
      if (active) {
        setSelectedSprintId(active._id);
      } else {
        const planned = sprints.find((s) => s.status === 'planned');
        if (planned) {
          setSelectedSprintId(planned._id);
        } else {
          setSelectedSprintId(sprints[0]._id);
        }
      }
    }
  }, [sprints, selectedSprintId]);

  // Handle Form Submission (Create or Edit)
  const handleSprintSubmit = async (values: SprintInput) => {
    try {
      if (editingSprint) {
        await updateSprintMut.mutateAsync({ id: editingSprint._id, payload: values });
      } else {
        await createSprintMut.mutateAsync(values);
      }
      setSprintModalOpen(false);
      setEditingSprint(null);
    } catch {
      // Toast handles errors
    }
  };

  // Actions
  const handleStartSprint = (id: string) => {
    if (confirm('Are you sure you want to start this agile sprint cycle? Make sure start and end dates are specified.')) {
      startSprintMut.mutate(id);
    }
  };

  const handleCancelSprint = (id: string) => {
    if (confirm('Are you sure you want to cancel this sprint cycle? All assigned tickets will remain in their status but the sprint is terminated.')) {
      cancelSprintMut.mutate(id);
    }
  };

  const handleDeleteSprint = (id: string) => {
    if (confirm('Are you sure you want to delete this sprint? This action is permanent.')) {
      deleteSprintMut.mutate(id, {
        onSuccess: () => {
          if (selectedSprintId === id) {
            setSelectedSprintId(null);
          }
        },
      });
    }
  };

  const openCompleteSprint = () => {
    setRetroText('');
    setRetroModalOpen(true);
  };

  const handleCompleteSprint = async () => {
    if (!selectedSprintId) return;
    try {
      await endSprintMut.mutateAsync({ id: selectedSprintId, retrospective: retroText || undefined });
      setRetroModalOpen(false);
      setRetroText('');
    } catch {
      // Toast handles errors
    }
  };

  const openCreateSprint = () => {
    setEditingSprint(null);
    setSprintModalOpen(true);
  };

  const openEditSprint = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setSprintModalOpen(true);
  };

  // Separate active/planned vs completed
  const activeAndPlanned = useMemo(() => {
    return sprints.filter((s) => s.status === 'active' || s.status === 'planned');
  }, [sprints]);

  const completedAndCancelled = useMemo(() => {
    return sprints.filter((s) => s.status === 'completed' || s.status === 'cancelled');
  }, [sprints]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scrum Agile Sprints"
        description="Launch active sprint cycles, perform drag-and-drop workflow task updates, and leverage the Velocity Engine for agile analytics."
        actions={
          isEditor ? (
            <button
              onClick={openCreateSprint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm hover:scale-[1.02] active:scale-95"
            >
              <Plus className="h-4 w-4" /> New Sprint
            </button>
          ) : null
        }
      />

      {/* Filter Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/40 border p-4 rounded-2xl backdrop-blur-xs">
        <SprintFilters
          projectId={projectId}
          status={status}
          projects={projects}
          isLoadingProjects={projectsLoading}
          onProjectIdChange={(id) => {
            setProjectId(id);
            setSelectedSprintId(null); // Reset detail view
          }}
          onStatusChange={(s) => {
            setStatus(s);
            setSelectedSprintId(null); // Reset detail view
          }}
        />
        {(projectId || status) && (
          <button
            onClick={() => {
              setProjectId('');
              setStatus('');
              setSelectedSprintId(null);
            }}
            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
          >
            Clear Filters
          </button>
        )}
      </div>

      {sprintsLoading ? (
        <Loader />
      ) : sprints.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No sprints found"
          description={
            projectId || status
              ? "No sprints match the selected project/status filters. Try widening your criteria."
              : "Scrum sprint milestones are blank. Plan a new agile sprint block to get started."
          }
          action={
            isEditor && !projectId && !status ? (
              <button
                onClick={openCreateSprint}
                className="inline-flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-all font-semibold shadow-sm"
              >
                <Plus className="h-4 w-4" /> Create first sprint
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT COLUMN: Sprint List */}
          <div className="w-full lg:w-[380px] shrink-0 space-y-6">
            {activeAndPlanned.length > 0 && (
              <div className="space-y-3">
                <span className="text-3xs font-extrabold uppercase tracking-widest text-indigo-400 block px-1">
                  Active & Planned Milestones
                </span>
                <div className="grid gap-3.5">
                  {activeAndPlanned.map((s) => (
                    <SprintCard
                      key={s._id}
                      sprint={s}
                      onStart={handleStartSprint}
                      onComplete={() => openCompleteSprint()}
                      onCancel={handleCancelSprint}
                      onDelete={handleDeleteSprint}
                      onSelect={(sprint) => setSelectedSprintId(sprint._id)}
                      isActive={selectedSprintId === s._id}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedAndCancelled.length > 0 && (
              <div className="space-y-3">
                <span className="text-3xs font-extrabold uppercase tracking-widest text-emerald-500 block px-1">
                  Archive / Completed Logs
                </span>
                <div className="grid gap-3.5">
                  {completedAndCancelled.map((s) => (
                    <SprintCard
                      key={s._id}
                      sprint={s}
                      onStart={handleStartSprint}
                      onComplete={() => openCompleteSprint()}
                      onCancel={handleCancelSprint}
                      onDelete={handleDeleteSprint}
                      onSelect={(sprint) => setSelectedSprintId(sprint._id)}
                      isActive={selectedSprintId === s._id}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Selected Sprint Detail Workspace */}
          <div className="flex-1 min-w-0 w-full">
            {!selectedSprintId ? (
              <div className="h-full flex flex-col items-center justify-center p-8 border border-dashed rounded-3xl bg-card/20 text-center min-h-[400px]">
                <Layers className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <h4 className="font-heading font-extrabold text-sm text-foreground mb-1">
                  No Sprint Highlighted
                </h4>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  Select an active, planned, or completed sprint from the sidebar to load telemetry metrics and workspaces.
                </p>
              </div>
            ) : detailsLoading ? (
              <SprintProgress message="Loading sprint workspace..." />
            ) : !sprintDetails ? (
              <div className="p-6 border border-dashed rounded-2xl text-center text-xs text-rose-500 bg-rose-500/5">
                Error: Unable to fetch details for this sprint.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Sprint Header & Controls Banner */}
                <div className="border bg-card rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-2xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-extrabold uppercase">
                          {sprintDetails.status}
                        </span>
                        <span className="text-3xs text-muted-foreground font-mono font-bold">
                          Project Key: {typeof sprintDetails.project === 'object' ? sprintDetails.project.key : 'SPRINT'}
                        </span>
                      </div>
                      <h3 className="font-heading font-extrabold text-lg tracking-tight text-foreground truncate">
                        {sprintDetails.name}
                      </h3>
                      {sprintDetails.goal && (
                        <p className="text-xs text-muted-foreground italic leading-relaxed">
                          Goal: &ldquo;{sprintDetails.goal}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Admin/Manager Actions */}
                    {isEditor && (
                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                        <button
                          onClick={() => openEditSprint(sprintDetails)}
                          className="inline-flex items-center gap-1.5 bg-secondary text-foreground hover:bg-secondary/80 text-xs px-3 py-2 rounded-xl font-bold transition-all shadow-xs"
                        >
                          <Settings className="h-3.5 w-3.5" /> Edit
                        </button>
                        {sprintDetails.status === 'planned' && (
                          <button
                            onClick={() => handleStartSprint(sprintDetails._id)}
                            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs px-3.5 py-2 rounded-xl font-bold transition-all shadow-sm"
                          >
                            <PlayCircle className="h-3.5 w-3.5" /> Start Sprint
                          </button>
                        )}
                        {sprintDetails.status === 'active' && (
                          <>
                            <button
                              onClick={openCompleteSprint}
                              className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3.5 py-2 rounded-xl font-bold transition-all shadow-sm"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                            </button>
                            <button
                              onClick={() => handleCancelSprint(sprintDetails._id)}
                              className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs px-3.5 py-2 rounded-xl font-bold transition-all"
                            >
                              <StopCircle className="h-3.5 w-3.5" /> Terminate
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Telemetry Stats Banner */}
                  <SprintStats
                    stats={sprintDetails.stats}
                    velocity={sprintDetails.velocity}
                    status={sprintDetails.status}
                  />

                  {/* Tab Selectors */}
                  <div className="flex border-t pt-4 gap-4">
                    <button
                      onClick={() => setActiveTab('scrum')}
                      className={cn(
                        'pb-2 text-2xs font-extrabold uppercase tracking-widest border-b-2 transition-all',
                        activeTab === 'scrum'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Workspace Board
                    </button>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className={cn(
                        'pb-2 text-2xs font-extrabold uppercase tracking-widest border-b-2 transition-all',
                        activeTab === 'analytics'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Sprint Charts & Logs
                    </button>
                  </div>
                </div>

                {/* TAB CONTENT: Scrum Board / Backlog Planner */}
                {activeTab === 'scrum' && (
                  <div className="space-y-6">
                    {sprintDetails.status === 'planned' && (
                      <div className="grid gap-6 grid-cols-1">
                        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex items-start gap-3">
                          <Flame className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="text-2xs font-extrabold text-foreground block">
                              Sprint Planning Mode Active
                            </span>
                            <span className="text-3xs text-muted-foreground block leading-relaxed">
                              Assign available project tasks below into the sprint backlog bin. Story points and metrics will synchronize instantly before starting the sprint.
                            </span>
                          </div>
                        </div>
                        <SprintTaskList sprint={sprintDetails} />
                      </div>
                    )}

                    {sprintDetails.status === 'active' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-3xs font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                            <Activity className="h-4 w-4 text-emerald-500" /> Live Agile Swimlanes
                          </span>
                          <span className="text-4xs text-muted-foreground font-bold">
                            Drag tickets between columns to shift status live
                          </span>
                        </div>
                        <SprintBoard
                          sprint={sprintDetails}
                          onEditTask={() => {}}
                          onDeleteTask={() => {}}
                          onCardClick={() => {}}
                        />
                      </div>
                    )}

                    {(sprintDetails.status === 'completed' || sprintDetails.status === 'cancelled') && (
                      <div className="space-y-4">
                        <span className="text-3xs font-extrabold uppercase tracking-widest text-muted-foreground block">
                          Static Completed Board Snapshots
                        </span>
                        <SprintBoard
                          sprint={sprintDetails}
                          onEditTask={() => {}}
                          onDeleteTask={() => {}}
                          onCardClick={() => {}}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* TAB CONTENT: Charts, Analytics & Retrospective Logs */}
                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    {/* Charts Grid */}
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                      {burndownLoading ? (
                        <div className="h-[200px] flex items-center justify-center border rounded-2xl bg-card">
                          <Loader2 className="h-6 w-6 text-primary animate-spin" />
                        </div>
                      ) : (
                        <Suspense fallback={
                          <div className="h-[200px] flex items-center justify-center border rounded-2xl bg-card">
                            <Loader2 className="h-6 w-6 text-primary animate-spin" />
                          </div>
                        }>
                          <BurndownChart data={burndownPoints} />
                        </Suspense>
                      )}
                      <Suspense fallback={
                        <div className="h-[200px] flex items-center justify-center border rounded-2xl bg-card">
                          <Loader2 className="h-6 w-6 text-primary animate-spin" />
                        </div>
                      }>
                        <VelocityChart sprints={sprints} />
                      </Suspense>
                    </div>

                    {/* Rich Analytics Reports */}
                    {analyticsData && (
                      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                        {/* Highlights Banner */}
                        <div className="border bg-card p-5 rounded-2xl shadow-2xs space-y-4">
                          <span className="text-3xs font-extrabold uppercase tracking-widest text-muted-foreground block">
                            Milestone Quality Diagnostic
                          </span>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-secondary/25 p-3 rounded-xl border">
                              <span className="text-4xs font-bold uppercase tracking-wider text-muted-foreground block">
                                Completion Efficiency
                              </span>
                              <span className="text-xl font-bold font-mono text-primary mt-1 block">
                                {Math.round(analyticsData.completionRate)}%
                              </span>
                            </div>
                            <div className="bg-secondary/25 p-3 rounded-xl border">
                              <span className="text-4xs font-bold uppercase tracking-wider text-muted-foreground block">
                                Avg Ticket Lifetime
                              </span>
                              <span className="text-xl font-bold font-mono text-primary mt-1 block">
                                {analyticsData.avgCompletionDays > 0
                                  ? `${analyticsData.avgCompletionDays.toFixed(1)}d`
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Teammates Accomplishments list */}
                        {analyticsData.teamOutput && analyticsData.teamOutput.length > 0 && (
                          <div className="border bg-card p-5 rounded-2xl shadow-2xs space-y-4">
                            <span className="text-3xs font-extrabold uppercase tracking-widest text-muted-foreground block">
                              Teammate Accomplishments
                            </span>
                            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                              {analyticsData.teamOutput.map((member) => (
                                <div
                                  key={member.name}
                                  className="flex items-center justify-between p-2.5 rounded-xl border bg-secondary/15 text-2xs font-medium"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-mono font-extrabold text-[8px] uppercase">
                                      {member.name.substring(0, 2)}
                                    </span>
                                    <span className="font-extrabold text-foreground">{member.name}</span>
                                  </div>
                                  <span className="font-mono text-3xs font-extrabold text-muted-foreground">
                                    {member.completed} / {member.total} tickets ({Math.round((member.completed / Math.max(member.total, 1)) * 100)}%)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Overdue Tickets warnings */}
                        {analyticsData.overdue && analyticsData.overdue.length > 0 && (
                          <div className="border bg-card p-5 rounded-2xl shadow-2xs space-y-4 md:col-span-2">
                            <span className="text-3xs font-extrabold uppercase tracking-widest text-rose-500 flex items-center gap-1.5">
                              <Award className="h-4 w-4 text-rose-500" />
                              <span>Overdue Tasks Distribution ({analyticsData.overdue.length})</span>
                            </span>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {analyticsData.overdue.map((ticket) => (
                                <div
                                  key={ticket.id}
                                  className="flex justify-between items-center p-3 rounded-xl border border-rose-500/10 bg-rose-500/5 text-2xs"
                                >
                                  <span className="font-extrabold text-foreground truncate max-w-[70%]">
                                    {ticket.title}
                                  </span>
                                  <span className="font-mono font-extrabold text-rose-500 text-3xs">
                                    {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : 'Expired'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Sprint Modal (Plan / Edit) ───────────────────────── */}
      <Suspense fallback={null}>
        <SprintModal
          isOpen={sprintModalOpen}
          onClose={() => {
            setSprintModalOpen(false);
            setEditingSprint(null);
          }}
          onSubmit={handleSprintSubmit}
          sprint={editingSprint}
        />
      </Suspense>

      {/* ─── Sprint Complete Retrospective Dialog ──────────────── */}
      {retroModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setRetroModalOpen(false)} />

          <div className="relative w-full max-w-md border bg-card rounded-2xl p-6 shadow-xl z-10 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setRetroModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-heading font-extrabold text-xl tracking-tight mb-1">
              End & Complete Sprint Cycle
            </h3>
            <p className="text-2xs text-muted-foreground mb-6">
              Transition this cycle to completed status and run the Velocity Engine. Provide retrospective feedback log items.
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-3xs font-extrabold uppercase tracking-widest block text-muted-foreground">
                  Retrospective Lessons & Feedback
                </label>
                <textarea
                  value={retroText}
                  onChange={(e) => setRetroText(e.target.value)}
                  placeholder="Record what went well, blockages faced, and items to shift to next sprint..."
                  rows={4}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div className="border-t pt-4 flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setRetroModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg hover:bg-secondary font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteSprint}
                  className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-all shadow-sm hover:scale-[1.02] active:scale-95"
                >
                  Complete & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
