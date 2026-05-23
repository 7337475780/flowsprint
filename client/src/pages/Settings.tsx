import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card.js';
import { Button } from '../components/ui/Button.js';
import { Settings as SettingsIcon, Shield, Bell, Moon, Sun, AlertTriangle } from 'lucide-react';
import { useUIStore } from '../store/useUIStore.js';

// Define Settings Zod Schema
const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  workspaceName: z.string().min(3, 'Workspace name must be at least 3 characters'),
  notificationsEnabled: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Settings() {
  const { theme, toggleTheme } = useUIStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "Alex Mercer",
      email: "alex@flowsprint.io",
      workspaceName: "FlowSprint Engineering",
      notificationsEnabled: true,
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert(`Form submitted successfully!\n${JSON.stringify(data, null, 2)}`);
  };

  return (
    <div className="space-y-8 animate-pulse-subtle max-w-4xl">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Configure your personal profile preferences, notification triggers, and dark theme choices.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left hand tabs outline mock */}
        <div className="space-y-1">
          <button className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm font-medium rounded-md bg-secondary text-foreground">
            <SettingsIcon className="h-4 w-4" />
            Profile Configuration
          </button>
          <button className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
            <Shield className="h-4 w-4" />
            Security & Credentials
          </button>
          <button className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-4 w-4" />
            Notification Subscriptions
          </button>
        </div>

        {/* Right hand forms grid container */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* Theme custom settings card */}
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Display Theme</CardTitle>
              <CardDescription>Select between light and dark themes to optimize your workspace lighting.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <>
                    <Moon className="h-5 w-5 text-indigo-400" />
                    <div>
                      <span className="text-sm font-medium block">Dark Mode Active</span>
                      <span className="text-xs text-muted-foreground">Default premium theme tailored for developers.</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Sun className="h-5 w-5 text-amber-500" />
                    <div>
                      <span className="text-sm font-medium block">Light Mode Active</span>
                      <span className="text-xs text-muted-foreground">High contrast theme optimized for daylight.</span>
                    </div>
                  </>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                Switch Theme
              </Button>
            </CardContent>
          </Card>

          {/* Form setup using React Hook Form & Zod */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle>Workspace Profile Details</CardTitle>
                <CardDescription>Modify name descriptors used in task lists and sprint backlogs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Full name field */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider block">Full Name</label>
                  <input
                    type="text"
                    {...register('fullName')}
                    className="w-full px-3 py-2 text-sm bg-secondary border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.fullName && (
                    <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {errors.fullName.message}
                    </span>
                  )}
                </div>

                {/* Email address field */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider block">Email Address</label>
                  <input
                    type="text"
                    {...register('email')}
                    className="w-full px-3 py-2 text-sm bg-secondary border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.email && (
                    <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {errors.email.message}
                    </span>
                  )}
                </div>

                {/* Workspace Name field */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider block">Workspace Domain</label>
                  <input
                    type="text"
                    {...register('workspaceName')}
                    className="w-full px-3 py-2 text-sm bg-secondary border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  {errors.workspaceName && (
                    <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {errors.workspaceName.message}
                    </span>
                  )}
                </div>

                {/* Notifications toggle */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-sm font-medium block">Sprint Notifications</span>
                    <span className="text-xs text-muted-foreground">Receive browser sound triggers when a task is moved to review.</span>
                  </div>
                  <input
                    type="checkbox"
                    {...register('notificationsEnabled')}
                    className="h-4.5 w-4.5 text-primary rounded bg-secondary border-input accent-primary cursor-pointer"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button type="button" variant="ghost" size="sm">
                  Discard
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
