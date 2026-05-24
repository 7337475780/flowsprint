import TaskColumn from './TaskColumn.js';
import type { Task } from '../api/taskApi.js';

interface TaskBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onCardClick: (task: Task) => void;
}

export default function TaskBoard({ tasks, onEdit, onDelete, onCardClick }: TaskBoardProps) {
  // Sort tasks into status categories
  const backlogTasks = tasks.filter((t) => t.status === 'backlog');
  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const reviewTasks = tasks.filter((t) => t.status === 'review');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div className="flex gap-6 items-start w-full overflow-x-auto pb-4 custom-scrollbar min-h-[600px]">
      {/* 1. Backlog */}
      <TaskColumn
        status="backlog"
        title="Backlog"
        tasks={backlogTasks}
        onEdit={onEdit}
        onDelete={onDelete}
        onCardClick={onCardClick}
      />

      {/* 2. Todo */}
      <TaskColumn
        status="todo"
        title="Todo"
        tasks={todoTasks}
        onEdit={onEdit}
        onDelete={onDelete}
        onCardClick={onCardClick}
      />

      {/* 3. In Progress */}
      <TaskColumn
        status="in-progress"
        title="In Progress"
        tasks={inProgressTasks}
        onEdit={onEdit}
        onDelete={onDelete}
        onCardClick={onCardClick}
      />

      {/* 4. Review */}
      <TaskColumn
        status="review"
        title="Review"
        tasks={reviewTasks}
        onEdit={onEdit}
        onDelete={onDelete}
        onCardClick={onCardClick}
      />

      {/* 5. Done */}
      <TaskColumn
        status="done"
        title="Completed"
        tasks={doneTasks}
        onEdit={onEdit}
        onDelete={onDelete}
        onCardClick={onCardClick}
      />
    </div>
  );
}
