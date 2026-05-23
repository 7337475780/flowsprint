import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Moon,
  Sun,
  AlertTriangle,
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader.js';
import { useUIStore } from '../store/useUIStore.js';
import { useAuthStore } from '../store/authStore.js';

// Define Settings Zod Schema
const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  workspaceName: z.string().min(3, 'Workspace name must be at least 3 characters'),
  notificationsEnabled: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { theme, toggleTheme } = useUIStore();
  const { user, setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.name || 'Alex Mercer',
      email: user?.email || 'alex@flowsprint.io',
      workspaceName: 'FlowSprint Engineering Workspace',
      notificationsEnabled: true,
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Update local store profile for immediate UI response
    if (user) {
      setUser({
        ...user,
        name: data.fullName,
        email: data.email,
      });
    }
    toast.success('Workspace profile settings updated successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Settings"
        description="Configure display theme interfaces, notifications, and workspace profile parameters."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left hand tabs layout */}
        <div className="space-y-1">
          <button className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm font-semibold rounded-lg bg-primary/10 text-primary border border-primary/20">
            <SettingsIcon className="h-4 w-4" />
            Profile Configuration
          </button>
          <button className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all">
            <Shield className="h-4 w-4" />
            Security & Keys
          </button>
          <button className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all">
            <Bell className="h-4 w-4" />
            Notifications
          </button>
        </div>

        {/* Right hand forms container */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* Theme display settings card */}
          <div className="rounded-xl border bg-card p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <>
                  <Moon className="h-5 w-5 text-indigo-400" />
                  <div>
                    <span className="text-sm font-bold block leading-tight">Dark Mode Theme</span>
                    <span className="text-2xs text-muted-foreground">Default premium theme tailored for developer focus.</span>
                  </div>
                </>
              ) : (
                <>
                  <Sun className="h-5 w-5 text-amber-500" />
                  <div>
                    <span className="text-sm font-bold block leading-tight">Light Mode Theme</span>
                    <span className="text-2xs text-muted-foreground">High contrast theme optimized for daylight environments.</span>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border hover:bg-secondary transition-colors"
            >
              Switch Theme
            </button>
          </div>

          {/* Form setup using React Hook Form & Zod */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-heading font-bold text-base">Workspace Profile</h3>
                <p className="text-2xs text-muted-foreground mt-0.5">Modify profile name descriptors and email aliases.</p>
              </div>

              {/* Full name field */}
              <div className="space-y-1.5">
                <label className="text-3xs font-extrabold uppercase text-muted-foreground tracking-widest block">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register('fullName')}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.fullName && (
                  <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {errors.fullName.message}
                  </span>
                )}
              </div>

              {/* Email address field */}
              <div className="space-y-1.5">
                <label className="text-3xs font-extrabold uppercase text-muted-foreground tracking-widest block">
                  Email Address
                </label>
                <input
                  type="text"
                  {...register('email')}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.email && (
                  <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Workspace Name field */}
              <div className="space-y-1.5">
                <label className="text-3xs font-extrabold uppercase text-muted-foreground tracking-widest block">
                  Workspace Domain
                </label>
                <input
                  type="text"
                  {...register('workspaceName')}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {errors.workspaceName && (
                  <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {errors.workspaceName.message}
                  </span>
                )}
              </div>

              {/* Notifications toggle */}
              <div className="flex items-center justify-between border-t pt-4 mt-2">
                <div>
                  <span className="text-sm font-semibold block leading-tight">Sprint Notifications</span>
                  <span className="text-2xs text-muted-foreground">Receive browser sound triggers when a task is moved to review.</span>
                </div>
                <input
                  type="checkbox"
                  {...register('notificationsEnabled')}
                  className="h-4.5 w-4.5 text-primary rounded bg-secondary border-input accent-primary cursor-pointer"
                />
              </div>

              <div className="border-t pt-4 flex justify-end gap-2 mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/95 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
