import { cn } from '../../lib/utils.js';

interface TaskChartProps {
  todo?: number;
  inProgress?: number;
  review?: number;
  done?: number;
  className?: string;
}

/**
 * Donut chart rendering task backlog allocation ratios programmatically with pure SVG.
 */
export default function TaskChart({
  todo = 12,
  inProgress = 14,
  review = 8,
  done = 16,
  className,
}: TaskChartProps) {
  const total = todo + inProgress + review + done;

  const data = [
    { label: 'Backlog & To Do', count: todo, color: '#6366f1' }, // Violet
    { label: 'In Progress', count: inProgress, color: '#f59e0b' },   // Amber
    { label: 'In Review', count: review, color: '#0ea5e9' },     // Sky
    { label: 'Completed', count: done, color: '#10b981' },       // Emerald
  ];

  // Donut coordinates math using standard circumference formulas
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const segments = data.map((d) => {
    const percent = total > 0 ? (d.count / total) * 100 : 0;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = circumference - (accumulatedPercent / 100) * circumference;
    accumulatedPercent += percent;

    return {
      ...d,
      percent,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className={cn('border bg-card rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between h-80', className)}>
      <div>
        <h3 className="font-heading font-semibold text-base tracking-tight text-foreground">
          Task Distribution
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 block">
          Workload status ratio
        </p>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
        {/* Programmatic SVG donut container */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 100 100">
            {total === 0 ? (
              <circle cx="50" cy="50" r={radius} fill="none" stroke="#334155" strokeWidth="10" />
            ) : (
              segments.map((seg, idx) => (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="10"
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap={seg.percent > 0 ? 'round' : 'butt'}
                  className="transition-all duration-300 hover:stroke-[12] cursor-pointer"
                />
              ))
            )}
          </svg>
          {/* Inner sum card */}
          <div className="absolute text-center leading-none">
            <span className="text-2xl font-bold tabular-nums tracking-tight block text-foreground">
              {total}
            </span>
            <span className="text-[11px] leading-tight text-muted-foreground block mt-0.5">
              Tickets
            </span>
          </div>
        </div>

        {/* Status Legends listing */}
        <div className="flex-1 space-y-2.5 w-full">
          {segments.map((seg) => (
            <div key={seg.label} className="flex justify-between items-center">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-sm font-medium text-muted-foreground truncate">{seg.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-sm font-mono font-semibold text-foreground">{seg.count}</span>
                <span className="text-xs text-muted-foreground">({Math.round(seg.percent)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
