import { useState } from 'react';
import { ShieldAlert, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../../store/authStore.js';

export default function AccountDangerZone() {
  const logout = useAuthStore((s) => s.logout);
  const [confirmValue, setConfirmValue] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmValue !== 'DEACTIVATE') {
      toast.error('Please enter "DEACTIVATE" exactly to confirm.');
      return;
    }

    setIsDeleting(true);
    // Simulate server deactivation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsDeleting(false);
    setShowConfirmModal(false);
    toast.success('Your workspace account profile has been successfully deactivated.');

    // Wipe local credentials and log out
    setTimeout(() => {
      logout();
    }, 1500);
  };

  return (
    <div className="border border-rose-500/25 bg-rose-500/4 rounded-2xl p-6 shadow-2xs space-y-4">
      <div>
        <h3 className="font-heading font-extrabold text-sm text-rose-500 tracking-tight flex items-center gap-2 select-none">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
          Workspace Danger Zone
        </h3>
        <p className="text-3xs text-muted-foreground font-medium mt-0.5 max-w-xl">
          Actions performed here are highly destructive. Deactivating your profile wipes credentials, terminates sessions, and disables access.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-rose-500/10 pt-4">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-foreground block leading-tight">
            Deactivate this FlowSprint profile
          </span>
          <p className="text-3xs text-muted-foreground max-w-md leading-normal">
            Your tasks, activity changelogs, and file attachments will persist under project histories, but your access is suspended.
          </p>
        </div>

        <button
          onClick={() => setShowConfirmModal(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-600 font-extrabold text-3xs uppercase tracking-wider rounded-lg shadow-2xs transition-all active:scale-95 shrink-0 self-start sm:self-center"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Deactivate Profile</span>
        </button>
      </div>

      {/* Confirm Deactivation Modal Lightbox */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isDeleting && setShowConfirmModal(false)} />

          <div className="relative w-full max-w-sm bg-card border rounded-2xl p-6 shadow-2xl z-10 space-y-4.5 animate-in zoom-in-95 duration-250">
            <div className="text-center space-y-2">
              <div className="h-11 w-11 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto shadow-3xs animate-bounce">
                <ShieldAlert className="h-5.5 w-5.5" />
              </div>
              <h4 className="font-heading font-extrabold text-sm text-foreground tracking-tight select-none">
                Deactivate Profile Access?
              </h4>
              <p className="text-3xs text-muted-foreground leading-normal">
                This suspends all workspace capabilities. To confirm, please type <span className="font-mono text-rose-500 font-extrabold select-all bg-secondary/50 px-1 py-0.5 rounded">DEACTIVATE</span> below.
              </p>
            </div>

            <input
              type="text"
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              disabled={isDeleting}
              className="w-full px-3 py-2 text-xs rounded-xl border bg-background text-foreground outline-none text-center font-mono font-bold tracking-widest uppercase focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500/60 transition-all"
              placeholder="TYPE HERE"
            />

            <div className="flex gap-2.5 pt-1.5">
              <button
                disabled={isDeleting}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-3 py-2 bg-secondary border text-foreground font-bold text-3xs uppercase tracking-wider rounded-lg hover:bg-secondary/70 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting || confirmValue !== 'DEACTIVATE'}
                onClick={handleDeleteAccount}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500 text-white border border-rose-600 font-bold text-3xs uppercase tracking-wider rounded-lg shadow-sm hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-45"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>Confirm suspended</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
