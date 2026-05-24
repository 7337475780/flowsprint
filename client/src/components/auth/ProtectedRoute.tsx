import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import Loader from '../common/Loader.js';
import { Role, Permission, hasPermission, hasRole } from '../../lib/permissions.js';
import { ShieldAlert } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requiredPermission?: Permission;
}

/**
 * Enhanced Protected Route Guard for dynamic Role and Permission Gating.
 * Restricts address-bar entry and renders a premium "Access Denied" screen if unauthorized.
 */
export default function ProtectedRoute({ children, allowedRoles, requiredPermission }: Props) {
  const { user, isAuthenticated, isHydrated, isLoading } = useAuthStore();
  const location = useLocation();

  if (!isHydrated || isLoading) {
    return <Loader fullscreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 1. Validate Roles Gate
  if (allowedRoles && !hasRole(user, allowedRoles)) {
    return <AccessDeniedScreen requiredRole={allowedRoles.join(' or ')} />;
  }

  // 2. Validate Permissions Gate
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return <AccessDeniedScreen requiredPermission={requiredPermission} />;
  }

  return <>{children}</>;
}

function AccessDeniedScreen({ requiredRole, requiredPermission }: { requiredRole?: string; requiredPermission?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 py-12">
      <div className="bg-card/45 border p-8 rounded-2xl shadow-3xs max-w-md text-center space-y-4 animate-in fade-in duration-200">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
          <ShieldAlert className="h-6 w-6" />
        </div>
        
        <div className="space-y-1.5">
          <h2 className="font-heading font-extrabold text-sm text-foreground tracking-tight">
            Security Privilege Restriction
          </h2>
          <p className="text-3xs text-muted-foreground leading-relaxed">
            Your user account role does not possess the active clearance level required to view this panel.
          </p>
        </div>

        <div className="bg-secondary/40 border p-3.5 rounded-xl text-left text-4xs font-mono text-muted-foreground space-y-1">
          <div><span className="text-foreground font-bold">Policy:</span> Access Denied</div>
          {requiredRole && <div><span className="text-foreground font-bold">Required Role:</span> {requiredRole}</div>}
          {requiredPermission && <div><span className="text-foreground font-bold">Required Clearance:</span> {requiredPermission}</div>}
        </div>
      </div>
    </div>
  );
}
