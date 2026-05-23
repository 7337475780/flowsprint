import { ClipboardList, CheckCircle2, Flame, BarChart2, ShieldAlert } from 'lucide-react';

interface SprintStatsProps {
  stats?: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    plannedPoints: number;
    completedPoints: number;
    progress: number;
  };
  velocity?: number;
  status?: string;
}

export default function SprintStats({ stats, velocity = 0, status }: SprintStatsProps) {
  // Calculate sprint health status
  const total = stats?.total ?? 0;
  const progress = stats?.progress ?? 0;

  let healthLabel = 'Healthy';
  let healthColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';

  if (status === 'active') {
    if (progress < 25) {
      healthLabel = 'At Risk';
      healthColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    } else if (progress < 60) {
      healthLabel = 'Moderate';
      healthColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }
  } else if (status === 'completed') {
    healthLabel = 'Delivered';
    healthColor = 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
  } else if (status === 'cancelled') {
    healthLabel = 'Cancelled';
    healthColor = 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  } else {
    healthLabel = 'Planned';
    healthColor = 'text-blue-500 bg-blue-500/10 border-blue-500/20';
  }

  const cards = [
    {
      label: 'Planned Points',
      value: `${stats?.plannedPoints ?? 0} pts`,
      icon: Flame,
      color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    },
    {
      label: 'Completion Progress',
      value: `${progress}%`,
      icon: BarChart2,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Completed Tickets',
      value: `${stats?.completed ?? 0} / ${total}`,
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Agile Velocity',
      value: velocity > 0 ? `${(velocity * 100).toFixed(0)}%` : 'N/A',
      icon: ClipboardList,
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      label: 'Sprint Health',
      value: healthLabel,
      icon: ShieldAlert,
      color: healthColor,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => {
        const TargetIcon = c.icon;
        return (
          <div
            key={c.label}
            className="border bg-card rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-sm transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="space-y-1 min-w-0">
              <span className="text-3xs font-extrabold uppercase tracking-widest text-muted-foreground block truncate">
                {c.label}
              </span>
              <span className="text-xl font-bold font-mono tracking-tight text-foreground block leading-none">
                {c.value}
              </span>
            </div>
            <div className={`p-2 rounded-xl border shrink-0 ${c.color}`}>
              <TargetIcon className="h-4.5 w-4.5 stroke-[2.2]" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
