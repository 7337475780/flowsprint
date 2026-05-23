import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../api/authApi.js';
import { getCurrentUser, logout as apiLogout } from '../api/authApi.js';

interface AuthState {
  user:            User | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  isHydrated:      boolean;

  // Actions
  setCredentials: (user: User, token: string) => void;
  setUser:        (user: User)                => void;
  logout:         ()                          => void;
  hydrate:        ()                          => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,
      isLoading:       false,
      isHydrated:      false,

      /**
       * Called on successful login or register.
       * Persists the token to localStorage for the Axios interceptor.
       */
      setCredentials: (user, token) => {
        localStorage.setItem('fs_token', token);
        set({ user, token, isAuthenticated: true, isHydrated: true });
      },

      /** Update only the user profile (e.g. after profile edit). */
      setUser: (user) => set({ user }),

      /** Destroy session both client-side and server-side. */
      logout: () => {
        apiLogout().catch(() => {}); // best-effort
        localStorage.removeItem('fs_token');
        localStorage.removeItem('fs_user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      /**
       * Called once on app boot.
       * If a token is found in storage, verify it against /auth/me.
       */
      hydrate: async () => {
        const token = localStorage.getItem('fs_token') || get().token;
        if (!token) {
          set({ isHydrated: true });
          return;
        }
        set({ isLoading: true });
        try {
          const user = await getCurrentUser();
          set({ user, token, isAuthenticated: true });
        } catch {
          // Token is stale — clean up quietly
          localStorage.removeItem('fs_token');
          set({ user: null, token: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false, isHydrated: true });
        }
      },
    }),
    {
      name:    'fs-auth',
      // Only persist the raw token; user will be re-fetched on hydrate
      partialize: (state) => ({ token: state.token }),
    }
  )
);
