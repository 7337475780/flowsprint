import PageHeader from '../components/common/PageHeader.js';
import EmptyState from '../components/common/EmptyState.js';
import { Users } from 'lucide-react';

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="View workspace members and their workload."
      />
      <EmptyState
        icon={Users}
        title="No team members yet"
        description="Invite colleagues to collaborate on projects and sprints."
      />
    </div>
  );
}
