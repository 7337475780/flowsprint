import { FolderKanban, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import type { ProjectStats as Stats } from '../api/projectApi.js';

interface ProjectStatsProps {
  stats?: Stats;
}

/**
 * Top statistics row detailing project parameters.
 */
export default function ProjectStats({ stats }: ProjectStatsProps) {
  const cards = [
    {
      label: 'Total Projects',
      value: stats?.total ?? 0,
      icon: FolderKanban,
      color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
    },
    {
      label: 'Active Projects',
      value: stats?.active ?? 0,
      icon: Zap,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Completed',
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Overdue Items',
      value: stats?.overdue ?? 0,
      icon: AlertCircle,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground block leading-none">
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
