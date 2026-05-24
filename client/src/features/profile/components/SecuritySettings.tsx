import { useState } from 'react';
import PasswordForm from './PasswordForm.js';
import { useAuthStore } from '../../../store/authStore.js';
import { useLogoutAllDevicesMutation } from '../hooks/useProfile.js';
import { Monitor, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils.js';

export default function SecuritySettings() {
  const user = useAuthStore((s) => s.user);
  const logoutAllMutation = useLogoutAllDevicesMutation();
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  // Active Sessions list
  const sessions = user?.activeSessions || [
    {
      _id: 'default-active-session',
      device: 'Chrome Browser (Windows 11)',
      ip: '192.168.1.45',
      lastActive: new Date().toISOString(),
    },
  ];

  const handleRevokeAll = async () => {
    if (!confirmRevoke) {
      setConfirmRevoke(true);
      setTimeout(() => setConfirmRevoke(false), 4000);
      return;
    }
    logoutAllMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* 1. Change password form */}
      <PasswordForm />

      {/* 2. Session list panel */}
      <div className="bg-card/65 backdrop-blur-xs border p-6 rounded-2xl shadow-3xs space-y-5 relative overflow-hidden">
        {logoutAllMutation.isPending && (
          <div className="absolute inset-0 bg-card/45 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in fade-in duration-200">
            <Loader2 className="h-7 w-7 text-primary animate-spin mb-2" />
            <span className="text-3xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
              Revoking active tokens...
            </span>
          </div>
        )}

        {/* Section header — clearly larger than field labels */}
        <div>
          <h3 className="font-heading font-extrabold text-base text-foreground tracking-tight select-none">
            Active Session Tokens ({sessions.length})
          </h3>
          <p className="text-3xs text-muted-foreground font-medium mt-0.5">
            Monitor browser logs and device clients linked to this identity.
          </p>
        </div>

        {/* Session list — each row separated by border-b */}
        <div className="space-y-0">
          {sessions.map((sess: any, idx: number) => {
            const isLast = idx === sessions.length - 1;
            return (
              <div
                key={sess._id}
                className={cn(
                  'flex gap-3.5 items-start py-4',
                  !isLast && 'border-b border-white/10'
                )}
              >
                <div className="h-9 w-9 rounded-xl border bg-secondary/35 text-primary flex items-center justify-center shrink-0 shadow-3xs">
                  <Monitor className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-foreground truncate block leading-tight">
                    {sess.device}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 font-mono text-4xs font-medium text-muted-foreground leading-none">
                    <span>IP: {sess.ip}</span>
                    <span className="h-1 w-1 bg-secondary rounded-full" />
                    <span>Last active: {new Date(sess.lastActive).toLocaleString()}</span>
                  </div>
                </div>
                <div className="self-center shrink-0">
                  <span className="text-4xs font-mono font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded uppercase tracking-wider">
                    Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Revoke All Sessions — mt-6 top margin from session list, outlined button style */}
        <div className="mt-6 border-t border-border pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 leading-none select-none">
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
              Revoke other workspace access
            </span>
            <p className="text-3xs text-muted-foreground max-w-md leading-normal">
              Clicking below will force logout all other devices. You will be required to re-authenticate with credentials.
            </p>
          </div>

          {/* Outlined danger button — consistent with outlined styles elsewhere in the app */}
          <button
            onClick={handleRevokeAll}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 px-4 py-2 border font-extrabold text-3xs uppercase tracking-wider rounded-lg transition-all active:scale-95 shrink-0 self-start sm:self-center',
              confirmRevoke
                ? 'bg-rose-500 text-white border-rose-600 hover:bg-rose-600 animate-pulse'
                : 'bg-transparent text-rose-400 border-rose-500/40 hover:bg-rose-500/10 hover:border-rose-500/60'
            )}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{confirmRevoke ? 'Confirm Sign Out All?' : 'Sign out other devices'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
