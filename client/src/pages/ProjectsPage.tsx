import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FolderKanban, Plus, Grid, KanbanSquare, Loader2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.js';
import EmptyState from '../components/common/EmptyState.js';
import { useAuthStore } from '../store/authStore.js';
import { cn } from '../lib/utils.js';
import { hasPermission } from '../lib/permissions.js';

// Modular Feature Imports
import {
  useProjectsQuery,
  useProjectStatsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
} from '../features/projects/hooks/useProjects.js';
import { updateProject } from '../features/projects/api/projectApi.js';
import ProjectCard from '../features/projects/components/ProjectCard.js';
import ProjectStats from '../features/projects/components/ProjectStats.js';
import ProjectSearch from '../features/projects/components/ProjectSearch.js';
import ProjectFilters from '../features/projects/components/ProjectFilters.js';
import ProjectPagination from '../features/projects/components/ProjectPagination.js';
import ProjectModal from '../features/projects/components/ProjectModal.js';
import KanbanBoard from '../features/projects/components/KanbanBoard.js';
import type { ProjectInput, Project } from '../features/projects/api/projectApi.js';
import AttachmentSection from '../features/files/components/AttachmentSection.js';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  // Layout View States
  const [view, setView] = useState<'grid' | 'board' | 'files'>('grid');
  const [selectedProjectForFiles, setSelectedProjectForFiles] = useState<string | null>(null);

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [archived, setArchived] = useState('false');
  const [page, setPage] = useState(1);

  // Modal Dialog States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // ─── Queries & Mutations ───────────────────────────────────────────────────
  const params = {
    page: view === 'board' ? 1 : page,
    limit: view === 'board' ? 100 : 6,
    q: search || undefined,
    status: status || undefined,
    priority: priority || undefined,
    archived: archived === 'true',
  };

  const { data, isLoading } = useProjectsQuery(params);
  const { data: stats } = useProjectStatsQuery();

  const createMutation = useCreateProjectMutation();
  const deleteMutation = useDeleteProjectMutation();

  // Dynamic Edit Mutation
  const editMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProjectInput> }) =>
      updateProject(id, payload),
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ['projects-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['projects-stats-overview'] });
      queryClient.invalidateQueries({ queryKey: ['project-details', updatedData._id] });
      toast.success(`Project "${updatedData.name}" updated successfully!`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update project';
      toast.error(msg);
    },
  });

  const isEditor = hasPermission(user, 'create:project');

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProject(null);
    setModalOpen(false);
  };

  const handleModalSubmit = async (payload: ProjectInput) => {
    try {
      if (editingProject) {
        await editMutation.mutateAsync({ id: editingProject._id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      handleCloseModal();
    } catch {
      // Errors handled within query client toasts
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (
      confirm(
        'Are you sure you want to hard remove this project workspace? All associated sprints and tasks may become unlinked.'
      )
    ) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        // Errors handled within query client toasts
      }
    }
  };

  const handleSearch = (val: string) => {
    setSearch(val);
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

  // ─── Render View Modes ──────────────────────────────────────────────────────
  const renderProjectsGrid = (projectsList: Project[]) => {
    if (projectsList.length === 0) {
      return (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Try adjusting your active search filters or add a new project workspace."
          action={
            isEditor ? (
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all font-medium active:scale-95 shadow-sm"
              >
                <Plus className="h-4 w-4" /> Create new project
              </button>
            ) : undefined
          }
        />
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 glassmorphism">
          {projectsList.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>

        {data && (
          <ProjectPagination
            page={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    );
  };

  const renderKanbanBoard = (projectsList: Project[]) => {
    return (
      <KanbanBoard
        projects={projectsList}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteProject}
      />
    );
  };

  const renderFilesBrowser = (projectsList: Project[]) => {
    if (projectsList.length === 0) {
      return (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Create a project workspace to begin managing project-level file attachments."
        />
      );
    }

    const activeProjId = selectedProjectForFiles || projectsList[0]?._id;
    const activeProject = projectsList.find((p) => p._id === activeProjId) || projectsList[0];

    return (
      <div className="grid gap-6 md:grid-cols-[240px_1fr] bg-card/65 border p-5 sm:p-6.5 rounded-2xl shadow-3xs min-h-[500px]">
        {/* Left Side: Projects List */}
        <div className="space-y-3.5 border-r pr-5.5 md:block">
          <span className="text-3xs font-mono font-extrabold uppercase tracking-widest text-muted-foreground block mb-2">
            Select Workspace
          </span>
          <div className="space-y-1.5 max-h-[480px] overflow-y-auto custom-scrollbar">
            {projectsList.map((p) => {
              const active = activeProjId === p._id;
              return (
                <button
                  key={p._id}
                  onClick={() => setSelectedProjectForFiles(p._id)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between group',
                    active
                      ? 'bg-primary text-primary-foreground border-primary font-bold shadow-sm'
                      : 'bg-card hover:bg-secondary/40 border-secondary text-foreground hover:-translate-x-0.5'
                  )}
                >
                  <div className="min-w-0">
                    <span className={cn(
                      'text-xs truncate block transition-colors leading-none font-bold',
                      active ? 'text-primary-foreground' : 'text-foreground group-hover:text-primary'
                    )}>
                      {p.name}
                    </span>
                    <span className={cn(
                      'font-mono text-4xs uppercase tracking-widest block mt-1.5 leading-none',
                      active ? 'text-primary-foreground/75' : 'text-muted-foreground'
                    )}>
                      {p.key}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Grouped Project Files Viewer */}
        <div className="space-y-4 min-w-0">
          {activeProject ? (
            <div className="space-y-4">
              <div className="border-b pb-3.5">
                <h3 className="font-heading font-extrabold text-base text-foreground tracking-tight">
                  {activeProject.name} Workspace Assets
                </h3>
                <p className="text-3xs text-muted-foreground font-medium mt-0.5">
                  Project short code: <span className="font-mono text-primary font-bold">{activeProject.key}</span>
                </p>
              </div>
              <AttachmentSection projectId={activeProject._id} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FolderKanban className="h-10 w-10 text-muted-foreground opacity-60 animate-pulse mb-3" />
              <p className="text-xs text-muted-foreground font-bold">Please select a project from the left panel</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const projects = data?.data ?? [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-b from-primary/5 via-background/10 to-background/5 glassmorphism">
      {/* Page Header */}
      <PageHeader
        title="Projects"
        description="Establish and coordinate project parameters across your workspace spaces."
        actions={
          isEditor ? (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-sm active:scale-95"
            >
              <Plus className="h-4 w-4" /> New Project
            </button>
          ) : null
        }
      />

      {/* Analytics KPIs row */}
      <ProjectStats stats={stats} />

      {/* Filters & Layout Toggles toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 border rounded-2xl shadow-3xs glassmorphism">
        <div className="flex-1 max-w-md">
          <ProjectSearch
            initialValue={search}
            onSearch={handleSearch}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <ProjectFilters
            status={status}
            priority={priority}
            archived={archived}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onArchivedChange={handleArchivedChange}
          />

          {/* View Toggles */}
          <div className="flex items-center gap-1 border rounded-lg bg-secondary/50 p-1 self-stretch md:self-auto">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'flex-1 md:flex-initial p-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 text-xs font-semibold',
                view === 'grid'
                  ? 'bg-card text-foreground shadow-3xs border'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Grid/List view"
            >
              <Grid className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setView('board')}
              className={cn(
                'flex-1 md:flex-initial p-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 text-xs font-semibold',
                view === 'board'
                  ? 'bg-card text-foreground shadow-3xs border'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Kanban Board view"
            >
              <KanbanSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              onClick={() => setView('files')}
              className={cn(
                'flex-1 md:flex-initial p-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 text-xs font-semibold',
                view === 'files'
                  ? 'bg-card text-foreground shadow-3xs border'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Files explorer view"
            >
              <FolderKanban className="h-4 w-4" />
              <span className="hidden sm:inline">Files</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed rounded-2xl bg-card/50">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-sm text-muted-foreground font-medium">
            Fetching project workspaces...
          </p>
        </div>
      ) : view === 'board' ? (
        renderKanbanBoard(projects)
      ) : view === 'files' ? (
        renderFilesBrowser(projects)
      ) : (
        renderProjectsGrid(projects)
      )}

      {/* Reusable Project Creation / Edit modal */}
      <ProjectModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        project={editingProject}
      />
    </div>
  );
}
