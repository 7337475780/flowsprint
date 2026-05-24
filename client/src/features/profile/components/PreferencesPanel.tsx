import { useAuthStore } from '../../../store/authStore.js';
import { useUpdatePreferencesMutation } from '../hooks/useProfile.js';
import { Mail, Zap, UserCheck, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils.js';

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        checked
          ? 'bg-primary'
          : 'bg-secondary border border-border'
      )}
    >
      {/* FIX 1: h-4.5 w-4.5 are invalid Tailwind classes — replaced with h-[18px] w-[18px] */}
      <span
        className={cn(
          'inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-sm transition-transform duration-300',
          checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
        )}
      />
    </button>
  );
}

export default function PreferencesPanel() {
  const user = useAuthStore((s) => s.user);
  const updatePrefsMutation = useUpdatePreferencesMutation();

  const preferences = user?.preferences || {
    emailNotifications: true,
    taskAlerts: true,
    sprintAlerts: true,
    mentionAlerts: true,
  };

  const handleToggle = async (key: string, currentValue: boolean) => {
    updatePrefsMutation.mutate({
      [key]: !currentValue,
    } as any);
  };

  const alertOptions = [
    {
      key: 'emailNotifications',
      title: 'Email Digest Reports',
      desc: 'Receive comprehensive reports on project developments directly to your inbox.',
      icon: Mail,
      theme: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
    },
    {
      key: 'taskAlerts',
      title: 'Task Assignment Triggers',
      desc: 'Alert when you are established as assignee or reviewer of a backlog ticket.',
      icon: UserCheck,
      theme: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    },
    {
      key: 'sprintAlerts',
      title: 'Sprint Board Transitions',
      desc: 'Notify when sprints boot, conclude, or task status shifts columns.',
      icon: Zap,
      theme: 'text-amber-500 bg-amber-500/10 border-amber-500/25',
    },
    {
      key: 'mentionAlerts',
      title: 'Direct Comments & Mentions',
      desc: 'Get notified when members tag you in task discussion comment logs.',
      icon: MessageSquare,
      // FIX 2: changed from rose (which caused purple/pink title tint) to a neutral blue theme
      theme: 'text-blue-400 bg-blue-500/10 border-blue-500/25',
    },
  ];

  return (
    <div className="bg-card/65 backdrop-blur-xs border p-5 rounded-2xl shadow-3xs relative overflow-hidden">

      {/* Loading overlay */}
      {updatePrefsMutation.isPending && (
        <div className="absolute inset-0 bg-card/45 backdrop-blur-sm flex items-center justify-center z-10 animate-in fade-in duration-200">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      )}

      {/* Section header */}
      <div className="mb-5">
        <h3 className="font-heading font-extrabold text-sm text-foreground tracking-tight select-none">
          Notification Preferences
        </h3>
        <p className="text-3xs text-muted-foreground font-medium mt-0.5">
          Select notification channels and trigger parameters for alerts.
        </p>
      </div>

      {/* Notification rows */}
      <div className="space-y-0">
        {alertOptions.map((opt, idx) => {
          const isChecked = !!(preferences as any)[opt.key];
          const Icon = opt.icon;
          const isLast = idx === alertOptions.length - 1;

          return (
            <div
              key={opt.key}
              onClick={() => handleToggle(opt.key, isChecked)}
              className={cn(
                'flex items-center justify-between py-4 cursor-pointer group select-none',
                !isLast && 'border-b border-white/10'
              )}
            >
              <div className="flex gap-3.5 items-center min-w-0">

                {/* Icon badge */}
                <div className={cn(
                  'h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 shadow-3xs',
                  opt.theme
                )}>
                  <Icon className="h-4 w-4" />
                </div>

                <div className="space-y-0.5 min-w-0">
                  <span className="text-xs font-semibold text-foreground block leading-tight">
                    {opt.title}
                  </span>
                  <p className="text-3xs text-muted-foreground leading-normal whitespace-normal break-words">
                    {opt.desc}
                  </p>
                </div>
              </div>

              <div
                className="ml-4 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <ToggleSwitch
                  checked={isChecked}
                  onChange={() => handleToggle(opt.key, isChecked)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}