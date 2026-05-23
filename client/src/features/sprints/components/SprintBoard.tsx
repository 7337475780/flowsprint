import { cn } from '../../../lib/utils.js';
import type { Task } from '../../tasks/api/taskApi.js';
import type { Sprint } from '../api/sprintApi.js';
import TaskCard from '../../tasks/components/TaskCard.js';
import { useUpdateTaskStatusGeneralMutation } from '../../tasks/hooks/useTasks.js';

interface SprintBoardProps {
  sprint: Sprint;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onCardClick: (task: Task) => void;
}

interface SprintColumnProps {
  title: string;
  tasks: Task[];
  statusList: ('backlog' | 'todo' | 'in-progress' | 'review' | 'done')[];
  targetStatus: 'todo' | 'in-progress' | 'done';
  dotColor: string;
  borderColor: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onCardClick: (task: Task) => void;
}

function SprintColumn({
  title,
  tasks,
  statusList,
  targetStatus,
  dotColor,
  borderColor,
  onEditTask,
  onDeleteTask,
  onCardClick,
}: SprintColumnProps) {
  const filteredTasks = tasks.filter((t) => statusList.includes(t.status));
  const updateMut = useUpdateTaskStatusGeneralMutation();

  // Handle Drop and Status Mutation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Trigger update mutation to change status
    updateMut.mutate({ id: taskId, status: targetStatus });
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col h-full min-h-[500px] rounded-2xl border bg-card/60 backdrop-blur-xs shadow-3xs overflow-hidden',
        borderColor
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <span className={cn('h-2.5 w-2.5 rounded-full animate-pulse', dotColor)} />
          <h4 className="font-heading font-extrabold text-xs tracking-tight text-foreground">
            {title}
          </h4>
          <span className="font-mono text-3xs font-extrabold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border">
            {filteredTasks.length}
          </span>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
        {filteredTasks.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center border border-dashed rounded-xl p-4 text-center">
            <span className="text-4xs font-bold uppercase tracking-widest text-muted-foreground">
              Empty lane
            </span>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onClick={onCardClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function SprintBoard({ sprint, onEditTask, onDeleteTask, onCardClick }: SprintBoardProps) {
  const tasks = (sprint.tasks as Task[]) ?? [];

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3 items-start w-full">
      {/* 1. Sprint Backlog */}
      <SprintColumn
        title="Sprint Backlog"
        tasks={tasks}
        statusList={['backlog', 'todo']}
        targetStatus="todo"
        dotColor="bg-blue-500"
        borderColor="border-t-blue-500"
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onCardClick={onCardClick}
      />

      {/* 2. Active Progress */}
      <SprintColumn
        title="Active Progress"
        tasks={tasks}
        statusList={['in-progress', 'review']}
        targetStatus="in-progress"
        dotColor="bg-amber-500"
        borderColor="border-t-amber-500"
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onCardClick={onCardClick}
      />

      {/* 3. Completed Work */}
      <SprintColumn
        title="Completed Work"
        tasks={tasks}
        statusList={['done']}
        targetStatus="done"
        dotColor="bg-emerald-500"
        borderColor="border-t-emerald-500"
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onCardClick={onCardClick}
      />
    </div>
  );
}
