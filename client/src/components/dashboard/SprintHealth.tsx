import { Heart } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface SprintHealthProps {
  onTrack?: number;
  delayed?: number;
  blocked?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  className?: string;
}

/**
 * Agile Sprint Health dashboard displaying current risks, delay blocks, and metrics.
 */
export default function SprintHealth({
  onTrack = 8,
  delayed = 2,
  blocked = 1,
  riskLevel = 'low',
  className,
}: SprintHealthProps) {
  const elements = [
    { label: 'On Track', count: onTrack, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Delayed', count: delayed, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { label: 'Blocked', count: blocked, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
  ];

  return (
    <div className={cn('border bg-card rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between h-80', className)}>
      <div>
        <h3 className="font-heading font-extrabold text-sm tracking-tight text-foreground">
          Sprint Cycle Health
        </h3>
        <p className="text-3xs font-extrabold text-muted-foreground uppercase tracking-widest mt-0.5 block">
          Agile delivery risk audit
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-between py-1.5">
        {/* Global risk indicator */}
        <div className="flex items-center justify-between p-3.5 border rounded-xl bg-secondary/35">
          <div className="flex items-center gap-2.5 text-xs min-w-0">
            <Heart
              className={cn('h-4.5 w-4.5 stroke-[2.2] animate-pulse shrink-0', {
                'text-emerald-500': riskLevel === 'low',
                'text-amber-500': riskLevel === 'medium',
                'text-rose-500': riskLevel === 'high',
              })}
            />
            <div className="min-w-0">
              <span className="font-bold block leading-tight truncate">Sprint Health Status</span>
              <span className="text-3xs text-muted-foreground block truncate">Scrum velocity rating</span>
            </div>
          </div>
          <span
            className={cn('text-3xs font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wider shrink-0 ml-2', {
              'bg-emerald-500/10 text-emerald-500 border-emerald-500/30': riskLevel === 'low',
              'bg-amber-500/10 text-amber-500 border-amber-500/30': riskLevel === 'medium',
              'bg-rose-500/10 text-rose-500 border-rose-500/30': riskLevel === 'high',
            })}
          >
            {riskLevel} RISK
          </span>
        </div>

        {/* Sprint metric bins */}
        <div className="grid grid-cols-3 gap-2.5 mt-3.5">
          {elements.map((el) => (
            <div key={el.label} className={cn('border rounded-xl p-3 text-center space-y-0.5', el.color)}>
              <span className="block text-2xl font-bold font-mono tracking-tight leading-none">{el.count}</span>
              <span className="text-3xs font-bold uppercase tracking-wider block text-muted-foreground/80">
                {el.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
