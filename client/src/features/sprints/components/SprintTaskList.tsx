import { useTasksQuery } from '../../tasks/hooks/useTasks.js';
import { useManageSprintTasksMutation } from '../hooks/useSprints.js';
import type { Sprint } from '../api/sprintApi.js';
import { CheckSquare, Square, ClipboardList } from 'lucide-react';
import { cn } from '../../../lib/utils.js';

interface SprintTaskListProps {
  sprint: Sprint;
}

export default function SprintTaskList({ sprint }: SprintTaskListProps) {
  const sprintId = sprint._id;
  const projectId = typeof sprint.project === 'object' ? sprint.project._id : sprint.project;

  const { data: projectTasksData, isLoading } = useTasksQuery({
    projectId,
    limit: 100,
    archived: false,
  });

  const projectTasks = projectTasksData?.data ?? [];
  const manageTasksMutation = useManageSprintTasksMutation(sprintId);

  // Group tasks into "Assigned to Sprint" vs "Available in Backlog"
  const sprintTaskIds = new Set(
    (sprint.tasks as any[]).map((t) => (typeof t === 'object' ? t._id : t.toString()))
  );

  const handleToggleTask = (taskId: string, isAssigned: boolean) => {
    manageTasksMutation.mutate({
      taskIds: [taskId],
      action: isAssigned ? 'remove' : 'add',
    });
  };

  return (
    <div className="space-y-4 border bg-card p-5 rounded-2xl shadow-2xs">
      <div className="flex items-center justify-between border-b pb-3">
        <span className="text-3xs font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <ClipboardList className="h-4 w-4 text-primary" />
          <span>Sprint Backlog Planner</span>
        </span>
        <span className="font-mono text-3xs font-extrabold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border">
          {sprintTaskIds.size} assigned
        </span>
      </div>

      {isLoading ? (
        <div className="h-24 flex items-center justify-center">
          <div className="h-4 w-4 border-2 border-t-primary rounded-full animate-spin" />
        </div>
      ) : projectTasks.length === 0 ? (
        <p className="text-2xs text-muted-foreground italic text-center py-4">
          No tasks found in this project workspace. Create tasks in the Tasks Backlog tab first.
        </p>
      ) : (
        <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
          {projectTasks.map((task) => {
            const isAssigned = sprintTaskIds.has(task._id);

            return (
              <div
                key={task._id}
                onClick={() => handleToggleTask(task._id, isAssigned)}
                className={cn(
                  'flex items-center justify-between p-2.5 rounded-xl border bg-secondary/10 hover:bg-secondary/25 transition-all cursor-pointer group select-none text-2xs',
                  isAssigned && 'border-primary/30 bg-primary/2'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isAssigned ? (
                    <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className={cn('font-extrabold text-foreground leading-normal block truncate', isAssigned && 'text-primary')}>
                      {task.title}
                    </span>
                    <span className="font-mono text-4xs text-muted-foreground">
                      {task.priority.toUpperCase()} &bull; {task.storyPoints ?? 0} story points
                    </span>
                  </div>
                </div>

                <div className="shrink-0 font-mono text-4xs font-extrabold text-muted-foreground bg-secondary px-2 py-0.5 rounded border group-hover:text-primary transition-all">
                  {isAssigned ? 'REMOVE' : 'ASSIGN'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
