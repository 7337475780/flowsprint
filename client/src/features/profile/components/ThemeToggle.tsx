import { Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore.js';
import { useUpdatePreferencesMutation } from '../hooks/useProfile.js';
import { cn } from '../../../lib/utils.js';

const THEMES = [
  {
    id: 'light' as const,
    label: 'Light mode',
    desc: 'Optimized for daytime focus.',
    icon: Sun,
    iconTheme: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  {
    id: 'dark' as const,
    label: 'Dark mode',
    desc: 'Premium dark aesthetic.',
    icon: Moon,
    iconTheme: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  },
];

export default function ThemeToggle() {
  const user = useAuthStore((s) => s.user);
  const updatePrefsMutation = useUpdatePreferencesMutation();

  const currentTheme = user?.preferences?.theme || 'dark';

  const handleSelectTheme = (theme: 'light' | 'dark') => {
    if (currentTheme === theme) return;
    updatePrefsMutation.mutate({ theme });
  };

  return (
    <div className="bg-card/65 backdrop-blur-xs border p-6 rounded-2xl shadow-3xs space-y-5">
      {/* Section header */}
      <div>
        <h3 className="font-heading font-extrabold text-base text-foreground tracking-tight select-none">
          Interface Appearance Theme
        </h3>
        <p className="text-3xs text-muted-foreground font-medium mt-0.5">
          Select display theme interfaces tailored for light or focus developer viewports.
        </p>
      </div>

      {/* Theme option cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {THEMES.map((t) => {
          const selected = currentTheme === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectTheme(t.id)}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left select-none group',
                'hover:-translate-y-0.5 hover:shadow-sm active:scale-95',
                selected
                  // Use brand purple consistently for selected state
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/25 shadow-sm'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/30'
              )}
              aria-pressed={selected}
            >
              <div className={cn(
                'h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors',
                selected ? t.iconTheme : 'bg-secondary border-border'
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0 space-y-0.5">
                <span className={cn(
                  'text-xs font-bold block leading-none transition-colors',
                  selected ? 'text-foreground font-extrabold' : 'text-muted-foreground group-hover:text-foreground'
                )}>
                  {t.label}
                </span>
                <span className="text-4xs text-muted-foreground block leading-none">
                  {t.desc}
                </span>
              </div>
              {/* Selected indicator dot */}
              <div className={cn(
                'h-2.5 w-2.5 rounded-full shrink-0 transition-all',
                selected ? 'bg-primary scale-100' : 'bg-transparent scale-0'
              )} />
            </button>
          );
        })}
      </div>

      {/* Preview hint */}
      <p className="text-4xs text-muted-foreground font-mono tracking-wide border-t border-border pt-4">
        Theme changes apply instantly across the entire workspace.
      </p>
    </div>
  );
}
