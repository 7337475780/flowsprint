import { useTasksQuery } from '../features/tasks/hooks/useTasks.js';
import TaskColumn from '../features/tasks/components/TaskColumn.js';

export default function Tasks() {
  const { data, isLoading, isError } = useTasksQuery();

  const statuses = ['backlog', 'todo', 'in-progress', 'review', 'done'] as const;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading tasks...</div>;
  }

  if (isError) {
    return <div className="text-destructive">Failed to load tasks.</div>;
  }

  const tasks = data?.tasks || [];
  const tasksByStatus: Record<string, typeof tasks> = {};
  statuses.forEach((s) => (tasksByStatus[s] = []));
  tasks.forEach((task) => {
    const status = task.status as string;
    if (tasksByStatus[status]) tasksByStatus[status].push(task);
  });

  return (
    <div className="flex gap-6 overflow-x-auto p-4 bg-gradient-to-b from-primary/5 via-background/10 to-background/5">
      {statuses.map((status) => (
        <TaskColumn
          key={status}
          status={status as any}
          title={status.replace('-', ' ').toUpperCase()}
          tasks={tasksByStatus[status] ?? []}
          onEdit={() => {}}
          onDelete={() => {}}
          onCardClick={() => {}}
        />
      ))}
    </div>
  );
}
