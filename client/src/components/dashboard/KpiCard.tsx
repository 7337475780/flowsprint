import React from 'react';
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

/**
 * Premium Stripe/Linear style metric box.
 */
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
  // Programmatic chart points fallback
  const points = sparklineData || (
    trend === 'up' 
      ? [12, 14, 13, 17, 16, 21, 24] 
      : trend === 'down'
      ? [24, 21, 23, 18, 19, 14, 11]
      : [15, 14, 16, 15, 17, 16, 17]
  );

  // Programmatic SVG chart coordinates
  const width = 100;
  const height = 30;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const spread = max - min === 0 ? 1 : max - min;

  const path = points
    .map((val, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((val - min) / spread) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#f43f5e' : '#6366f1';

  return (
    <div
      className={cn(
        'group border bg-card rounded-2xl p-5 flex flex-col justify-between shadow-2xs',
        'hover:shadow-md transition-all duration-300 hover:-translate-y-1 transform relative overflow-hidden',
        className
      )}
    >
      {/* Micro Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="flex justify-between items-start">
        <span className="text-3xs font-extrabold uppercase tracking-widest text-muted-foreground block">
          {title}
        </span>
        <div className={cn('p-2 rounded-xl border shrink-0', color)}>
          <Icon className="h-4 w-4 stroke-[2.2]" />
        </div>
      </div>

      <div className="space-y-1 mt-3.5">
        <div className="text-2xl font-bold font-heading tracking-tight text-foreground leading-none">
          {value}
        </div>
        <div className="flex items-center gap-1.5 pt-1.5">
          <MetricBadge change={change} trend={trend} />
        </div>
      </div>

      {/* Sparkline Visualiser */}
      <div className="mt-5 flex items-end justify-between gap-4">
        <div className="w-20 h-[30px] shrink-0 opacity-75 group-hover:opacity-100 transition-opacity">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Shaded Area */}
            <path
              d={`${path} L ${width} ${height} L 0 ${height} Z`}
              fill={`url(#grad-${title})`}
              stroke="none"
            />
            {/* Chart Line */}
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
        <span className="text-3xs font-semibold text-muted-foreground tracking-wider uppercase whitespace-nowrap">
          7d delta
        </span>
      </div>
    </div>
  );
}
