import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface MetricBadgeProps {
  change: number | string;
  trend: 'up' | 'down' | 'neutral';
  className?: string;
}

/**
 * Clean, compact trend rating badge pill.
 */
export default function MetricBadge({ change, trend, className }: MetricBadgeProps) {
  const isUp = trend === 'up';
  const isDown = trend === 'down';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] leading-tight font-semibold tabular-nums border tracking-wide transition-all',
        {
          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20': isUp,
          'bg-rose-500/10 text-rose-500 border-rose-500/20': isDown,
          'bg-slate-500/10 text-slate-400 border-slate-500/20': !isUp && !isDown,
        },
        className
      )}
    >
      {isUp && <TrendingUp className="h-3 w-3 shrink-0" />}
      {isDown && <TrendingDown className="h-3 w-3 shrink-0" />}
      {!isUp && !isDown && <Minus className="h-3 w-3 shrink-0" />}
      <span>
        {typeof change === 'number' && isUp && change > 0 ? `+${change}` : change}
      </span>
    </span>
  );
}
