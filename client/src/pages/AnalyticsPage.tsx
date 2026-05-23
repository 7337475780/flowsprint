import { useEffect } from 'react';
import PageHeader from '../components/common/PageHeader.js';
import OverviewCards from '../features/analytics/components/OverviewCards.js';
import ProductivityChart from '../features/analytics/components/ProductivityChart.js';
import VelocityChart from '../features/analytics/components/VelocityChart.js';
import TaskDistribution from '../features/analytics/components/TaskDistribution.js';
import SprintBurndown from '../features/analytics/components/SprintBurndown.js';
import TeamPerformance from '../features/analytics/components/TeamPerformance.js';
import TrendGraph from '../features/analytics/components/TrendGraph.js';
import AnalyticsFilters from '../features/analytics/components/AnalyticsFilters.js';
import { useAnalyticsStore } from '../features/analytics/store/analyticsStore.js';
import Loader from '../components/common/Loader.js';
import { ShieldAlert, CheckCircle, Calendar, Layers, Activity } from 'lucide-react';
import { cn } from '../lib/utils.js';

export default function AnalyticsPage() {
  const {
    activeTab,
    selectedProjectId,
    selectedSprintId,
    project,
    sprint,
    isLoading,
    fetchOverview,
    fetchProject,
    fetchSprint,
    fetchTeam,
    fetchTrends,
  } = useAnalyticsStore();

  // Unified data fetches based on active tab states
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverview();
    } else if (activeTab === 'projects') {
      if (selectedProjectId) fetchProject(selectedProjectId);
    } else if (activeTab === 'sprints') {
      if (selectedSprintId) fetchSprint(selectedSprintId);
    } else if (activeTab === 'team') {
      fetchTeam();
    } else if (activeTab === 'trends') {
      fetchTrends();
    }
  }, [activeTab, selectedProjectId, selectedSprintId]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Analytics Workspace"
        description="Enterprise-grade workspace charts, team velocities, sprint burn-downs, and productivity leaderboards."
      />

      {/* Selectors and Category Tab Headers */}
      <AnalyticsFilters />

      {isLoading ? (
        <Loader className="py-24" />
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          
          {/* TAB 1: Global Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <OverviewCards />
              <div className="grid gap-6 md:grid-cols-2">
                <ProductivityChart />
                <VelocityChart />
              </div>
            </div>
          )}

          {/* TAB 2: Project Scope */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {project ? (
                <>
                  {/* Progress Header Grid */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border bg-card p-5 shadow-2xs flex items-center justify-between col-span-1 md:col-span-2">
                      <div className="space-y-2 w-full">
                        <span className="text-3xs font-extrabold uppercase text-muted-foreground tracking-widest block">
                          Project Progression Rate
                        </span>
                        <div className="flex items-center gap-4">
                          <h2 className="text-3xl font-black text-foreground tracking-tight">
                            {project.projectProgress}%
                          </h2>
                          <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
                            <div
                              style={{ width: `${project.projectProgress}%` }}
                              className="h-full rounded-full bg-primary transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-2xs flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-3xs font-extrabold uppercase text-muted-foreground tracking-widest block">
                          Active Sprint Count
                        </span>
                        <h3 className="text-2xl font-black text-foreground tracking-tight">
                          {project.sprintInvolvement.length}
                        </h3>
                        <p className="text-3xs font-semibold text-muted-foreground">Planned or running</p>
                      </div>
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center border text-indigo-500 bg-indigo-500/10 border-indigo-500/20 shrink-0">
                        <Layers className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <TaskDistribution />

                    {/* Overdue Bottlenecks panel */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <ShieldAlert className={cn("h-4.5 w-4.5 text-muted-foreground", project.overdueTasks.length > 0 && "text-rose-500 animate-pulse")} />
                          Project Deadlines
                        </h4>
                        <p className="text-3xs text-muted-foreground mt-0.5">
                          Unresolved tasks exceeding due dates requiring attention.
                        </p>
                      </div>

                      {project.overdueTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2 bg-secondary/10 rounded-xl border border-dashed">
                          <CheckCircle className="h-8 w-8 text-emerald-500" />
                          <span className="text-xs font-semibold">All targets met. No overdue items.</span>
                        </div>
                      ) : (
                        <div className="max-h-[220px] overflow-y-auto divide-y">
                          {project.overdueTasks.map((t) => (
                            <div key={t._id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                              <div>
                                <span className="font-bold text-foreground block tracking-tight">
                                  {t.title}
                                </span>
                                <span className="text-4xs text-muted-foreground mt-0.5 block">
                                  Assigned to {t.assigneeName}
                                </span>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 font-bold text-4xs">
                                Overdue
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground border-dashed">
                  Select a Project scope to load analytics.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Sprint Scope */}
          {activeTab === 'sprints' && (
            <div className="space-y-6">
              {sprint ? (
                <>
                  {/* Sprint Stats cards */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border bg-card p-5 shadow-2xs flex items-center justify-between">
                      <div>
                        <span className="text-3xs font-extrabold uppercase text-muted-foreground tracking-widest block">
                          Sprint Points velocity
                        </span>
                        <h3 className="text-2xl font-black text-foreground tracking-tight">
                          {sprint.completedPoints} pts
                        </h3>
                        <p className="text-3xs font-semibold text-muted-foreground">
                          Out of {sprint.plannedPoints} points planned
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center border text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shrink-0">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-2xs flex items-center justify-between">
                      <div>
                        <span className="text-3xs font-extrabold uppercase text-muted-foreground tracking-widest block">
                          Agile Velocity ratio
                        </span>
                        <h3 className="text-2xl font-black text-foreground tracking-tight">
                          {sprint.velocity}
                        </h3>
                        <p className="text-3xs font-semibold text-muted-foreground">Target point ratios</p>
                      </div>
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center border text-primary bg-primary/10 border-primary/20 shrink-0">
                        <Activity className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="rounded-xl border bg-card p-5 shadow-2xs flex items-center justify-between">
                      <div>
                        <span className="text-3xs font-extrabold uppercase text-muted-foreground tracking-widest block">
                          Efficiency score
                        </span>
                        <h3 className="text-2xl font-black text-foreground tracking-tight">
                          {sprint.sprintEfficiencyScore}%
                        </h3>
                        <p className="text-3xs font-semibold text-muted-foreground">Resolved items weighting</p>
                      </div>
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center border text-amber-500 bg-amber-500/10 border-amber-500/20 shrink-0">
                        <Calendar className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <SprintBurndown />
                </>
              ) : (
                <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground border-dashed">
                  Select a Sprint scope to load analytics.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Team leaderboard */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <TeamPerformance />
            </div>
          )}

          {/* TAB 5: Trends */}
          {activeTab === 'trends' && (
            <div className="grid gap-6 md:grid-cols-2">
              <TrendGraph />
              <ProductivityChart />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
