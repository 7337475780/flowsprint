import {
  CheckCircle2,
  FileText,
  UserPlus,
  Calendar,
  AlertCircle,
  Zap,
  Plus,
} from 'lucide-react';
import { cn } from '../../lib/utils.js';
import type { ActivityItem } from '../../types/dashboard.js';

interface ActivityFeedProps {
  activities?: ActivityItem[];
  className?: string;
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  { id: 1, type: 'complete', actor: 'Sarah Connor', action: 'completed task', target: 'FS-129: Wireframe Auth Shell', time: '10m ago' },
  { id: 2, type: 'sprint_start', actor: 'Bruce Wayne', action: 'started sprint', target: 'Sprint 4 — Core Infrastructure', time: '42m ago' },
  { id: 3, type: 'update', actor: 'Tony Stark', action: 'updated variables of', target: 'FS-92: HSL Colors Theme', time: '2h ago' },
  { id: 4, type: 'assign', actor: 'Alex Mercer', action: 'assigned task', target: 'FS-133: Setup Centralized Query to Priya R.', time: '4h ago' },
  { id: 5, type: 'deadline_change', actor: 'Sarah Connor', action: 'shifted deadline of', target: 'FS-38: Setup central logs', time: '1d ago' },
];

const ICON_MAP = {
  complete: { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  sprint_start: { icon: Zap, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  update: { icon: FileText, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
  assign: { icon: UserPlus, color: 'text-violet-500 bg-violet-500/10 border-violet-500/20' },
  deadline_change: { icon: Calendar, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
  create: { icon: Plus, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  alert: { icon: AlertCircle, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
};

/**
 * Activity log row stream with status descriptors and visual indicators.
 */
export default function ActivityFeed({ activities, className }: ActivityFeedProps) {
  const items = activities || DEFAULT_ACTIVITIES;

  return (
    <div className={cn('border bg-card rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between h-80', className)}>
      <div>
        <h3 className="font-heading font-extrabold text-sm tracking-tight text-foreground">
          Recent Activity Stream
        </h3>
        <p className="text-3xs font-extrabold text-muted-foreground uppercase tracking-widest mt-0.5 block">
          Live workspace modifications
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <ul className="space-y-4 pt-2">
          {items.map((act, index) => {
            const config = ICON_MAP[act.type] || { icon: AlertCircle, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
            const TargetIcon = config.icon;

            return (
              <li
                key={act.id}
                className={cn(
                  'flex items-start gap-3.5 pb-4.5',
                  index < items.length - 1 && 'border-b border-secondary/40'
                )}
              >
                <div className={cn('p-1.5 rounded-lg border shrink-0', config.color)}>
                  <TargetIcon className="h-4 w-4 stroke-[2]" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-xs text-muted-foreground leading-snug">
                    <span className="font-bold text-foreground hover:underline cursor-pointer">
                      {act.actor}
                    </span>{' '}
                    {act.action}{' '}
                    <span className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                      {act.target}
                    </span>
                  </p>
                  <span className="text-3xs font-bold text-muted-foreground/60 tracking-wider uppercase block">
                    {act.time}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
