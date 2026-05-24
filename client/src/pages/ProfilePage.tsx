import PageHeader from '../components/common/PageHeader.js';
import { useAuthStore } from '../store/authStore.js';
import AvatarUploader from '../features/profile/components/AvatarUploader.js';
import ActivityLog from '../features/profile/components/ActivityLog.js';
import { Mail, Shield, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PageHeader
        title="Member Profile"
        description="Overview your workspace actions, personal descriptors, and login security credentials."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Hand: Profile Summary Card */}
        <div className="space-y-6">
          <div className="bg-card/65 backdrop-blur-xs border p-6 rounded-2xl shadow-3xs text-center space-y-4">
            <AvatarUploader />

            <div className="border-t pt-4 text-left space-y-3.5 text-2xs text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <span className="block text-4xs uppercase tracking-wider opacity-60">Primary Identity</span>
                  <span className="font-sans text-xs font-semibold text-foreground truncate block leading-tight">
                    {user?.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="block text-4xs uppercase tracking-wider opacity-60">Access privilege</span>
                  <span className="font-sans text-xs font-extrabold text-foreground capitalize block leading-tight">
                    {user?.role} Role
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="block text-4xs uppercase tracking-wider opacity-60">Member since</span>
                  <span className="font-sans text-xs font-semibold text-foreground block leading-tight">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Short Bio Card */}
          <div className="bg-card/65 backdrop-blur-xs border p-5 rounded-2xl shadow-3xs space-y-2.5">
            <span className="text-3xs font-extrabold uppercase tracking-widest text-muted-foreground block">
              Biography & Summary
            </span>
            {user?.bio ? (
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {user.bio}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No personal biography details set yet. Navigate to Settings to establish your profile descriptors.
              </p>
            )}
          </div>
        </div>

        {/* Right Hand: Activity log & stats summary */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* Quick Metrics */}
          <div className="grid gap-4 grid-cols-3">
            <div className="bg-card/45 border p-4 rounded-xl shadow-2xs">
              <span className="block text-4xs font-mono font-extrabold uppercase tracking-wider text-muted-foreground opacity-70">
                Story points
              </span>
              <span className="text-base font-extrabold text-primary font-mono block mt-1">
                24 pts
              </span>
            </div>
            <div className="bg-card/45 border p-4 rounded-xl shadow-2xs">
              <span className="block text-4xs font-mono font-extrabold uppercase tracking-wider text-muted-foreground opacity-70">
                Tasks resolved
              </span>
              <span className="text-base font-extrabold text-foreground font-mono block mt-1">
                12 tickets
              </span>
            </div>
            <div className="bg-card/45 border p-4 rounded-xl shadow-2xs">
              <span className="block text-4xs font-mono font-extrabold uppercase tracking-wider text-muted-foreground opacity-70">
                Active sprints
              </span>
              <span className="text-base font-extrabold text-emerald-400 font-mono block mt-1">
                2 active
              </span>
            </div>
          </div>

          <ActivityLog />
        </div>
      </div>
    </div>
  );
}
