import KanbanColumn from './KanbanColumn.js';
import type { Project } from '../api/projectApi.js';

interface KanbanBoardProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export default function KanbanBoard({ projects, onEdit, onDelete }: KanbanBoardProps) {
  // Sort projects into status buckets
  const planningProjects = projects.filter((p) => p.status === 'planning');
  const activeProjects = projects.filter((p) => p.status === 'active');
  const onHoldProjects = projects.filter((p) => p.status === 'on-hold');
  const completedProjects = projects.filter((p) => p.status === 'completed');

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-start w-full">
      {/* 1. Planning */}
      <KanbanColumn
        status="planning"
        title="Planning"
        projects={planningProjects}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* 2. Active */}
      <KanbanColumn
        status="active"
        title="Active"
        projects={activeProjects}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* 3. On Hold */}
      <KanbanColumn
        status="on-hold"
        title="On Hold"
        projects={onHoldProjects}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* 4. Completed */}
      <KanbanColumn
        status="completed"
        title="Completed"
        projects={completedProjects}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
