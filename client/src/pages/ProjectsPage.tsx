import PageHeader from '../components/common/PageHeader.js';
import EmptyState from '../components/common/EmptyState.js';
import { FolderKanban, Plus } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage and track all your workspace projects."
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> New Project
          </button>
        }
      />
      <EmptyState
        icon={FolderKanban}
        title="No projects yet"
        description="Create your first project to start organizing tasks and sprints."
      />
    </div>
  );
}
