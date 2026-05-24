import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, Save } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore.js';
import { useUpdateProfileMutation } from '../hooks/useProfile.js';

const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  bio:  z.string().max(1000, 'Bio cannot exceed 1000 characters').optional(),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

// ── Shared field label: 11px uppercase tracking per spec ──
const LBL = 'block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-1.5';

// ── Shared input: h-10 (40px), consistent border + focus ring ──
const INPUT =
  'w-full h-10 px-3 text-sm rounded-lg border border-border bg-card/40 text-foreground ' +
  'placeholder:text-muted-foreground/50 ' +
  'focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/25 ' +
  'transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

export default function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const updateProfileMutation = useUpdateProfileMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: user?.name || '', bio: user?.bio || '' },
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border bg-card rounded-xl p-6 space-y-5"
    >
      {/* ── Section header: 16px 600 per spec (h2 scale) ── */}
      <div className="pb-3 border-b border-border">
        <h2 className="text-base font-semibold text-foreground leading-tight">
          Personal Information
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Update your display name and biography visible to workspace members.
        </p>
      </div>

      {/* Full Name */}
      <div>
        <label className={LBL}>Full Name</label>
        <input
          type="text"
          {...register('name')}
          className={INPUT}
          placeholder="e.g. Alex Mercer"
        />
        {errors.name && (
          <p className="flex items-center gap-1 mt-1.5 text-xs text-rose-500">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email — read-only */}
      <div>
        <label className={LBL}>Email Address</label>
        <input
          type="email"
          value={user?.email || ''}
          disabled
          placeholder="your@email.com"
          className={INPUT}
        />
        {/* Caption hint: 12px muted per spec */}
        <p className="mt-1.5 text-[12px] text-muted-foreground">
          Email is used as your login identity and cannot be changed here.
        </p>
      </div>

      {/* Bio — textarea */}
      <div>
        <label className={LBL}>Personal Biography</label>
        <textarea
          rows={4}
          {...register('bio')}
          className={
            'w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-card/40 text-foreground ' +
            'placeholder:text-muted-foreground/50 min-h-[96px] resize-y custom-scrollbar ' +
            'focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/25 ' +
            'transition-all duration-150'
          }
          placeholder="Tell your team a bit about yourself..."
        />
        {errors.bio && (
          <p className="flex items-center gap-1 mt-1.5 text-xs text-rose-500">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.bio.message}
          </p>
        )}
      </div>

      {/* Save button — RIGHT-ALIGNED inside card, not floating outside */}
      <div className="flex justify-end pt-3 border-t border-border">
        <button
          type="submit"
          disabled={updateProfileMutation.isPending}
          className={cn(
            'inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90 active:scale-[0.98] transition-all duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {updateProfileMutation.isPending ? (
            <div className="h-4 w-4 border-2 border-t-transparent border-primary-foreground rounded-full animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
