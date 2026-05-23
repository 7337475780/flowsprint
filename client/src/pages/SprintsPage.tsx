import PageHeader from '../components/common/PageHeader.js';
import EmptyState from '../components/common/EmptyState.js';
import { Zap, Plus } from 'lucide-react';

export default function SprintsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sprints"
        description="Plan and track your agile sprint cycles."
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" /> New Sprint
          </button>
        }
      />
      <EmptyState
        icon={Zap}
        title="No sprints planned"
        description="Create a sprint, assign tasks, and start tracking your velocity."
      />
    </div>
  );
}
