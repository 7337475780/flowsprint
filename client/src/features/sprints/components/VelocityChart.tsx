import type { Sprint } from '../api/sprintApi.js';

interface VelocityChartProps {
  sprints?: Sprint[];
  width?: number;
  height?: number;
}

export default function VelocityChart({ sprints = [], width = 500, height = 200 }: VelocityChartProps) {
  const completedSprints = sprints
    .filter((s) => s.status === 'completed')
    .slice(-5); // Display last 5 completed sprints

  if (completedSprints.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center border border-dashed rounded-2xl bg-secondary/5 text-center">
        <span className="text-3xs font-extrabold uppercase tracking-widest text-muted-foreground">
          No completed sprints velocity history
        </span>
      </div>
    );
  }

  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Let's cap max velocity ratio to at least 1 (100%) for scale
  const maxVal = Math.max(...completedSprints.map((s) => s.velocity), 1.0);

  const barCount = completedSprints.length;
  const gap = 30;
  const barWidth = Math.max(12, (chartWidth - gap * (barCount - 1)) / barCount);

  return (
    <div className="border bg-card p-5 rounded-2xl shadow-2xs space-y-4">
      <span className="text-3xs font-extrabold uppercase tracking-widest text-muted-foreground block">
        Agile Sprint Velocity Trends
      </span>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Grids */}
          {Array.from({ length: 4 }).map((_, i) => {
            const y = padding + (chartHeight / 3) * i;
            const gridVal = `${Math.round((maxVal - (maxVal / 3) * i) * 100)}%`;
            return (
              <g key={i} className="opacity-45">
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />
                <text
                  x={padding - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="var(--muted-foreground)"
                  className="font-mono text-[9px] font-bold"
                >
                  {gridVal}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {completedSprints.map((sprint, i) => {
            const x = padding + i * (barWidth + gap) + gap / 2;
            const barHeight = (sprint.velocity / maxVal) * chartHeight;
            const y = padding + chartHeight - barHeight;

            return (
              <g key={sprint._id} className="group cursor-pointer">
                {/* Visual Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  rx="4"
                  fill="url(#velocityGrad)"
                  className="hover:opacity-90 transition-opacity"
                />

                {/* Text sprint label */}
                <text
                  x={x + barWidth / 2}
                  y={padding + chartHeight + 14}
                  textAnchor="middle"
                  fill="var(--muted-foreground)"
                  className="font-mono text-[9px] font-bold truncate max-w-[50px] uppercase"
                >
                  {sprint.name.split('-')[0].trim()}
                </text>

                {/* Hover value indicator */}
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fill="var(--foreground)"
                  className="font-mono text-[9px] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity leading-none"
                >
                  {(sprint.velocity * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
