import PageHeader from '../components/common/PageHeader.js';
import EmptyState from '../components/common/EmptyState.js';
import { ListTodo, Plus } from 'lucide-react';

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="View and manage tasks across all your projects."
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> Create Task
          </button>
        }
      />
      <EmptyState
        icon={ListTodo}
        title="No tasks found"
        description="Tasks assigned to you or your team will appear here."
      />
    </div>
  );
}
