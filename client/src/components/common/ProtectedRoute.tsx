import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import Loader from './Loader.js';

interface Props {
  children: React.ReactNode;
}

/**
 * Guards any route subtree behind JWT authentication.
 * While hydrating (app boot), renders a full-screen spinner.
 * Unauthenticated visitors are redirected to /login, preserving the target path.
 */
export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isHydrated, isLoading, hydrate } = useAuthStore();
  const location = useLocation();

  // Trigger one-time boot hydration to validate stored tokens
  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [isHydrated, hydrate]);

  // Still verifying stored token
  if (!isHydrated || isLoading) {
    return <Loader fullscreen />;
  }

  // Unauthenticated → send to login, remembering the intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
