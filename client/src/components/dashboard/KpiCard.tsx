import React, { useId } from 'react';
import { cn } from '../../lib/utils.js';
import MetricBadge from './MetricBadge.js';

interface KpiCardProps {
  title: string;
  value: string | number;
  change: string | number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color?: string;
  sparklineData?: number[];
  className?: string;
}

export default function KpiCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color = 'text-primary bg-primary/10 border-primary/20',
  sparklineData,
  className,
}: KpiCardProps) {
  // Safe React unique ID provider to fix HTML space breaks inside gradient definitions
  const gradientId = useId();

  const points = sparklineData || (
    trend === 'up'
      ? [12, 14, 13, 17, 16, 21, 24]
      : trend === 'down'
        ? [24, 21, 23, 18, 19, 14, 11]
        : [15, 14, 16, 15, 17, 16, 17]
  );

  const W = 100, H = 30;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const spread = max - min === 0 ? 1 : max - min;

  const path = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * W;
      const y = H - ((v - min) / spread) * H;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColor =
    trend === 'up' ? '#10b981' : trend === 'down' ? '#f43f5e' : '#94a3b8';

  return (
    <div
      className={cn(
        'group relative border bg-card rounded-xl p-5 flex flex-col h-full min-h-[180px] min-w-0 w-full overflow-hidden',
        'hover:shadow-md transition-all duration-200',
        className
      )}
    >
      {/* Subtle hover glow backdrop */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent to-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="flex items-start justify-between gap-3 w-full min-w-0">
        <span
          className={cn(
            'leading-tight select-none block flex-1 min-w-0',
            'text-sm font-medium text-muted-foreground'
          )}
          title={title}
        >
          {title}
        </span>
        <div className={cn('p-1.5 rounded-lg border shrink-0', color)}>
          <Icon className="h-5 w-5 stroke-[1.8]" />
        </div>
      </div>

      {/* ── Row 2: metric value ── */}
      <div className="mt-4 flex-1 min-w-0 w-full">
        <div className="text-2xl font-bold font-heading tracking-tight text-foreground leading-none truncate tabular-nums">
          {value}
        </div>
        <div className="mt-2 flex">
          <MetricBadge change={change} trend={trend} />
        </div>
      </div>

      {/* ── Row 3: sparkline + label ── FIXED OVERFLOW TRACK SQUEEZING */}
      <div className="mt-auto pt-4 flex items-end justify-between gap-3 w-full min-w-0">

        {/* Sparkline Container Wrapper Guard */}
        <div
          className="flex-1 min-w-0 max-w-[120px] shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
          style={{ height: 32 }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="overflow-visible"
          >
            <defs>
              {/* Fixed Space Break Token bug via standard HTML safe useId generation */}
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`${path} L ${W} ${H} L 0 ${H} Z`}
              fill={`url(#${gradientId})`}
              stroke="none"
            />
            <path
              d={path}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Label block indicator element */}
        <span className="text-[11px] leading-tight text-muted-foreground/60 tracking-wider uppercase whitespace-nowrap shrink-0 pb-0.5 select-none">
          7D Delta
        </span>
      </div>
    </div>
  );
}