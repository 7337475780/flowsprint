import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ListTodo, Plus, Grid, KanbanSquare, Loader2, Trash2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.js';
import EmptyState from '../components/common/EmptyState.js';
import { useAuthStore } from '../store/authStore.js';
import { cn } from '../lib/utils.js';

// Modular Feature Imports
import {
  useTasksQuery,
  useTaskStatsQuery,
  useCreateTaskMutation,
  useDeleteTaskMutation,
} from '../features/tasks/hooks/useTasks.js';
import { updateTask } from '../features/tasks/api/taskApi.js';
import { useProjectsQuery } from '../features/projects/hooks/useProjects.js';
import { useSprints } from '../hooks/useSprints.js';

// Feature Components
import TaskStats from '../features/tasks/components/TaskStats.js';
import TaskSearch from '../features/tasks/components/TaskSearch.js';
import TaskFilters from '../features/tasks/components/TaskFilters.js';
import TaskPagination from '../features/tasks/components/TaskPagination.js';
import TaskModal from '../features/tasks/components/TaskModal.js';
import TaskDrawer from '../features/tasks/components/TaskDrawer.js';
import TaskBoard from '../features/tasks/components/TaskBoard.js';
import type { TaskInput, Task } from '../features/tasks/api/taskApi.js';

export default function TasksPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  // View States
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [sprintId, setSprintId] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [archived, setArchived] = useState('false');
  const [page, setPage] = useState(1);

  // Dialog & Detail Slider States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // ─── Queries & Queries List ───────────────────────────────────────────────
  const params = {
    page: viewMode === 'board' ? 1 : page,
    limit: viewMode === 'board' ? 100 : 6,
    projectId: projectId || undefined,
    sprintId: sprintId || undefined,
    status: status || undefined,
    priority: priority || undefined,
    archived: archived === 'true',
    q: search || undefined,
  };

  const { data: tasksData, isLoading: tasksLoading } = useTasksQuery(params);
  const { data: stats } = useTaskStatsQuery(projectId || undefined);

  // Reference lists for filter dropdowns
  const { data: projectsData } = useProjectsQuery({ limit: 100 });
  const projectsList = projectsData?.data ?? [];

  const { data: sprintsData } = useSprints({ project: projectId || undefined, limit: 100 });
  const sprintsList = sprintsData?.sprints ?? [];

  // Mutations
  const createMutation = useCreateTaskMutation();
  const deleteMutation = useDeleteTaskMutation();

  // Dynamic Edit Mutation
  const editMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TaskInput> }) =>
      updateTask(id, payload),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-stats-overview'] });
      queryClient.invalidateQueries({ queryKey: ['task-details', updatedTask._id] });
      toast.success(`Task "${updatedTask.title}" updated successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update task';
      toast.error(msg);
    },
  });

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
    setModalOpen(false);
  };

  const handleModalSubmit = async (payload: TaskInput) => {
    try {
      if (editingTask) {
        await editMutation.mutateAsync({ id: editingTask._id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      handleCloseModal();
    } catch {
      // Errors handled within mutations
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Are you sure you want to remove this task?')) {
      try {
        await deleteMutation.mutateAsync(id);
        if (activeTaskId === id) {
          setActiveTaskId(null);
        }
      } catch {
        // Errors handled within mutations
      }
    }
  };

  const handleCardClick = (task: Task) => {
    setActiveTaskId(task._id);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleProjectIdChange = (val: string) => {
    setProjectId(val);
    setSprintId(''); // Reset sprint on project switch
    setPage(1);
  };

  const handleSprintIdChange = (val: string) => {
    setSprintId(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const handlePriorityChange = (val: string) => {
    setPriority(val);
    setPage(1);
  };

  const handleArchivedChange = (val: string) => {
    setArchived(val);
    setPage(1);
  };

  // ─── Render View Layouts ───────────────────────────────────────────────────
  const renderListView = (taskList: Task[]) => {
    if (taskList.length === 0) {
      return (
        <EmptyState
          icon={ListTodo}
          title="No tasks match search"
          description="Try adjusting your active query filters or create a new backlog task ticket."
          action={
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 font-medium active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" /> Create task
            </button>
          }
        />
      );
    }

    return (
      <div className="space-y-6">
        <div className="border rounded-2xl bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b bg-secondary/30 text-3xs font-extrabold uppercase tracking-widest text-muted-foreground">
                  <th className="p-4">Task Details</th>
                  <th className="p-4">Project Key</th>
                  <th className="p-4">Task Status</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4 font-mono">Assigned</th>
                  <th className="p-4 text-right">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {taskList.map((task) => {
                  const reporterId = typeof task.reporter === 'object' ? task.reporter._id : task.reporter;
                  const isReporter = user?.role === 'admin' || user?._id === reporterId;

                  return (
                    <tr
                      key={task._id}
                      onClick={() => handleCardClick(task)}
                      className="hover:bg-secondary/15 cursor-pointer transition-colors"
                    >
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="font-heading font-extrabold text-sm text-foreground hover:text-primary transition-colors block">
                            {task.title}
                          </span>
                          {task.description && (
                            <p className="text-3xs text-muted-foreground line-clamp-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-3xs font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                          {task.project?.key ?? 'TASK'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="capitalize font-bold text-foreground">{task.status}</span>
                      </td>
                      <td className="p-4">
                        <span className="capitalize font-bold text-foreground">{task.priority}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-foreground">
                          {task.assignee?.name ?? 'Unassigned'}
                        </span>
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {isReporter && (
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                              aria-label="Delete task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {tasksData && (
          <TaskPagination
            page={page}
            totalPages={tasksData.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    );
  };

  const renderKanbanBoard = (taskList: Task[]) => {
    return (
      <TaskBoard
        tasks={taskList}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteTask}
        onCardClick={handleCardClick}
      />
    );
  };

  const tasks = tasksData?.data ?? [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <PageHeader
        title="Tasks Backlog"
        description="Scaffold, assign, prioritize, and status transition agile backlog sprint cards."
        actions={
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-sm active:scale-95"
          >
            <Plus className="h-4 w-4" /> Create Task
          </button>
        }
      />

      {/* KPI stats overview panel */}
      {projectId && <TaskStats stats={stats} />}

      {/* Toolbar filters row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 border rounded-2xl shadow-3xs">
        <div className="flex-1 max-w-md">
          <TaskSearch
            initialValue={search}
            onSearch={handleSearch}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <TaskFilters
            projectId={projectId}
            sprintId={sprintId}
            status={status}
            priority={priority}
            archived={archived}
            projects={projectsList}
            sprints={sprintsList}
            onProjectIdChange={handleProjectIdChange}
            onSprintIdChange={handleSprintIdChange}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onArchivedChange={handleArchivedChange}
          />

          {/* Grid vs Board selector */}
          <div className="flex items-center gap-1 border rounded-lg bg-secondary/50 p-1 self-stretch md:self-auto">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex-1 md:flex-initial p-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 text-xs font-semibold',
                viewMode === 'list'
                  ? 'bg-card text-foreground shadow-3xs border'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="List view"
            >
              <Grid className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={cn(
                'flex-1 md:flex-initial p-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 text-xs font-semibold',
                viewMode === 'board'
                  ? 'bg-card text-foreground shadow-3xs border'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Kanban Board view"
            >
              <KanbanSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Board/List pipeline */}
      {tasksLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-2xl bg-card/50">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-sm text-muted-foreground font-medium">Fetching backlog tasks...</p>
        </div>
      ) : viewMode === 'board' ? (
        renderKanbanBoard(tasks)
      ) : (
        renderListView(tasks)
      )}

      {/* Reusable creation/edit modal form */}
      <TaskModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        task={editingTask}
      />

      {/* Detail Slider drawer inspector */}
      <TaskDrawer
        taskId={activeTaskId}
        onClose={() => setActiveTaskId(null)}
      />
    </div>
  );
}
