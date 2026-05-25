import { useState } from 'react';
import { User, Shield, Bell, Moon, Database } from 'lucide-react';
import AvatarUploader from '../features/profile/components/AvatarUploader.js';
import ProfileForm from '../features/profile/components/ProfileForm.js';
import AccountDangerZone from '../features/profile/components/AccountDangerZone.js';
import PreferencesPanel from '../features/profile/components/PreferencesPanel.js';
import ThemeToggle from '../features/profile/components/ThemeToggle.js';
import SecuritySettings from '../features/profile/components/SecuritySettings.js';
import { cn } from '../lib/utils.js';
import api from '../api/axios.js';
import { toast } from 'sonner';

type TabId = 'account' | 'appearance' | 'notifications' | 'security' | 'system';

const TABS = [
  { id: 'account'       as const, label: 'My Account',       icon: User,     desc: 'Manage avatar and personal info' },
  { id: 'appearance'    as const, label: 'Appearance',       icon: Moon,     desc: 'Select interface appearance theme' },
  { id: 'notifications' as const, label: 'Notifications',     icon: Bell,     desc: 'Configure notification alerts' },
  { id: 'security'      as const, label: 'Security & Access', icon: Shield,   desc: 'Passwords and active sessions' },
  { id: 'system'        as const, label: 'System Data',      icon: Database, desc: 'Seed database metrics programmatically' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('account');
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const response = await api.post('/analytics/seed');
      if (response.data?.success) {
        toast.success(response.data.message || 'Database seeded successfully!');
      } else {
        toast.error('Failed to seed database.');
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error occurred during database seeding';
      toast.error(msg);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page header ── */}
      <div className="pb-6 border-b">
        <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
          Workspace Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-xl leading-relaxed">
          Configure display themes, notification channels, security passwords, and account preferences.
        </p>
      </div>

      {/* ── Settings Layout ── */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* ── Left settings navigation ── */}
        <div className="w-full md:w-[200px] md:shrink-0 md:sticky md:top-4">
          <div className={cn('flex gap-1.5 md:flex-col overflow-x-auto md:overflow-x-visible scrollbar-none pb-1 md:pb-0')}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.desc}
                  className={cn(
                    'flex items-center gap-2.5 h-10 px-3 rounded-lg text-sm font-medium',
                    'transition-all duration-150 select-none shrink-0',
                    'md:w-full whitespace-nowrap',
                    active
                      ? 'bg-primary/15 text-white border-l-[3px] border-primary pl-[9px] font-semibold'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right content panel ── */}
        <div className="flex-1 min-w-0 max-w-[720px] space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* 1. My Account */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="border bg-card rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
                <AvatarUploader className="shrink-0" />
                <div className="space-y-1 text-center sm:text-left">
                  <h2 className="text-lg font-semibold text-foreground leading-tight">
                    Workspace Avatar
                  </h2>
                  <p className="text-xs text-muted-foreground leading-normal max-w-xs">
                    Click the avatar to upload a new image. Supports JPG, PNG, GIF — max 5MB.
                  </p>
                </div>
              </div>
              <ProfileForm />
              <div className="pt-2">
                <AccountDangerZone />
              </div>
            </div>
          )}

          {/* 2. Appearance */}
          {activeTab === 'appearance' && (
            <ThemeToggle />
          )}

          {/* 3. Notifications */}
          {activeTab === 'notifications' && (
            <PreferencesPanel />
          )}

          {/* 4. Security */}
          {activeTab === 'security' && (
            <SecuritySettings />
          )}

          {/* 5. System Data (Seeding) */}
          {activeTab === 'system' && (
            <div className="border bg-card rounded-xl p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground font-heading">
                  System Database Seeding
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Inject gorgeous, realistic agile planning metrics, sprint cycles, and task discussions directly into your active database.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-secondary/30 border border-secondary/50 space-y-3">
                <span className="text-xs font-semibold text-primary block uppercase tracking-wider">Cloud Atlas Integration Ready</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This action triggers a backend seeding operation. It will run against whichever database your server is connected to (configured via <code>MONGO_URI</code> in the backend <code>.env</code> file). 
                  If your server is deployed or running with a MongoDB Atlas cloud URI, this will push all data directly to your Atlas database!
                </p>
                <div className="text-xs text-amber-500 font-medium">
                  ⚠️ WARNING: This will clear existing Project, Sprint, Task, and Notification documents to ensure perfect telemetry constraints.
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  disabled={isSeeding}
                  onClick={handleSeed}
                  className={cn(
                    "h-10 px-6 rounded-lg text-sm font-semibold text-white select-none transition-all flex items-center gap-2",
                    isSeeding 
                      ? "bg-primary/50 cursor-not-allowed" 
                      : "bg-primary hover:bg-primary/95 active:scale-[0.98] shadow-md shadow-primary/10"
                  )}
                >
                  {isSeeding ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Seeding Database...
                    </>
                  ) : (
                    "Seed Realistic Agile Data"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
