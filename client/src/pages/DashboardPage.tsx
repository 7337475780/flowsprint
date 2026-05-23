import { FolderKanban, ListTodo, Zap, Users, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { cn } from '../lib/utils.js';

// ─── Types ───────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label:  string;
  value:  string | number;
  change: string;
  trend:  'up' | 'down' | 'neutral';
  icon:   React.ElementType;
  color:  string;
}

interface ActivityItem {
  id:     number;
  actor:  string;
  action: string;
  target: string;
  time:   string;
  type:   'complete' | 'create' | 'move' | 'assign' | 'alert';
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const KPI_DATA: KpiCardProps[] = [
  { label: 'Active Projects', value: 4,   change: '+1 this week',      trend: 'up',      icon: FolderKanban,  color: 'text-violet-500 bg-violet-500/10' },
  { label: 'Open Tasks',      value: 48,  change: '12 closed today',   trend: 'up',      icon: ListTodo,       color: 'text-sky-500    bg-sky-500/10'    },
  { label: 'Active Sprints',  value: 2,   change: 'Sprint 4 & 5',      trend: 'neutral', icon: Zap,            color: 'text-amber-500  bg-amber-500/10'  },
  { label: 'Team Members',    value: 6,   change: '+2 this month',     trend: 'up',      icon: Users,          color: 'text-emerald-500 bg-emerald-500/10'},
];

const ACTIVITIES: ActivityItem[] = [
  { id: 1, actor: 'Alex M.',   action: 'completed',  target: 'FS-42: Implement JWT middleware',       time: '8m ago',  type: 'complete' },
  { id: 2, actor: 'Sarah C.',  action: 'created',    target: 'FS-56: Add Sprint velocity tracker',    time: '25m ago', type: 'create'   },
  { id: 3, actor: 'Daniel K.', action: 'moved',      target: 'FS-38: Design system foundation',       time: '1h ago',  type: 'move'     },
  { id: 4, actor: 'Priya R.',  action: 'assigned to','target': 'FS-51: Kanban board drag system',     time: '2h ago',  type: 'assign'   },
  { id: 5, actor: 'Bruce W.',  action: 'blocked',    target: 'FS-29: Payment webhook integration',    time: '3h ago',  type: 'alert'    },
];

const SPRINT_PROGRESS = [
  { name: 'Sprint 4 — Core Infrastructure', pct: 76, color: 'bg-primary' },
  { name: 'Sprint 5 — Auth & Billing',       pct: 34, color: 'bg-amber-500' },
];

const ACTIVITY_COLORS: Record<ActivityItem['type'], string> = {
  complete: 'bg-emerald-500/10 text-emerald-500',
  create:   'bg-sky-500/10     text-sky-500',
  move:     'bg-violet-500/10  text-violet-500',
  assign:   'bg-amber-500/10   text-amber-500',
  alert:    'bg-rose-500/10    text-rose-500',
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function KpiCard({ label, value, change, trend, icon: Icon, color }: KpiCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200 hover:-translate-y-0.5 transform">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <div className={cn('p-2 rounded-lg', color)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <span className="font-heading text-3xl font-bold tracking-tight">{value}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {trend === 'up'   && <TrendingUp   className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
        {trend === 'down' && <TrendingDown  className="h-3.5 w-3.5 text-rose-500    shrink-0" />}
        <span>{change}</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {greeting}, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening across your workspace today.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/sprints"
            className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Zap className="h-4 w-4" /> Sprints
          </Link>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3.5 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Task
          </Link>
        </div>
      </div>

      {/* ── KPI Grid ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_DATA.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
      </div>

      {/* ── Middle row ───────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Sprint Progress — spans 2 cols */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm">Sprint Progress</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Active sprint burndown overview</p>
            </div>
            <Link to="/sprints" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {SPRINT_PROGRESS.map(({ name, pct, color }) => (
              <div key={name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-[70%]">{name}</span>
                  <span className="font-semibold shrink-0">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', color)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Mini task distribution */}
          <div className="grid grid-cols-4 divide-x border-t pt-4">
            {[
              { label: 'Backlog',     count: 18, color: 'text-muted-foreground' },
              { label: 'In Progress', count: 11, color: 'text-amber-500' },
              { label: 'In Review',   count:  6, color: 'text-sky-500' },
              { label: 'Done',        count: 13, color: 'text-emerald-500' },
            ].map(({ label, count, color }) => (
              <div key={label} className="text-center px-2">
                <span className={cn('block text-xl font-bold font-heading', color)}>{count}</span>
                <span className="text-2xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats column */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold text-sm">Workspace Health</h2>
            {[
              { label: 'Completion rate',  value: '68%', icon: CheckCircle2,  color: 'text-emerald-500' },
              { label: 'Overdue tasks',    value: '3',   icon: AlertTriangle, color: 'text-rose-500'    },
              { label: 'Avg velocity',     value: '0.72', icon: TrendingUp,   color: 'text-violet-500'  },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className={cn('h-4 w-4', color)} />
                  {label}
                </div>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm">Team</h2>
              <Link to="/team" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="flex -space-x-2">
              {['AM', 'SC', 'DK', 'PR', 'BW', 'TH'].map((init) => (
                <div
                  key={init}
                  className="h-8 w-8 rounded-full bg-primary/10 text-primary border-2 border-card flex items-center justify-center text-2xs font-bold"
                >
                  {init}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">6 active workspace members</p>
          </div>
        </div>
      </div>

      {/* ── Activity Feed ─────────────────────────────────────────────── */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-sm">Team Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest actions across the workspace</p>
          </div>
        </div>
        <ul className="space-y-0">
          {ACTIVITIES.map((act, idx) => (
            <li key={act.id} className={cn('flex gap-3 py-3', idx < ACTIVITIES.length - 1 && 'border-b')}>
              <div className={cn('mt-0.5 h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-2xs font-bold', ACTIVITY_COLORS[act.type])}>
                {act.actor.split(' ')[0][0]}{act.actor.split(' ')[1]?.[0] ?? ''}
              </div>
              <div className="min-w-0">
                <p className="text-sm leading-snug">
                  <span className="font-semibold">{act.actor}</span>
                  {' '}<span className="text-muted-foreground">{act.action}</span>{' '}
                  <span className="font-medium hover:text-primary cursor-pointer truncate">{act.target}</span>
                </p>
                <span className="text-2xs text-muted-foreground">{act.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
