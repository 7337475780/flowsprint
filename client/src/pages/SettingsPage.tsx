import PageHeader from '../components/common/PageHeader.js';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account preferences and workspace configuration."
      />
      <div className="rounded-xl border bg-card p-8 flex flex-col items-center text-center gap-3">
        <div className="p-3 bg-muted rounded-xl">
          <Settings className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Settings coming soon</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Profile management, notification preferences, and workspace settings will be available here.
        </p>
      </div>
    </div>
  );
}
