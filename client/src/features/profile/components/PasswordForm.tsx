import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, Eye, EyeOff, Key } from 'lucide-react';
import { useChangePasswordMutation } from '../hooks/useProfile.js';

const schema = z
  .object({
    oldPassword:     z.string().min(1, 'Current password is required'),
    newPassword:     z
      .string()
      .min(8, 'Must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a digit'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type Values = z.infer<typeof schema>;

// ── Shared label style: 11px uppercase tracking per global spec ──
const LBL = 'block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-1.5';

// ── Shared input style: h-10, consistent border + purple focus ring ──
const INPUT_BASE =
  'w-full h-10 pl-3 pr-10 text-sm rounded-lg border border-border bg-card/40 text-foreground ' +
  'placeholder:text-muted-foreground/50 ' +
  'focus:outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/25 ' +
  'transition-all duration-150';

export default function PasswordForm() {
  const changePasswordMutation = useChangePasswordMutation();
  const [show, setShow] = useState({ old: false, new: false, confirm: false });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (v: Values) => {
    try {
      await changePasswordMutation.mutateAsync({ oldPassword: v.oldPassword, newPassword: v.newPassword });
      reset();
    } catch { /* handled in mutation */ }
  };

  const PasswordField = ({
    id,
    label,
    reg,
    error,
    showKey,
  }: {
    id: string;
    label: string;
    reg: ReturnType<typeof register>;
    error?: string;
    showKey: 'old' | 'new' | 'confirm';
  }) => (
    <div>
      <label htmlFor={id} className={LBL}>{label}</label>
      {/* Relative wrapper so the eye button is positioned inside the 40px input */}
      <div className="relative">
        <input
          id={id}
          type={show[showKey] ? 'text' : 'password'}
          {...reg}
          className={INPUT_BASE}
          placeholder="••••••••"
          autoComplete={showKey === 'old' ? 'current-password' : 'new-password'}
        />
        {/* Eye icon — absolutely centered vertically inside the 40px input */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => ({ ...s, [showKey]: !s[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show[showKey] ? 'Hide password' : 'Show password'}
        >
          {show[showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p className="flex items-center gap-1 mt-1.5 text-xs text-rose-500">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border bg-card rounded-xl p-6 space-y-5"
    >
      {/* ── Section header: 16px 600 ── */}
      <div className="pb-3 border-b border-border">
        <h2 className="text-base font-semibold text-foreground leading-tight">
          Change Password
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Use a strong password with uppercase letters, lowercase letters, and numbers.
        </p>
      </div>

      <PasswordField
        id="old-password"
        label="Current Password"
        reg={register('oldPassword')}
        error={errors.oldPassword?.message}
        showKey="old"
      />
      <PasswordField
        id="new-password"
        label="New Password"
        reg={register('newPassword')}
        error={errors.newPassword?.message}
        showKey="new"
      />
      <PasswordField
        id="confirm-password"
        label="Confirm New Password"
        reg={register('confirmPassword')}
        error={errors.confirmPassword?.message}
        showKey="confirm"
      />

      {/* Button — right-aligned, matches primary button spec */}
      <div className="flex justify-end pt-3 border-t border-border">
        <button
          type="submit"
          disabled={changePasswordMutation.isPending}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {changePasswordMutation.isPending ? (
            <div className="h-4 w-4 border-2 border-t-transparent border-primary-foreground rounded-full animate-spin" />
          ) : (
            <Key className="h-4 w-4" />
          )}
          {changePasswordMutation.isPending ? 'Updating...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
}
