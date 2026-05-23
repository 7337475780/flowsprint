import { Folder, CheckSquare, Layers, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAnalyticsStore } from '../store/analyticsStore.js';
import { cn } from '../../../lib/utils.js';

export default function OverviewCards() {
  const overview = useAnalyticsStore((state) => state.overview);

  if (!overview) return null;

  const cards = [
    {
      title: 'Active Projects',
      value: overview.activeProjects,
      total: `${overview.totalProjects} total`,
      icon: Folder,
      color: 'text-primary bg-primary/10 border-primary/20',
    },
    {
      title: 'Resolved Tasks',
      value: overview.completedTasks,
      total: `${overview.totalTasks} total tasks`,
      icon: CheckSquare,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Overdue Bottlenecks',
      value: overview.overdueTasks,
      total: 'Action required',
      icon: AlertTriangle,
      color: cn(
        'text-slate-500 bg-slate-500/10 border-slate-500/20',
        overview.overdueTasks > 0 && 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse'
      ),
    },
    {
      title: 'Active Sprints',
      value: overview.activeSprints,
      total: 'Velocity ongoing',
      icon: Layers,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Completion Velocity',
      value: `${overview.completionRate}%`,
      total: 'Resolved vs total ratio',
      icon: Clock,
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Team Workload Density',
      value: overview.teamWorkloadIndex,
      total: overview.teamWorkloadIndex > 50 ? 'High workload limit' : 'Healthy workload index',
      icon: TrendingUp,
      color: cn(
        'text-amber-500 bg-amber-500/10 border-amber-500/20',
        overview.teamWorkloadIndex > 50 && 'text-amber-600 bg-amber-500/25 border-amber-500/30'
      ),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="rounded-xl border bg-card p-5 shadow-2xs hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="space-y-1.5">
              <span className="text-3xs font-extrabold uppercase text-muted-foreground tracking-widest">
                {card.title}
              </span>
              <h3 className="text-2xl font-black text-foreground tracking-tight leading-none">
                {card.value}
              </h3>
              <p className="text-3xs font-semibold text-muted-foreground">{card.total}</p>
            </div>
            <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center border shrink-0', card.color)}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
