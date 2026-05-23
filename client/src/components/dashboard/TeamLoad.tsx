import { cn } from '../../lib/utils.js';
import type { TeamLoadData } from '../../types/dashboard.js';

interface TeamLoadProps {
  teamData?: TeamLoadData[];
  className?: string;
}

const DEFAULT_TEAM: TeamLoadData[] = [
  { id: '1', name: 'Alex Mercer', workload: 84, activeTasks: 6 },
  { id: '2', name: 'Sarah Connor', workload: 52, activeTasks: 4 },
  { id: '3', name: 'Tony Stark', workload: 92, activeTasks: 8 },
  { id: '4', name: 'Bruce Wayne', workload: 34, activeTasks: 3 },
  { id: '5', name: 'Priya R.', workload: 76, activeTasks: 5 },
];

/**
 * Roster display detailing active tasks and developer workload capacities.
 */
export default function TeamLoad({ teamData, className }: TeamLoadProps) {
  const items = teamData || DEFAULT_TEAM;

  return (
    <div className={cn('border bg-card rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between h-80', className)}>
      <div>
        <h3 className="font-heading font-extrabold text-sm tracking-tight text-foreground">
          Team Capacity Balance
        </h3>
        <p className="text-3xs font-extrabold text-muted-foreground uppercase tracking-widest mt-0.5 block">
          Developer resource allocation
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <ul className="space-y-4 pt-2">
          {items.map((member) => {
            const initials = member.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            const isHigh = member.workload >= 85;

            return (
              <li key={member.id} className="flex items-center justify-between gap-4">
                {/* Avatar and name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary border flex items-center justify-center text-3xs font-bold shrink-0">
                    {initials}
                  </div>
                  <span className="font-semibold text-xs text-foreground truncate block">
                    {member.name}
                  </span>
                </div>

                {/* Capacity meter */}
                <div className="flex items-center gap-3 shrink-0 w-36">
                  <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        isHigh ? 'bg-rose-500' : 'bg-primary'
                      )}
                      style={{ width: `${member.workload}%` }}
                    />
                  </div>
                  <span className={cn('font-mono text-3xs font-extrabold w-8 text-right', isHigh ? 'text-rose-500' : 'text-foreground')}>
                    {member.workload}%
                  </span>
                </div>

                {/* Counter pill */}
                <span className="bg-secondary border text-foreground text-3xs px-2 py-0.5 rounded font-bold font-mono shrink-0">
                  {member.activeTasks} tasks
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
