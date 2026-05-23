import { useState } from 'react';
import { useAnalyticsStore } from '../store/analyticsStore.js';
import { cn } from '../../../lib/utils.js';

export default function TaskDistribution() {
  const project = useAnalyticsStore((state) => state.project);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!project || !project.taskDistribution) {
    return (
      <div className="rounded-xl border bg-card p-6 flex flex-col items-center justify-center py-20 text-center text-muted-foreground border-dashed">
        <span className="text-xs font-semibold">No task distribution data computed yet.</span>
      </div>
    );
  }

  const dist = project.taskDistribution;
  const categories = [
    { label: 'Backlog', value: dist.backlog, color: 'stroke-slate-400 text-slate-400 fill-slate-400' },
    { label: 'To Do', value: dist.todo, color: 'stroke-indigo-400 text-indigo-400 fill-indigo-400' },
    { label: 'In Progress', value: dist['in-progress'], color: 'stroke-amber-400 text-amber-400 fill-amber-400' },
    { label: 'Review', value: dist.review, color: 'stroke-purple-400 text-purple-400 fill-purple-400' },
    { label: 'Done', value: dist.done, color: 'stroke-emerald-400 text-emerald-400 fill-emerald-400' },
  ].filter((c) => c.value > 0);

  const total = categories.reduce((sum, c) => sum + c.value, 0);

  if (total === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 flex flex-col items-center justify-center py-20 text-center text-muted-foreground border-dashed">
        <span className="text-xs font-semibold">No active tasks in this project workspace.</span>
      </div>
    );
  }

  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  let accumulatedPercent = 0;

  const donutSegments = categories.map((cat) => {
    const percent = cat.value / total;
    const strokeDashoffset = circumference - percent * circumference;
    const rotation = accumulatedPercent * 360 - 90; // Start at top (-90 deg)
    accumulatedPercent += percent;

    return {
      ...cat,
      percent,
      strokeDashoffset,
      rotation,
    };
  });

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
      <div>
        <h4 className="text-sm font-bold text-foreground">Task Distribution</h4>
        <p className="text-3xs text-muted-foreground mt-0.5">
          Work breakdown by task status category in this project workspace.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
        {/* Donut Chart SVG */}
        <div className="relative h-40 w-40 shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
            {donutSegments.map((seg, idx) => (
              <circle
                key={idx}
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                strokeWidth="10"
                className={cn('transition-all duration-300', seg.color)}
                strokeDasharray={circumference}
                strokeDashoffset={seg.strokeDashoffset}
                transform={`rotate(${seg.rotation} 60 60)`}
                strokeLinecap="round"
                opacity={hoveredIdx === null || hoveredIdx === idx ? 1 : 0.4}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </svg>

          {/* Central count panel */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-foreground tracking-tight leading-none">
              {hoveredIdx !== null ? donutSegments[hoveredIdx].value : total}
            </span>
            <span className="text-4xs font-black uppercase text-muted-foreground tracking-widest mt-1.5 leading-none">
              {hoveredIdx !== null ? donutSegments[hoveredIdx].label : 'Total Tasks'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 flex-1 w-full">
          {donutSegments.map((seg, idx) => (
            <div
              key={idx}
              className={cn(
                'flex items-center justify-between gap-3 text-xs p-1.5 rounded-lg transition-colors cursor-pointer',
                hoveredIdx === idx && 'bg-secondary/40'
              )}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full inline-block', seg.color.replace('stroke', 'bg'))} />
                <span className="font-semibold text-muted-foreground">{seg.label}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-foreground">{seg.value}</span>
                <span className="text-3xs text-muted-foreground">({Math.round(seg.percent * 100)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
