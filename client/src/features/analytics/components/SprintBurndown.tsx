import { useState } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore.js';

export default function SprintBurndown() {
  const sprint = useAnalyticsStore((state) => state.sprint);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!sprint || !sprint.burndownData || sprint.burndownData.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 flex flex-col items-center justify-center py-20 text-center text-muted-foreground border-dashed">
        <span className="text-xs font-semibold">No active sprint burndown dataset compiled.</span>
      </div>
    );
  }

  const data = sprint.burndownData;
  const width = 600;
  const height = 240;
  const paddingX = 50;
  const paddingY = 30;

  const maxPoints = sprint.plannedPoints || 10;

  // Compute coordinates for ideal burndown
  const idealPoints = data.map((d, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (d.ideal / maxPoints) * (height - paddingY * 2);
    return { x, y };
  });

  // Compute coordinates for actual remaining points
  const actualPoints = data.map((d, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (d.remaining / maxPoints) * (height - paddingY * 2);
    return { x, y, label: d.date, value: d.remaining };
  });

  const idealPath = idealPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const actualPath = actualPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const gridLines = Array.from({ length: 4 }).map((_, idx) => {
    const y = paddingY + (idx / 3) * (height - paddingY * 2);
    const val = Math.round(maxPoints - (idx / 3) * maxPoints);
    return { y, val };
  });

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-foreground">Sprint Burndown</h4>
          <p className="text-3xs text-muted-foreground mt-0.5">
            Story points burndown chart comparing ideal vs actual remaining points.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-muted border-t border-dashed inline-block" />
            <span className="text-4xs font-bold text-muted-foreground uppercase">Ideal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-primary inline-block" />
            <span className="text-4xs font-bold text-muted-foreground uppercase">Remaining</span>
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

          {/* Ideal line path (dashed) */}
          <path
            d={idealPath}
            fill="none"
            className="stroke-muted-foreground/30"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />

          {/* Actual line path */}
          <path
            d={actualPath}
            fill="none"
            className="stroke-primary"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Actual data circles */}
          {actualPoints.map((p, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 5 : 3.5}
                className="fill-card stroke-primary"
                strokeWidth="2"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="14"
                fill="transparent"
              />
            </g>
          ))}

          {/* Date Axis labels (first, middle, last to avoid crowding) */}
          {actualPoints.length > 0 && (
            <>
              <text
                x={actualPoints[0].x}
                y={height - paddingY + 16}
                textAnchor="start"
                className="fill-muted-foreground text-5xs font-black tracking-wider uppercase font-sans"
              >
                Start
              </text>
              {actualPoints.length > 2 && (
                <text
                  x={actualPoints[Math.floor(actualPoints.length / 2)].x}
                  y={height - paddingY + 16}
                  textAnchor="middle"
                  className="fill-muted-foreground text-5xs font-black tracking-wider uppercase font-sans"
                >
                  Midway
                </text>
              )}
              <text
                x={actualPoints[actualPoints.length - 1].x}
                y={height - paddingY + 16}
                textAnchor="end"
                className="fill-muted-foreground text-5xs font-black tracking-wider uppercase font-sans"
              >
                End
              </text>
            </>
          )}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIdx !== null && (
          <div
            style={{
              position: 'absolute',
              left: `${(actualPoints[hoveredIdx].x / width) * 100}%`,
              top: `${(actualPoints[hoveredIdx].y / height) * 100 - 18}%`,
              transform: 'translateX(-50%) translateY(-100%)',
            }}
            className="pointer-events-none rounded-lg border bg-card shadow-lg px-2.5 py-1.5 z-20 text-center animate-in fade-in zoom-in-95 duration-100 min-w-[80px]"
          >
            <span className="block text-4xs font-black text-muted-foreground uppercase tracking-widest leading-none">
              {actualPoints[hoveredIdx].label}
            </span>
            <span className="block text-xs font-black text-foreground mt-1 leading-none">
              {actualPoints[hoveredIdx].value} pts left
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
