import { AlertCircle, Target, Flame, Folder } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface ProgressCardProps {
  projectProgress?: number;
  taskCompletion?: number;
  sprintBurn?: number;
  blockersCount?: number;
  className?: string;
}

/**
 * Visual progress meter for projects, backlogs, and agile burndowns.
 */
export default function ProgressCard({
  projectProgress = 64,
  taskCompletion = 72,
  sprintBurn = 48,
  blockersCount = 3,
  className,
}: ProgressCardProps) {
  const elements = [
    { label: 'Project Milestones', value: projectProgress, color: 'bg-primary', icon: Folder, text: 'text-primary' },
    { label: 'Task Backlog Completed', value: taskCompletion, color: 'bg-emerald-500', icon: Target, text: 'text-emerald-500' },
    { label: 'Active Sprint Burndown', value: sprintBurn, color: 'bg-amber-500', icon: Flame, text: 'text-amber-500' },
  ];

  return (
    <div className={cn('border bg-card rounded-2xl p-6 shadow-2xs space-y-5 flex flex-col justify-between h-80', className)}>
      <div>
        <h3 className="font-heading font-semibold text-base tracking-tight text-foreground">
          Workspace Progress Mapping
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 block">
          Workload velocity and milestones
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-between py-1">
        <div className="space-y-4">
          {elements.map((el) => (
            <div key={el.label} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <el.icon className={cn('h-3.5 w-3.5', el.text)} />
                  <span className="font-medium">{el.label}</span>
                </div>
                <span className="font-bold text-foreground tabular-nums">{el.value}%</span>
              </div>
              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', el.color)}
                  style={{ width: `${el.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Blockers alert pill */}
        <div className="flex items-center justify-between p-3 border border-rose-500/20 bg-rose-500/5 rounded-xl mt-4">
          <div className="flex items-center gap-2.5 text-xs text-rose-500 min-w-0">
            <AlertCircle className="h-4.5 w-4.5 stroke-[2.2] shrink-0" />
            <div className="min-w-0">
              <span className="font-semibold block leading-tight truncate text-sm">Critical Blocker Items</span>
              <span className="text-xs text-rose-400 block truncate">Require immediate team review</span>
            </div>
          </div>
          <span className="text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/35 h-6 px-2.5 rounded-lg flex items-center justify-center font-mono tabular-nums shrink-0 ml-2">
            {blockersCount}
          </span>
        </div>
      </div>
    </div>
  );
}
