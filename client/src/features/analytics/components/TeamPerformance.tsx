import { useAnalyticsStore } from '../store/analyticsStore.js';
import { cn } from '../../../lib/utils.js';
import { ShieldAlert } from 'lucide-react';

export default function TeamPerformance() {
  const team = useAnalyticsStore((state) => state.team);

  if (!team || !team.teamMembers || team.teamMembers.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 flex flex-col items-center justify-center py-20 text-center text-muted-foreground border-dashed">
        <span className="text-xs font-semibold">No active team productivity metrics compiled.</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between gap-4 border-b pb-4">
        <div>
          <h4 className="text-sm font-bold text-foreground">Team Productivity</h4>
          <p className="text-3xs text-muted-foreground mt-0.5">
            Normalized member productivity scores, workload levels, and resolution speeds.
          </p>
        </div>

        <div className="bg-primary/10 border border-primary/20 text-primary rounded-xl px-4 py-2 text-center shrink-0">
          <span className="text-4xs font-black uppercase tracking-widest block text-muted-foreground leading-none">
            Average Score
          </span>
          <span className="text-xl font-black mt-1 inline-block leading-none">
            {team.averageProductivityScore}%
          </span>
        </div>
      </div>

      {/* Leaderboard list */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-4xs font-extrabold uppercase text-muted-foreground tracking-widest">
              <th className="py-2.5">Member</th>
              <th className="py-2.5 text-center">Productivity</th>
              <th className="py-2.5 text-center">Workload Index</th>
              <th className="py-2.5 text-center">Resolved Tasks</th>
              <th className="py-2.5 text-right">Overdue</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {team.teamMembers.map((member, idx) => {
              const initials = member.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'U';

              return (
                <tr key={member.userId} className="hover:bg-secondary/20 transition-colors">
                  {/* Name cell */}
                  <td className="py-4 flex items-center gap-3">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="h-8 w-8 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border shrink-0">
                        {initials}
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-bold text-foreground block leading-tight">
                        {member.name}
                      </span>
                      <span className="text-4xs text-muted-foreground mt-0.5 inline-block font-sans">
                        Rank #{idx + 1}
                      </span>
                    </div>
                  </td>

                  {/* Productivity score gauge */}
                  <td className="py-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <span className="text-xs font-extrabold text-foreground leading-none">
                        {member.productivityScore}%
                      </span>
                      <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          style={{ width: `${member.productivityScore}%` }}
                          className={cn(
                            'h-full rounded-full transition-all',
                            member.productivityScore >= 80 ? 'bg-emerald-500' : 
                            member.productivityScore >= 60 ? 'bg-primary' : 'bg-rose-500'
                          )}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Workload index with gauge */}
                  <td className="py-4 text-center">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-semibold">
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full inline-block',
                          member.workloadIndex > 30 ? 'bg-rose-500 animate-pulse' :
                          member.workloadIndex > 15 ? 'bg-amber-500' : 'bg-emerald-500'
                        )}
                      />
                      <span className="text-foreground font-bold">{member.workloadIndex}</span>
                    </div>
                  </td>

                  {/* Task metrics */}
                  <td className="py-4 text-center text-xs font-bold text-muted-foreground">
                    <span className="text-foreground">{member.completedTasks}</span> / {member.assignedTasks}
                  </td>

                  {/* Overdue contributions */}
                  <td className="py-4 text-right">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-xs font-bold text-muted-foreground',
                        member.overdueTasks > 0 && 'text-rose-500'
                      )}
                    >
                      {member.overdueTasks > 0 && <ShieldAlert className="h-3.5 w-3.5" />}
                      {member.overdueTasks}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
