import { useState } from 'react';
import { User, Shield, Bell, Moon } from 'lucide-react';
import AvatarUploader from '../features/profile/components/AvatarUploader.js';
import ProfileForm from '../features/profile/components/ProfileForm.js';
import AccountDangerZone from '../features/profile/components/AccountDangerZone.js';
import PreferencesPanel from '../features/profile/components/PreferencesPanel.js';
import ThemeToggle from '../features/profile/components/ThemeToggle.js';
import SecuritySettings from '../features/profile/components/SecuritySettings.js';
import { cn } from '../lib/utils.js';

type TabId = 'account' | 'appearance' | 'notifications' | 'security';

const TABS = [
  { id: 'account'       as const, label: 'My Account',       icon: User,   desc: 'Manage avatar and personal info' },
  { id: 'appearance'    as const, label: 'Appearance',        icon: Moon,   desc: 'Select interface appearance theme' },
  { id: 'notifications' as const, label: 'Notifications',     icon: Bell,   desc: 'Configure notification alerts' },
  { id: 'security'      as const, label: 'Security & Access', icon: Shield, desc: 'Passwords and active sessions' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('account');

  return (
    // Full-page layout — no extra py/mx constraints; let DashboardLayout handle outer padding
    <div className="flex flex-col gap-6">

      {/* ── Page header — always visible, never scrolls away ── */}
      <div className="pb-6 border-b">
        {/* h1: 24px 700 per spec */}
        <h1 className="text-2xl font-bold font-heading tracking-tight text-foreground">
          Workspace Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground max-w-xl leading-relaxed">
          Configure display themes, notification channels, security passwords, and account preferences.
        </p>
      </div>

      {/* ── Three-column layout on md+: [Settings Nav 220px] [Content flex-1 max-w-[720px]] ── */}
      <div className="flex flex-col md:flex-row gap-8 items-start">

        {/* ── Left: vertical settings nav ── */}
        {/* On mobile: horizontal scrollable strip. On md+: sticky vertical column */}
        <div className="w-full md:w-[200px] md:shrink-0 md:sticky md:top-4">
          {/* Mobile: horizontal scroll, no wrap */}
          <div
            className={cn(
              'flex gap-1.5 md:flex-col',
              'overflow-x-auto md:overflow-x-visible',
              'scrollbar-none pb-1 md:pb-0'
            )}
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.desc}
                  className={cn(
                    // h-10 = 40px per spec nav item height
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

        {/* ── Right: content panel — max-w-[720px] for readability ── */}
        <div className="flex-1 min-w-0 max-w-[720px] space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">

          {/* 1. My Account */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Avatar card — 32px max padding, centered */}
              <div className="border bg-card rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
                <AvatarUploader className="shrink-0" />
                <div className="space-y-1 text-center sm:text-left">
                  {/* h2: 18px 600 per spec */}
                  <h2 className="text-lg font-semibold text-foreground leading-tight">
                    Workspace Avatar
                  </h2>
                  <p className="text-xs text-muted-foreground leading-normal max-w-xs">
                    Click the avatar to upload a new image. Supports JPG, PNG, GIF — max 5MB.
                  </p>
                </div>
              </div>

              {/* Profile info form */}
              <ProfileForm />

              {/* Danger zone — 24px gap above */}
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
        </div>
      </div>
    </div>
  );
}
