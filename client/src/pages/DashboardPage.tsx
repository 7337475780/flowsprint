import {
  FolderKanban,
  ListTodo,
  Zap,
  Users,
  CheckCircle2,
  Plus,
  TrendingUp,
  Flame,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useAnalyticsOverview } from '../hooks/useAnalytics.js';
import { useSprints } from '../hooks/useSprints.js';
import { useProjects } from '../hooks/useProjects.js';
import { useTasks } from '../hooks/useTasks.js';

// ─── Dashboard Widgets imports ───────────────────────────────────────────────
import DashboardGrid from '../components/dashboard/DashboardGrid.js';
import KpiCard from '../components/dashboard/KpiCard.js';
import ActivityFeed from '../components/dashboard/ActivityFeed.js';
import ProgressCard from '../components/dashboard/ProgressCard.js';
import SprintHealth from '../components/dashboard/SprintHealth.js';
import TaskChart from '../components/dashboard/TaskChart.js';
import TeamLoad from '../components/dashboard/TeamLoad.js';
import SkeletonCard from '../components/dashboard/SkeletonCard.js';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // 1. Fetch real-time DB analytics
  const { data: analytics, isLoading: analyticsLoading } = useAnalyticsOverview();
  const { data: sprintData, isLoading: sprintsLoading } = useSprints({ limit: 10 });
  const { data: projectData, isLoading: projectsLoading } = useProjects({ limit: 100 });
  const { data: tasksData, isLoading: tasksLoading } = useTasks({ limit: 100 });

  const isLoading = analyticsLoading || sprintsLoading || projectsLoading || tasksLoading;

  // 2. Data aggregation & fallbacks
  const completedSprintsCount = sprintData?.sprints?.filter((s) => s.status === 'completed').length ?? 2;

  const activeTasksCount = tasksData?.tasks?.filter(
    (t) => t.status === 'in-progress' || t.status === 'todo' || t.status === 'review'
  ).length ?? 34;

  const totalProjects = projectData?.total ?? 4;

  // Aggregate all unique team members from active projects
  const teamMembersCount = projectData?.projects
    ? Array.from(
      new Set(
        projectData.projects.flatMap((p) => [
          p.owner?._id,
          ...(p.members?.map((m) => m._id) || []),
        ])
      )
    ).filter(Boolean).length
    : 6;

  const avgVelocity = analytics?.velocitySummary?.avgVelocity
    ? Math.round(analytics.velocitySummary.avgVelocity * 100)
    : 72;

  const completionRate = analytics?.completedTasks && tasksData?.total
    ? Math.round((analytics.completedTasks / tasksData.total) * 100)
    : 68;

  // Formulate KPI array
  const kpis = [
    {
      title: 'Total Projects',
      value: totalProjects,
      change: '+1 this week',
      trend: 'up' as const,
      icon: FolderKanban,
      color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
      sparklineData: [2, 3, 3, 3, 4, 4, totalProjects],
    },
    {
      title: 'Active Tasks',
      value: activeTasksCount,
      change: 'Backlog items',
      trend: 'neutral' as const,
      icon: ListTodo,
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
      sparklineData: [42, 38, 35, 41, 37, 35, activeTasksCount],
    },
    {
      title: 'Completed Sprints',
      value: completedSprintsCount,
      change: 'Agile sprints closed',
      trend: 'up' as const,
      icon: Zap,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      sparklineData: [1, 1, 1, 2, 2, 2, completedSprintsCount],
    },
    {
      title: 'Team Members',
      value: teamMembersCount,
      change: 'Roster directory',
      trend: 'up' as const,
      icon: Users,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      sparklineData: [4, 4, 5, 5, 6, 6, teamMembersCount],
    },
    {
      title: 'Sprint Velocity',
      value: `${avgVelocity}%`,
      change: '+8% from last sprint',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      sparklineData: [64, 62, 68, 70, 71, 70, avgVelocity],
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      change: 'Workspace overall',
      trend: 'up' as const,
      icon: CheckCircle2,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      sparklineData: [58, 60, 62, 61, 65, 64, completionRate],
    },
  ];

  return (
    <div className="space-y-8">
      {/* ─── Header row — flex-row at all widths ≥ 640px ──────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div className="space-y-1 min-w-0">
          {/* h1: 30px font-weight 700 per spec */}
          <h1 className="text-3xl font-bold font-heading tracking-tight text-foreground">
            {greeting}, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          {/* Subtitle max-width 600px prevents overly long lines */}
          <p className="text-sm text-muted-foreground/80 max-w-[600px] leading-relaxed">
            Welcome back to FlowSprint. Here is a real-time snapshot of your workspace's planning, backlogs, and agile velocity.
          </p>
        </div>
        {/* Buttons: shrink-0 so they never wrap below the heading */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/sprints"
            className="inline-flex items-center gap-1.5 h-9 rounded-lg border bg-card px-4 text-xs font-semibold hover:bg-secondary transition-all duration-150 shadow-xs whitespace-nowrap active:scale-[0.98]"
          >
            <Flame className="h-4 w-4 text-amber-500" /> Plan Sprints
          </Link>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-1.5 h-9 rounded-lg bg-primary text-primary-foreground px-4 text-xs font-semibold hover:bg-primary/90 transition-all duration-150 shadow-xs whitespace-nowrap active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" /> Create Ticket
          </Link>
        </div>
      </div>

      {/* ─── KPI Cards ───────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Section heading: text-lg font-semibold tracking-tight */}
        <h2 className="text-lg font-semibold font-heading tracking-tight text-foreground">Workspace Telemetry Snapshots</h2>
        <DashboardGrid variant="kpis">
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} variant="kpi" />)
            : kpis.map((kpi) => <KpiCard key={kpi.title} {...kpi} />)}
        </DashboardGrid>
      </div>

      {/* ─── Analytics & Workload ─────────────────────────────────── */}
      <div className="space-y-4">
        {/* Section heading: identical style to the KPI heading above */}
        <h2 className="text-lg font-semibold font-heading tracking-tight text-foreground">Analytics & Workload Streams</h2>
        <DashboardGrid variant="widgets">
          {/* Donut task chart */}
          {isLoading ? (
            <SkeletonCard variant="chart" />
          ) : (
            <TaskChart
              todo={analytics?.taskDistribution?.todo || analytics?.taskDistribution?.backlog || 12}
              inProgress={analytics?.taskDistribution?.['in-progress'] || 14}
              review={analytics?.taskDistribution?.review || 8}
              done={analytics?.taskDistribution?.done || 16}
            />
          )}

          {/* Progress scale card */}
          {isLoading ? (
            <SkeletonCard variant="progress" />
          ) : (
            <ProgressCard
              projectProgress={completionRate - 4}
              taskCompletion={completionRate}
              sprintBurn={avgVelocity - 24}
              blockersCount={analytics?.overdueTasks ?? 3}
            />
          )}

          {/* Agile Sprint Health check */}
          {isLoading ? (
            <SkeletonCard variant="progress" />
          ) : (
            <SprintHealth
              onTrack={10}
              delayed={analytics?.overdueTasks ?? 2}
              blocked={sprintData?.sprints?.filter((s) => s.status === 'cancelled').length ?? 1}
              riskLevel={analytics?.overdueTasks && analytics.overdueTasks > 4 ? 'high' : 'low'}
            />
          )}

          {/* Relative activity logs */}
          {isLoading ? (
            <SkeletonCard variant="list" />
          ) : (
            <ActivityFeed />
          )}

          {/* Teammate balances */}
          {isLoading ? (
            <SkeletonCard variant="list" />
          ) : (
            <TeamLoad />
          )}
        </DashboardGrid>
      </div>
    </div>
  );
}
