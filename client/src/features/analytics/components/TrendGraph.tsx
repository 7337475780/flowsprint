import { useState } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore.js';

export default function TrendGraph() {
  const trends = useAnalyticsStore((state) => state.trends);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!trends || !trends.monthlyVelocityTrend || trends.monthlyVelocityTrend.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 flex flex-col items-center justify-center py-20 text-center text-muted-foreground border-dashed">
        <span className="text-xs font-semibold">No monthly velocity trend loaded yet.</span>
      </div>
    );
  }

  const data = trends.monthlyVelocityTrend;
  const width = 600;
  const height = 240;
  const paddingX = 50;
  const paddingY = 30;

  const maxVal = Math.max(...data.map((d) => d.avgVelocity), 1.0);

  // Compute points
  const points = data.map((d, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (d.avgVelocity / maxVal) * (height - paddingY * 2);
    return { x, y, label: d.month, value: d.avgVelocity };
  });

  // Build SVG path
  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const gridLines = Array.from({ length: 4 }).map((_, idx) => {
    const y = paddingY + (idx / 3) * (height - paddingY * 2);
    const val = (maxVal - (idx / 3) * maxVal).toFixed(2);
    return { y, val };
  });

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <div>
        <h4 className="text-sm font-bold text-foreground">Agile Velocity Indices</h4>
        <p className="text-3xs text-muted-foreground mt-0.5">
          Rolling monthly average velocity ratios reflecting point delivery ratios.
        </p>
      </div>

      <div className="relative pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.01" />
            </linearGradient>
          </defs>

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

          {/* Area under the line */}
          <path d={areaPath} fill="url(#velocityGrad)" />

          {/* Main line path */}
          <path
            d={linePath}
            fill="none"
            className="stroke-primary"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Circles & interactive hotspots */}
          {points.map((p, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? 6 : 4}
                className="fill-card stroke-primary"
                strokeWidth="2"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="16"
                fill="transparent"
              />
            </g>
          ))}

          {/* X Axis labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={height - paddingY + 16}
              textAnchor="middle"
              className="fill-muted-foreground text-5xs font-black tracking-wider uppercase font-sans"
            >
              {p.label}
            </text>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIdx !== null && (
          <div
            style={{
              position: 'absolute',
              left: `${(points[hoveredIdx].x / width) * 100}%`,
              top: `${(points[hoveredIdx].y / height) * 100 - 18}%`,
              transform: 'translateX(-50%) translateY(-100%)',
            }}
            className="pointer-events-none rounded-lg border bg-card shadow-lg px-2.5 py-1.5 z-20 text-center animate-in fade-in zoom-in-95 duration-100 min-w-[80px]"
          >
            <span className="block text-4xs font-black text-muted-foreground uppercase tracking-widest leading-none">
              {points[hoveredIdx].label}
            </span>
            <span className="block text-xs font-black text-foreground mt-1 leading-none">
              {points[hoveredIdx].value.toFixed(2)} ratio
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
