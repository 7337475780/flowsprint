import { useState } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore.js';
import { cn } from '../../../lib/utils.js';

export default function VelocityChart() {
  const trends = useAnalyticsStore((state) => state.trends);
  const [hoveredIdx, setHoveredIdx] = useState<{ idx: number; type: 'planned' | 'completed' } | null>(null);

  if (!trends || !trends.sprintPerformanceHistory || trends.sprintPerformanceHistory.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 flex flex-col items-center justify-center py-20 text-center text-muted-foreground border-dashed">
        <span className="text-xs font-semibold">No sprint velocity history loaded yet.</span>
      </div>
    );
  }

  const data = trends.sprintPerformanceHistory;
  const width = 600;
  const height = 240;
  const paddingX = 50;
  const paddingY = 30;

  const maxPoints = Math.max(
    ...data.map((d) => Math.max(d.plannedPoints, d.completedPoints)),
    10
  );

  // Computed layout calculations
  const groupCount = data.length;
  const groupWidth = (width - paddingX * 2) / groupCount;
  const barWidth = Math.max(6, groupWidth * 0.25);
  const barGap = 4;

  const bars = data.map((d, idx) => {
    const groupCenterX = paddingX + idx * groupWidth + groupWidth / 2;
    
    // Y coordinates
    const plannedY = height - paddingY - (d.plannedPoints / maxPoints) * (height - paddingY * 2);
    const completedY = height - paddingY - (d.completedPoints / maxPoints) * (height - paddingY * 2);

    return {
      name: d.name,
      planned: {
        x: groupCenterX - barWidth - barGap / 2,
        y: plannedY,
        h: height - paddingY - plannedY,
        val: d.plannedPoints,
      },
      completed: {
        x: groupCenterX + barGap / 2,
        y: completedY,
        h: height - paddingY - completedY,
        val: d.completedPoints,
      },
      efficiency: d.efficiency,
    };
  });

  const gridLines = Array.from({ length: 4 }).map((_, idx) => {
    const y = paddingY + (idx / 3) * (height - paddingY * 2);
    const val = Math.round(maxPoints - (idx / 3) * maxPoints);
    return { y, val };
  });

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-foreground">Sprint Velocity</h4>
          <p className="text-3xs text-muted-foreground mt-0.5">
            Planned story points vs completed velocity comparison across recent sprints.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-xs bg-muted border border-border inline-block" />
            <span className="text-4xs font-bold text-muted-foreground uppercase">Planned</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-xs bg-primary inline-block" />
            <span className="text-4xs font-bold text-muted-foreground uppercase">Completed</span>
          </div>
        </div>
      </div>

      <div className="relative pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Grid lines */}
          {gridLines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={line.y}
                x2={width - paddingX}
                y2={line.y}
                className="stroke-muted-foreground/10"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 10}
                y={line.y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-4xs font-bold font-sans"
              >
                {line.val}
              </text>
            </g>
          ))}

          {/* Draw bars */}
          {bars.map((bar, idx) => (
            <g key={idx}>
              {/* Planned Bar */}
              <rect
                x={bar.planned.x}
                y={bar.planned.y}
                width={barWidth}
                height={bar.planned.h}
                rx="2"
                className={cn(
                  'fill-secondary stroke-border stroke transition-all',
                  hoveredIdx?.idx === idx && hoveredIdx?.type === 'planned' && 'fill-secondary/80'
                )}
                onMouseEnter={() => setHoveredIdx({ idx, type: 'planned' })}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* Completed Bar */}
              <rect
                x={bar.completed.x}
                y={bar.completed.y}
                width={barWidth}
                height={bar.completed.h}
                rx="2"
                className={cn(
                  'fill-primary transition-all',
                  hoveredIdx?.idx === idx && hoveredIdx?.type === 'completed' && 'opacity-85'
                )}
                onMouseEnter={() => setHoveredIdx({ idx, type: 'completed' })}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* X Axis Sprint name */}
              <text
                x={paddingX + idx * groupWidth + groupWidth / 2}
                y={height - paddingY + 16}
                textAnchor="middle"
                className="fill-muted-foreground text-5xs font-black tracking-wider uppercase font-sans"
              >
                {bar.name.replace(/sprint/i, 'Sp')}
              </text>

              {/* Percentage label above group */}
              <text
                x={paddingX + idx * groupWidth + groupWidth / 2}
                y={Math.min(bar.planned.y, bar.completed.y) - 6}
                textAnchor="middle"
                className="fill-muted-foreground text-5xs font-black font-sans"
              >
                {bar.efficiency}%
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIdx !== null && (
          <div
            style={{
              position: 'absolute',
              left: `${
                ((hoveredIdx.type === 'planned'
                  ? bars[hoveredIdx.idx].planned.x
                  : bars[hoveredIdx.idx].completed.x) +
                  barWidth / 2) /
                width * 100
              }%`,
              top: `${
                ((hoveredIdx.type === 'planned'
                  ? bars[hoveredIdx.idx].planned.y
                  : bars[hoveredIdx.idx].completed.y) /
                  height) *
                  100 -
                16
              }%`,
              transform: 'translateX(-50%) translateY(-100%)',
            }}
            className="pointer-events-none rounded-lg border bg-card shadow-lg px-2 py-1 z-20 text-center animate-in fade-in zoom-in-95 duration-100 min-w-[60px]"
          >
            <span className="block text-5xs font-black text-muted-foreground uppercase tracking-widest leading-none">
              {hoveredIdx.type === 'planned' ? 'Planned' : 'Completed'}
            </span>
            <span className="block text-2xs font-black text-foreground mt-0.5 leading-none">
              {hoveredIdx.type === 'planned'
                ? bars[hoveredIdx.idx].planned.val
                : bars[hoveredIdx.idx].completed.val}{' '}
              pts
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
