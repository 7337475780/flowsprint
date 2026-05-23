interface BurndownPoint {
  date: string;
  ideal: number;
  remaining: number;
}

interface BurndownChartProps {
  data?: BurndownPoint[];
  width?: number;
  height?: number;
}

export default function BurndownChart({ data = [], width = 500, height = 200 }: BurndownChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center border border-dashed rounded-2xl bg-secondary/5 text-center">
        <span className="text-3xs font-extrabold uppercase tracking-widest text-muted-foreground">
          No burndown coordinates
        </span>
      </div>
    );
  }

  // Chart coordinates calculations
  const maxVal = Math.max(...data.map((d) => Math.max(d.ideal, d.remaining)), 1);
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const pointsCount = data.length;
  const stepX = pointsCount > 1 ? chartWidth / (pointsCount - 1) : chartWidth;

  // Formulate line coordinates
  const idealPointsStr = data
    .map((d, i) => {
      const x = padding + i * stepX;
      const y = padding + chartHeight - (d.ideal / maxVal) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const remainingPointsStr = data
    .map((d, i) => {
      const x = padding + i * stepX;
      const y = padding + chartHeight - (d.remaining / maxVal) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  // Formulate gradient area coordinates beneath actual remaining line
  const fillPointsStr = data
    .map((d, i) => {
      const x = padding + i * stepX;
      const y = padding + chartHeight - (d.remaining / maxVal) * chartHeight;
      return `${x},${y}`;
    })
    .concat([
      `${padding + (pointsCount - 1) * stepX},${padding + chartHeight}`,
      `${padding},${padding + chartHeight}`,
    ])
    .join(' ');

  return (
    <div className="border bg-card p-5 rounded-2xl shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-3xs font-extrabold uppercase tracking-widest text-muted-foreground">
          Daily Burndown Progress
        </span>
        <div className="flex items-center gap-3 text-4xs font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-4 bg-slate-500 rounded border-dashed" /> Ideal
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-4 bg-primary rounded" /> Actual Remaining
          </span>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="burndownGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grids / Horizontal Lines */}
          {Array.from({ length: 4 }).map((_, i) => {
            const y = padding + (chartHeight / 3) * i;
            const gridVal = Math.round(maxVal - (maxVal / 3) * i);
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

          {/* Actual Gradient Fill Area */}
          <polygon points={fillPointsStr} fill="url(#burndownGrad)" />

          {/* Ideal Guideline */}
          <polyline
            points={idealPointsStr}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth="1.5"
            strokeDasharray="3 4"
            className="opacity-70"
          />

          {/* Actual remaining line */}
          <polyline
            points={remainingPointsStr}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dot Markers on actual line */}
          {data.map((d, i) => {
            const x = padding + i * stepX;
            const y = padding + chartHeight - (d.remaining / maxVal) * chartHeight;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                className="fill-primary stroke-card stroke-2 hover:r-[5] transition-all cursor-pointer"
              >
                <title>{`Day ${i + 1}: ${d.remaining} pts`}</title>
              </circle>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
