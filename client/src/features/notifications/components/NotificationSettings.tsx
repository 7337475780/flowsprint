import { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore.js';
import { Mail, Bell, AtSign, RefreshCw, Play } from 'lucide-react';
import Loader from '../../../components/common/Loader.js';

export default function NotificationSettings() {
  const { preferences, isPreferencesLoading, fetchPreferences, updatePreferences } =
    useNotificationStore();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleToggle = (key: string, val: boolean) => {
    updatePreferences({ [key]: val });
  };

  if (isPreferencesLoading && !preferences) {
    return <Loader className="py-12" />;
  }

  const items = [
    {
      key: 'inAppNotifications',
      title: 'In-app Notification Center',
      desc: 'Display standard badge count indicators and dropdown alerts in top navbar.',
      icon: Bell,
      color: 'text-primary bg-primary/10',
    },
    {
      key: 'emailNotifications',
      title: 'Email Digest Alerts',
      desc: 'Receive immediate email summaries for assignments, mentions, and updates.',
      icon: Mail,
      color: 'text-indigo-500 bg-indigo-500/10',
    },
    {
      key: 'mentionAlerts',
      title: 'Teammate Mentions (@username)',
      desc: 'Notify me whenever a team member refers to my name in comments or descriptions.',
      icon: AtSign,
      color: 'text-rose-500 bg-rose-500/10',
    },
    {
      key: 'taskUpdates',
      title: 'Task Actions & Assignments',
      desc: 'Receive alerts when tasks are assigned, moved across columns, or commented on.',
      icon: RefreshCw,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      key: 'sprintUpdates',
      title: 'Sprints Progression & Analytics',
      desc: 'Alert me whenever active sprints are initialized, finalized or velocities report.',
      icon: Play,
      color: 'text-amber-500 bg-amber-500/10',
    },
  ];

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground">Notification Preferences</h3>
        <p className="text-2xs text-muted-foreground mt-0.5">
          Configure how and when you receive in-app and email alert triggers.
        </p>
      </div>

      <div className="divide-y space-y-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const isChecked = !!(preferences as any)?.[item.key];

          return (
            <div
              key={item.key}
              className={`flex items-start justify-between gap-4 ${idx > 0 ? 'pt-4' : ''}`}
            >
              <div className="flex gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${item.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground block leading-tight">
                    {item.title}
                  </span>
                  <span className="text-2xs text-muted-foreground mt-1 block max-w-lg leading-relaxed">
                    {item.desc}
                  </span>
                </div>
              </div>

              {/* iOS style toggle switch */}
              <button
                role="switch"
                aria-checked={isChecked}
                onClick={() => handleToggle(item.key, !isChecked)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                  isChecked ? 'bg-primary' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-xs ring-0 transition duration-200 ease-in-out ${
                    isChecked ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
